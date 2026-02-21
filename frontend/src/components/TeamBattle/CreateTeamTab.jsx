export const CreateTeamTab = ({ teamName, setTeamName, teamSize, setTeamSize, teamLoading, onCreateTeam }) => {
  return (
    <div className="max-w-xl mx-auto premium-card p-12 lg:p-16" style={{ borderRadius: "2px" }}>
      <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-6">Create New Cluster</div>
      <h2 className="text-4xl font-black text-white mb-10 tracking-tighter uppercase font-[family:var(--font-heading)]">Assemble Team</h2>

      <form onSubmit={onCreateTeam} className="space-y-10">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">
            Cluster Designation
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g., SYNC_LOGIC_01"
            className="w-full bg-white/[0.02] border border-white/5 px-6 py-4 text-white focus:outline-none focus:border-[var(--color-primary)]/40 transition-all font-mono"
            style={{ borderRadius: "2px" }}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">
            Cluster Capacity
          </label>
          <div className="grid grid-cols-4 gap-4">
            {[2, 3, 4, 5].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setTeamSize(size)}
                className={`py-4 px-4 font-bold transition-all text-xs border ${teamSize === size
                    ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)]"
                    : "bg-white/[0.02] text-slate-500 border-white/5 hover:text-white"
                  }`}
                style={{ borderRadius: "2px" }}
              >
                {size}v{size}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={teamLoading}
          className="w-full py-5 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest text-xs disabled:opacity-20 hover:bg-white transition-all transform active:scale-95 shadow-xl"
          style={{ borderRadius: "2px" }}
        >
          {teamLoading ? "Allocating Resources..." : "Initialize Cluster →"}
        </button>
      </form>
    </div>
  );
};
