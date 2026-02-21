export const MatchCard = ({ match, user, onSelectMatch, getMatchStatus, isUserInMatch }) => {
  return (
    <div
      className="bg-white/[0.01] border border-white/5 p-8 transition-all hover:bg-white/[0.02] hover:border-white/20 group cursor-pointer relative overflow-hidden"
      onClick={() => {
        if (isUserInMatch(match) && match.status !== 'completed') {
          onSelectMatch(match);
        }
      }}
      style={{ borderRadius: "2px" }}
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2">Logic Duel</div>
          <div className="text-sm font-bold text-white uppercase tracking-widest">
            {match.player1?.username} <span className="text-slate-700 px-1 font-mono">VS</span> {match.player2?.username}
          </div>
        </div>
        <div className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 border tabular-nums ${match.status === 'completed'
            ? 'border-[var(--color-success)] text-[var(--color-success)]'
            : match.submissions?.length > 0
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-white/20 text-slate-500'
          }`}>
          {getMatchStatus(match)}
        </div>
      </div>

      <div className="mb-8 p-4 bg-white/[0.01] border border-white/[0.03]">
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1">Target Module:</p>
        <p className="text-sm font-bold text-white hover:text-[var(--color-primary)] transition-colors">
          {match.problem?.title}
        </p>
      </div>

      {match.winnerId && (
        <div className="pt-6 border-t border-white/5 flex items-baseline gap-3">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Resolved Victory:</p>
          <p className="text-xs font-black text-[var(--color-primary)] uppercase tracking-widest">
            {match.winnerId === match.player1Id
              ? match.player1?.username
              : match.player2?.username}
          </p>
        </div>
      )}

      {isUserInMatch(match) && match.status !== 'completed' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectMatch(match);
          }}
          className="mt-8 w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-lg"
          style={{ borderRadius: "2px" }}
        >
          Initialize Submission
        </button>
      )}
    </div>
  );
};
