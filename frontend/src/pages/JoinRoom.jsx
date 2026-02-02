// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { joinBattle } from "../../store/api/battle.thunk";

// const JoinRoom = () => {
//   const [code, setCode] = useState("");
//   const [loading, setLoading] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     // Only allow numbers, max 6 digits
//     const value = e.target.value.replace(/\D/g, "").slice(0, 6);
//     setCode(value);
//   };

//   const handleJoin = async (e) => {
//     e.preventDefault();
//     if (code.length !== 6) return;

//     try {
//       setLoading(true);
//       const res = await dispatch(joinBattle({ battleCode: code })).unwrap();
//       navigate(`/battle/${res.id}/ide`);
//     } catch (err) {
//       alert("Invalid Room Code");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center px-4">
//       <div className="bg-[#15151a] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-10 text-center">

//         <h1 className="text-4xl font-bold text-white mb-4">🎮 Join Room</h1>
//         <p className="text-gray-400 mb-8">
//           Enter the 6-digit room code shared by your friend
//         </p>

//         <form onSubmit={handleJoin} className="space-y-6">
//           <input
//             type="text"
//             value={code}
//             onChange={handleChange}
//             placeholder="••••••"
//             className="w-full text-center tracking-[12px] text-3xl py-4 rounded-xl bg-[#0f0f12] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
//           />

//           <button
//             type="submit"
//             disabled={loading || code.length !== 6}
//             className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg disabled:opacity-40"
//           >
//             {loading ? "Joining..." : "Enter Battle"}
//           </button>
//         </form>

//         <p className="text-gray-500 text-sm mt-6">
//           Room codes are case-sensitive and expire after battle ends
//         </p>
//       </div>
//     </div>
//   );
// };

// export default JoinRoom;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [publicRooms, setPublicRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("getPublicRooms");

    socket.on("publicRoomsList", (rooms) => {
      setPublicRooms(rooms);
    });

    socket.on("battleStarted", (roomId) => {
      navigate(`/battle/${roomId}/ide`);
    });

    return () => {
      socket.off("publicRoomsList");
      socket.off("battleStarted");
    };
  }, [navigate]);

  const joinByCode = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    setStatus("Joining room...");
    socket.emit("joinBattle", roomCode.trim());
  };

  const joinPublicRoom = (id) => {
    setStatus("Joining public room...");
    socket.emit("joinBattle", id);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-10">

        <h1 className="text-3xl font-semibold text-center tracking-wide">
          Join Battle Room
        </h1>

        {/* Public Rooms */}
        {publicRooms.length > 0 && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg mb-4 text-gray-400">Public Rooms</h2>

            <div className="space-y-3">
              {publicRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex justify-between items-center bg-[#141414] border border-gray-800 rounded-md px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-sm tracking-wider">{room.id}</p>
                    <p className="text-xs text-gray-500">
                      Host: {room.host} | {room.players}/{room.maxPlayers} players
                    </p>
                  </div>

                  <button
                    onClick={() => joinPublicRoom(room.id)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center">
          <div className="flex-1 h-px bg-gray-800"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-800"></div>
        </div>

        {/* Join by Code */}
        <form
          onSubmit={joinByCode}
          className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 space-y-5"
        >
          <h2 className="text-lg text-gray-400">Enter Room Code</h2>

          <input
            type="text"
            placeholder="ROOM CODE"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-full bg-[#141414] border border-gray-800 rounded px-4 py-3 text-center font-mono tracking-widest focus:outline-none focus:border-gray-600"
          />

          <button className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded">
            Join Room
          </button>

          {status && (
            <p className="text-sm text-center text-gray-500">{status}</p>
          )}
        </form>

      </div>
    </div>
  );
};

export default JoinRoom;
