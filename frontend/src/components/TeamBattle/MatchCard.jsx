export const MatchCard = ({ match, user, onSelectMatch, getMatchStatus, isUserInMatch }) => {
  return (
    <div
      className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
      onClick={() => {
        if (isUserInMatch(match) && match.status !== 'completed') {
          onSelectMatch(match);
        }
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-bold">
          {match.player1?.username} vs {match.player2?.username}
        </div>
        <span
          className={`text-xs px-2 py-1 rounded font-semibold ${
            match.status === 'completed'
              ? 'bg-green-600'
              : match.submissions?.length > 0
              ? 'bg-yellow-600'
              : 'bg-gray-600'
          }`}
        >
          {getMatchStatus(match)}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Problem:</p>
        <p className="text-sm font-semibold text-blue-400">
          {match.problem?.title}
        </p>
      </div>

      {match.winnerId && (
        <div className="bg-gray-800 border border-green-600 rounded px-3 py-2">
          <p className="text-xs text-gray-400">Winner</p>
          <p className="text-sm font-bold text-green-400">
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
          className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold"
        >
          Submit Code
        </button>
      )}
    </div>
  );
};
