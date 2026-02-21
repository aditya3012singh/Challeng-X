export const MyTeamsTab = ({
  userTeams,
  user,
  teamLoading,
  onLeaveTeam,
  onDisbandTeam,
  onStartBattle,
  copyToClipboard,
}) => {
  if (userTeams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No teams yet. Create or join one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {userTeams.map((team) => (
        <div
          key={team.id}
          className="premium-card p-10 group"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="text-[9px] font-bold text-[var(--color-primary)] tracking-[0.3em] mb-2 uppercase opacity-50">Team Alpha</div>
              <h3 className="text-3xl font-bold text-white tracking-tight">{team.name}</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                Leader: <span className="text-white">{team.creator?.username}</span>
              </p>
            </div>
          </div>

          <div className="mb-10 p-6 bg-white/[0.02] border border-white/5" style={{ borderRadius: "2px" }}>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-3">Synchronization Code</p>
            <div className="flex items-center justify-between">
              <code className="text-2xl font-black text-[var(--color-primary)] tracking-[0.2em] font-mono">
                {team.teamCode}
              </code>
              <button
                onClick={() => copyToClipboard(team.teamCode)}
                className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
              >
                [ Copy Code ]
              </button>
            </div>
          </div>

          <div className="mb-12">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-2">
              Sync Members ({team.members?.length || 0} / 5)
            </p>
            <div className="space-y-3">
              {team.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]/40 group-hover:bg-[var(--color-primary)] transition-colors"></div>
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">{member.user?.username}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-600 tabular-nums">ELO {member.user?.rankPoints}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            {team.creatorId !== user?.id && (
              <button
                onClick={() => onLeaveTeam(team.id)}
                disabled={teamLoading}
                className="flex-1 py-4 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white hover:border-white transition-all disabled:opacity-20"
                style={{ borderRadius: "2px" }}
              >
                Leave Cluster
              </button>
            )}
            {team.creatorId === user?.id && (
              <button
                onClick={() => onDisbandTeam(team.id)}
                disabled={teamLoading}
                className="flex-1 py-4 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white hover:border-white transition-all disabled:opacity-20"
                style={{ borderRadius: "2px" }}
              >
                Disband Node
              </button>
            )}
            <button
              onClick={() => onStartBattle(team)}
              className="flex-1 py-4 bg-[var(--color-primary)] text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all shadow-lg"
              style={{ borderRadius: "2px" }}
            >
              Initialize Battle
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
