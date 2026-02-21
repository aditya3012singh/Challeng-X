import { MatchCard } from "./MatchCard";

export const TournamentDisplay = ({
  currentBattle,
  currentMatches,
  user,
  onSelectMatch,
  onStartBattle,
  onCompleteBattle,
  onSelectMatchForCode,
  getMatchStatus,
  isUserInMatch,
  battleLoading,
  setActiveTab,
}) => {
  if (!currentBattle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">
          No active tournaments. Create one to get started!
        </p>
        <button
          onClick={() => setActiveTab("myTeams")}
          className="py-2 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          Select Team
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <div className="space-y-12 animate-in fade-in duration-700">
        {/* Tournament Header */}
        <div className="premium-card p-12 lg:p-16 relative overflow-hidden" style={{ borderRadius: "2px" }}>
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <div>
              <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Active Engagement // Tournament</div>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">
                {currentBattle.team1?.name} <span className="text-slate-600 px-4 font-mono">VS</span> {currentBattle.team2?.name}
              </h3>
            </div>
            <div className="text-center md:text-right">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Synchronization Key</div>
              <div className="font-mono text-xl font-black text-white tracking-widest mb-4 bg-white/[0.02] px-6 py-2 border border-white/5 inline-block">{currentBattle.battleCode}</div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${currentBattle.status === 'active' ? 'text-[var(--color-success)]' : 'text-[var(--color-primary)]'
                }`}>
                {currentBattle.status}
              </p>
            </div>
          </div>

          {/* Tournament Scoreboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div className="p-10 border-l-4 border-[var(--color-primary)] bg-white/[0.01] shadow-2xl relative group">
              <div className="absolute top-4 right-6 text-[9px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-white transition-colors">Cluster One</div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">{currentBattle.team1?.name}</p>
              <div className="flex items-baseline gap-4">
                <p className="text-7xl font-black text-white tabular-nums">{currentBattle.team1Wins || 0}</p>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Wins Recorded</p>
              </div>
            </div>
            <div className="p-10 border-l-4 border-white/10 bg-white/[0.01] shadow-2xl relative group">
              <div className="absolute top-4 right-6 text-[9px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-white transition-colors">Cluster Two</div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">{currentBattle.team2?.name}</p>
              <div className="flex items-baseline gap-4">
                <p className="text-7xl font-black text-white tabular-nums">{currentBattle.team2Wins || 0}</p>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Wins Recorded</p>
              </div>
            </div>
          </div>

          {/* Matches Grid */}
          <div className="mb-16">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mb-8 border-b border-white/5 pb-4">Logic Duels // 1V1</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {currentMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  user={user}
                  onSelectMatch={() => {
                    if (isUserInMatch(match) && match.status !== 'completed') {
                      onSelectMatchForCode(match);
                    }
                  }}
                  getMatchStatus={getMatchStatus}
                  isUserInMatch={isUserInMatch}
                />
              ))}
            </div>
          </div>

          {/* Tournament Controls */}
          <div className="pt-12 border-t border-white/[0.03]">
            {currentBattle.status === 'pending' && (
              <button
                onClick={onStartBattle}
                disabled={battleLoading}
                className="w-full py-6 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all transform active:scale-95 shadow-xl"
                style={{ borderRadius: "2px" }}
              >
                {battleLoading ? "Initializing..." : "Engage Tournament Engine →"}
              </button>
            )}

            {currentBattle.status === 'active' && (
              <button
                onClick={onCompleteBattle}
                disabled={battleLoading}
                className="w-full py-6 border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:border-white hover:bg-white/5 transition-all"
                style={{ borderRadius: "2px" }}
              >
                {battleLoading ? "Resolving..." : "Conclude Battle Protocol →"}
              </button>
            )}

            {currentBattle.status === 'completed' && (
              <div className="p-10 bg-white/[0.01] border border-[var(--color-primary)]/20 text-center" style={{ borderRadius: "2px" }}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Official Result</p>
                <p className="text-3xl font-black text-[var(--color-primary)] uppercase tracking-tighter">
                  {currentBattle.team1Wins > currentBattle.team2Wins
                    ? `${currentBattle.team1?.name} DOMINANT`
                    : currentBattle.team2Wins > currentBattle.team1Wins
                      ? `${currentBattle.team2?.name} DOMINANT`
                      : "PROTOCOL TIE // EQUALIZED"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
