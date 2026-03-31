import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { joinBattle } from "../../store/api/battle.thunk";
import { toast } from "react-hot-toast";

const JoinRoom = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    // Only allow numbers, max 6 digits
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setLoading(true);
      const res = await dispatch(joinBattle({ battleCode: code })).unwrap();
      navigate(`/battle/${res.id}/ide`);
    } catch (err) {
      toast.error(err.message || "Invalid Room Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center px-4">
      {/* MINIMALIST BACKGROUND DECOR */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-primary)] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className="premium-card w-full max-w-md p-16 text-center shadow-2xl relative z-10" style={{ borderRadius: "2px" }}>
        <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-6">Battle Protocol</div>

        <h1 className="text-5xl font-black text-[var(--color-text-main)] mb-4 tracking-tighter uppercase font-[family:var(--font-heading)]">
          Join Room
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm font-light mb-12">
          Enter the synchronization code to join the arena.
        </p>

        <form onSubmit={handleJoin} className="space-y-8">
          <div className="relative group">
            <input
              type="text"
              value={code}
              onChange={handleChange}
              placeholder="000 000"
              className="w-full text-center tracking-[0.4em] text-4xl py-6 bg-white/[0.02] border border-white/5 text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)]/40 transition-all font-mono"
              style={{ borderRadius: "2px" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-5 bg-[var(--color-primary)] text-black font-bold uppercase tracking-[0.2em] text-xs disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white transition-all transform active:scale-95 shadow-xl"
            style={{ borderRadius: "2px" }}
          >
            {loading ? "Initializing..." : "Establish Connection →"}
          </button>
        </form>

        <div className="mt-12 pt-12 border-t border-white/[0.03]">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">
            Security: 256-Bit Encrypted Link
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
