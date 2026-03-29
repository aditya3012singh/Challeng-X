import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createTeamBattleByLeader } from "../../../store/api/teamBattle.thunk";
import { toast } from "react-hot-toast";

export const CreateBattleModal = ({ isOpen, onClose, teams }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.teamBattle);
  const [team1Id, setTeam1Id] = useState("");
  const [maxTeamSize, setMaxTeamSize] = useState(2);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team1Id) {
      toast.error("Please select a team");
      return;
    }

    const result = await dispatch(
      createTeamBattleByLeader({ team1Id, maxTeamSize })
    );

    if (result.payload?.id) {
      // Navigate to battle room
      onClose();
      navigate(`/battle-room/${result.payload.id}`);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    toast.success("Join code copied!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="premium-card w-full max-w-xl p-12 lg:p-16 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: "2px" }}
      >
        <button
          className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="mb-12">
          <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Battle Protocol // New</div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">
            {showJoinCode ? "Shared Stream" : "Host Battle"}
          </h2>
        </div>

        <div className="modal-body">
          {showJoinCode ? (
            <div className="text-center">
              <p className="text-slate-400 text-sm font-light mb-10">Battle link has been established. Distribute to cluster nodes.</p>

              <div className="p-8 bg-white/[0.02] border border-white/5 mb-10" style={{ borderRadius: "2px" }}>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-4">Synchronization Hash</div>
                <div className="flex items-center justify-center gap-8">
                  <span className="text-5xl font-black text-[var(--color-primary)] tracking-[0.2em] font-mono">{joinCode}</span>
                  <button
                    className="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-white/30 text-white transition-all"
                    onClick={handleCopyCode}
                    style={{ borderRadius: "2px" }}
                  >
                    📋
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-12">
                Note: This code grants administrative entry to the battle.
              </p>

              <button
                className="w-full py-5 border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all"
                onClick={() => {
                  setShowJoinCode(false);
                  onClose();
                }}
                style={{ borderRadius: "2px" }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Select Target Team</label>
                <select
                  className="w-full bg-white/[0.02] border border-white/5 py-5 px-6 text-white focus:outline-none focus:border-[var(--color-primary)]/40 transition-all font-mono appearance-none"
                  value={team1Id}
                  onChange={(e) => setTeam1Id(e.target.value)}
                  required
                  style={{ borderRadius: "2px" }}
                >
                  <option value="" className="bg-[#050505]">-- Choose a team --</option>
                  {teams?.map((team) => (
                    <option key={team.id} value={team.id} className="bg-[#050505]">
                      {team.name} ({team.members?.length || 0} Members)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Cluster Capacity</label>
                <select
                  className="w-full bg-white/[0.02] border border-white/5 py-5 px-6 text-white focus:outline-none focus:border-[var(--color-primary)]/40 transition-all font-mono appearance-none"
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                  style={{ borderRadius: "2px" }}
                >
                  <option value={1} className="bg-[#050505]">1v1 Stream</option>
                  <option value={2} className="bg-[#050505]">2v2 Stream</option>
                  <option value={3} className="bg-[#050505]">3v3 Stream</option>
                  <option value={4} className="bg-[#050505]">4v4 Stream</option>
                  <option value={5} className="bg-[#050505]">5v5 Stream</option>
                </select>
              </div>

              {error && <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</div>}

              <button
                type="submit"
                className="w-full py-5 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest text-xs disabled:opacity-20 hover:bg-white transition-all transform active:scale-95 shadow-xl"
                disabled={loading}
                style={{ borderRadius: "2px" }}
              >
                {loading ? "Allocating..." : "Host Battle Node →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
