export const JoinTeamTab = ({ joinCode, setJoinCode, teamLoading, onJoinTeam }) => {
  return (
    <div className="max-w-xl mx-auto premium-card p-12 lg:p-16" style={{ borderRadius: "2px" }}>
      <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-6">Proxy Connection</div>
      <h2 className="text-4xl font-black text-white mb-10 tracking-tighter uppercase font-[family:var(--font-heading)]">Join Cluster</h2>

      <form onSubmit={onJoinTeam} className="space-y-10">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4 text-center">
            Cluster Handshake Code
          </label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="000 000"
            className="w-full bg-white/[0.02] border border-white/5 px-6 py-6 text-white text-center font-mono text-4xl tracking-widest focus:outline-none focus:border-[var(--color-primary)]/40 transition-all"
            maxLength="6"
            style={{ borderRadius: "2px" }}
          />
        </div>

        <button
          type="submit"
          disabled={teamLoading || joinCode.length !== 6}
          className="w-full py-5 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest text-xs disabled:opacity-20 hover:bg-white transition-all transform active:scale-95 shadow-xl"
          style={{ borderRadius: "2px" }}
        >
          {teamLoading ? "Verifying Keys..." : "Synchronize with Cluster →"}
        </button>
      </form>

      <div className="mt-12 p-8 bg-white/[0.02] border border-white/5" style={{ borderRadius: "2px" }}>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-4 text-white">Protocol Memo:</h4>
        <ul className="text-[10px] text-slate-500 font-bold uppercase tracking-widest space-y-3">
          <li className="flex gap-4"><span className="text-[var(--color-primary)]">01 //</span> Secure a 6-digit handshake from your leader</li>
          <li className="flex gap-4"><span className="text-[var(--color-primary)]">02 //</span> Maintain synchronization during logic evaluation</li>
          <li className="flex gap-4"><span className="text-[var(--color-primary)]">03 //</span> Cluster units solve problems in parallel</li>
        </ul>
      </div>
    </div>
  );
};
