import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAvailableBattles, joinTeamBattleWithCode } from "../../../store/api/teamBattle.thunk";
import { toast } from "react-hot-toast";

export const JoinBattleModal = ({ isOpen, onClose, teams }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.teamBattle);
  const { availableBattles } = useSelector((state) => state.teamBattle);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [joinMethod, setJoinMethod] = useState("code"); // "code" or "browse"
  const [selectedBattle, setSelectedBattle] = useState(null);

  useEffect(() => {
    if (isOpen && joinMethod === "browse") {
      dispatch(getAvailableBattles());
    }
  }, [isOpen, joinMethod, dispatch]);

  const handleJoinWithCode = async (e) => {
    e.preventDefault();
    if (!joinCodeInput || !team2Id) {
      toast.error("Please enter join code and select a team");
      return;
    }

    const result = await dispatch(
      joinTeamBattleWithCode({
        joinCode: joinCodeInput.toUpperCase(),
        team2Id,
      })
    );

    if (result.payload?.id) {
      onClose();
      navigate(`/battle-room/${result.payload.id}`);
    }
  };

  const handleJoinBattle = async (battleId) => {
    if (!team2Id) {
      toast.error("Please select a team first");
      return;
    }

    const battle = availableBattles.find((b) => b.id === battleId);
    if (battle) {
      const result = await dispatch(
        joinTeamBattleWithCode({
          joinCode: battle.joinCode,
          team2Id,
        })
      );

      if (result.payload?.id) {
        onClose();
        navigate(`/battle-room/${result.payload.id}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="premium-card w-full max-w-xl p-12 lg:p-16 relative overflow-hidden h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: "2px" }}
      >
        <button
          className="absolute top-8 right-8 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="mb-10">
          <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Battle Protocol // Join</div>
          <h2 className="text-4xl font-black text-[var(--color-text-main)] tracking-tighter uppercase font-[family:var(--font-heading)]">
            Sync Connection
          </h2>
        </div>

        <div className="flex gap-10 border-b border-white/[0.03] mb-10">
          <button
            className={`pb-4 px-2 text-[10px] font-bold tracking-[0.2em] transition-all relative uppercase ${joinMethod === "code" ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            onClick={() => setJoinMethod("code")}
          >
            Join with Code
            {joinMethod === "code" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-primary)]"></div>}
          </button>
          <button
            className={`pb-4 px-2 text-[10px] font-bold tracking-[0.2em] transition-all relative uppercase ${joinMethod === "browse" ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            onClick={() => setJoinMethod("browse")}
          >
            Browse Battles
            {joinMethod === "browse" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-primary)]"></div>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="mb-10">
            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.3em] mb-4">Identify Your Cluster</label>
            <select
              className="w-full bg-white/[0.02] border border-white/5 py-5 px-6 text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)]/40 transition-all font-mono appearance-none"
              value={team2Id}
              onChange={(e) => setTeam2Id(e.target.value)}
              required
              style={{ borderRadius: "2px" }}
            >
              <option value="" className="bg-[var(--color-bg-dark)]">-- Select Cluster Node --</option>
              {teams?.map((team) => (
                <option key={team.id} value={team.id} className="bg-[var(--color-bg-dark)]">
                  {team.name} ({team.members?.length || 0} Members)
                </option>
              ))}
            </select>
          </div>

          {joinMethod === "code" ? (
            <form onSubmit={handleJoinWithCode} className="space-y-10">
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.3em] mb-4 text-center">Enter Synchronization Hash</label>
                <input
                  type="text"
                  placeholder="000 000"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  maxLength="6"
                  className="w-full bg-white/[0.02] border border-white/5 py-6 px-6 text-[var(--color-text-main)] text-center font-mono text-4xl tracking-widest focus:outline-none focus:border-[var(--color-primary)]/40 transition-all"
                  style={{ borderRadius: "2px" }}
                />
              </div>

              {error && <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</div>}

              <button
                type="submit"
                className="w-full py-5 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest text-xs disabled:opacity-20 hover:bg-white transition-all transform active:scale-95 shadow-xl"
                disabled={loading}
                style={{ borderRadius: "2px" }}
              >
                {loading ? "Verifying..." : "Initialize Match →"}
              </button>
            </form>
          ) : (
            <div className="space-y-4 pb-4">
              {availableBattles?.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.02] border border-white/5" style={{ borderRadius: "2px" }}>
                  <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">No Active Battles Detected in Perimeter</p>
                </div>
              ) : (
                availableBattles.map((battle) => (
                  <div key={battle.id} className="p-6 bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all group" style={{ borderRadius: "2px" }}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-1">{battle.team1Name}</h3>
                        <p className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-[0.2em]">Created by {battle.createdBy}</p>
                      </div>
                      <div className="px-3 py-1 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-widest">
                        {battle.maxTeamSize}v{battle.maxTeamSize}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-widest uppercase">IDLE // {battle.joinCode}</div>
                      <button
                        className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all"
                        onClick={() => handleJoinBattle(battle.id)}
                        disabled={loading}
                        style={{ borderRadius: "2px" }}
                      >
                        {loading ? "..." : "Interfere"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
