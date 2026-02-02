import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { joinBattle } from "../../store/api/battle.thunk";

const JoinRoom = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value.trim();
    setCode(value);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setLoading(true);
      const res = await dispatch(joinBattle({ battleId: code })).unwrap();
      navigate(`/battle/${res.id}/ide`);
    } catch (err) {
      alert(err.message || "Invalid Room Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center px-4">
      <div className="bg-[#15151a] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-10 text-center">

        <h1 className="text-4xl font-bold text-white mb-4">🎮 Join Room</h1>
        <p className="text-gray-400 mb-8">
          Enter the battle ID to join the room
        </p>

        <form onSubmit={handleJoin} className="space-y-6">
          <input
            type="text"
            value={code}
            onChange={handleChange}
            placeholder="Enter Battle ID"
            className="w-full text-center text-lg py-4 rounded-xl bg-[#0f0f12] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Joining..." : "Enter Battle"}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-6">
          Get the battle ID from your friend who created the room
        </p>
      </div>
    </div>
  );
};

export default JoinRoom;
