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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {userTeams.map((team) => (
        <div
          key={team.id}
          className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white">{team.name}</h3>
              <p className="text-gray-400 text-sm">
                Created by: <span className="text-blue-400">{team.creator?.username}</span>
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Team Code:</p>
            <div className="flex items-center gap-2">
              <code className="bg-gray-900 px-3 py-2 rounded font-mono text-lg font-bold text-green-400">
                {team.teamCode}
              </code>
              <button
                onClick={() => copyToClipboard(team.teamCode)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">
              Members ({team.members?.length || 0})
            </p>
            <div className="space-y-2">
              {team.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between bg-gray-900 p-2 rounded">
                  <div>
                    <p className="text-white font-semibold">{member.user?.username}</p>
                    <p className="text-xs text-gray-500">Rank: {member.user?.rankPoints}</p>
                  </div>
                  {member.user?.id === team.creatorId && (
                    <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                      Creator
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {team.creatorId !== user?.id && (
              <button
                onClick={() => onLeaveTeam(team.id)}
                disabled={teamLoading}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50"
              >
                Leave Team
              </button>
            )}
            {team.creatorId === user?.id && (
              <button
                onClick={() => onDisbandTeam(team.id)}
                disabled={teamLoading}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50"
              >
                Disband
              </button>
            )}
            <button
              onClick={() => onStartBattle(team)}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Start Battle
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
