export const JoinTeamTab = ({ joinCode, setJoinCode, teamLoading, onJoinTeam }) => {
  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-lg border border-gray-700 p-8">
      <h2 className="text-2xl font-bold mb-6">Join Team</h2>
      <form onSubmit={onJoinTeam} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Team Code
          </label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit team code"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-blue-500"
            maxLength="6"
          />
        </div>

        <button
          type="submit"
          disabled={teamLoading || joinCode.length !== 6}
          className="w-full py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold disabled:opacity-50"
        >
          {teamLoading ? "Joining..." : "Join Team"}
        </button>
      </form>

      <div className="mt-8 bg-gray-900 rounded-lg p-4">
        <h4 className="font-semibold mb-2">How it works:</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Get a 6-digit team code from your teammates</li>
          <li>• Teams compete against each other</li>
          <li>• Solve coding problems as a team</li>
          <li>• First team to complete wins!</li>
        </ul>
      </div>
    </div>
  );
};
