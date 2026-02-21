export const TournamentCreationPanel = ({
  selectedTeam,
  selectedOpponent,
  availableTeams,
  onOpponentChange,
  onCreateBattle,
  battleLoading,
}) => {
  if (!selectedTeam) return null;

  return (
    <div className="premium-card p-12 lg:p-16 relative overflow-hidden" style={{ borderRadius: "2px" }}>
      <div className="mb-10">
        <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Engagement Config // Manual</div>
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">Assemble Tournament</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Origin Node</p>
          <div className="bg-white/[0.02] border border-white/5 px-6 py-5 text-white font-black uppercase tracking-widest text-sm" style={{ borderRadius: "2px" }}>
            {selectedTeam.name}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Target Node</p>
          <select
            value={selectedOpponent?.id || ""}
            onChange={(e) => {
              const opponent = availableTeams.find((t) => t.id === e.target.value);
              onOpponentChange(opponent);
            }}
            className="w-full bg-[#050505] border border-white/10 px-6 py-5 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all appearance-none"
            style={{ borderRadius: "2px" }}
          >
            <option value="">-- Select Target --</option>
            {availableTeams
              .filter(
                (t) =>
                  t.id !== selectedTeam.id &&
                  t.members.length === selectedTeam.members.length
              )
              .map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.members.length} VS {team.members.length})
                </option>
              ))}
          </select>
        </div>
      </div>

      <button
        onClick={onCreateBattle}
        disabled={!selectedOpponent || battleLoading}
        className="w-full py-6 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all transform active:scale-95 shadow-xl"
        style={{ borderRadius: "2px" }}
      >
        {battleLoading ? "Allocating..." : "Initialize Hybrid Battle Node →"}
      </button>
    </div>
  );
};
