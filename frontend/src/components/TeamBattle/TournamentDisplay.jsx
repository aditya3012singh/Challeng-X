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
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">
            {currentBattle.team1?.name} vs {currentBattle.team2?.name}
          </h3>
          <div className="text-right">
            <p className="text-sm text-gray-400">Code: {currentBattle.battleCode}</p>
            <p
              className={`text-lg font-bold ${
                currentBattle.status === 'active'
                  ? 'text-green-400'
                  : currentBattle.status === 'completed'
                  ? 'text-blue-400'
                  : 'text-yellow-400'
              }`}
            >
              {currentBattle.status?.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Tournament Scoreboard */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4 border-2 border-blue-500">
            <p className="text-sm text-gray-400 mb-2">{currentBattle.team1?.name}</p>
            <p className="text-3xl font-bold text-blue-400">
              {currentBattle.team1Wins || 0}
            </p>
            <p className="text-xs text-gray-500">Wins</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border-2 border-red-500">
            <p className="text-sm text-gray-400 mb-2">{currentBattle.team2?.name}</p>
            <p className="text-3xl font-bold text-red-400">
              {currentBattle.team2Wins || 0}
            </p>
            <p className="text-xs text-gray-500">Wins</p>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="mb-6">
          <h4 className="text-xl font-bold mb-4">1v1 Matches</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        {currentBattle.status === 'pending' && (
          <button
            onClick={onStartBattle}
            disabled={battleLoading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:opacity-50"
          >
            {battleLoading ? "Starting..." : "Start Tournament"}
          </button>
        )}

        {currentBattle.status === 'active' && (
          <button
            onClick={onCompleteBattle}
            disabled={battleLoading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold disabled:opacity-50"
          >
            {battleLoading ? "Completing..." : "Complete Tournament"}
          </button>
        )}

        {currentBattle.status === 'completed' && (
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-4 text-center">
            <p className="text-lg font-bold text-yellow-400">
              {currentBattle.team1Wins > currentBattle.team2Wins
                ? `🎉 ${currentBattle.team1?.name} Wins!`
                : currentBattle.team2Wins > currentBattle.team1Wins
                ? `🎉 ${currentBattle.team2?.name} Wins!`
                : "Tournament Tied!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
