export const CreateTeamTab = ({ teamName, setTeamName, teamSize, setTeamSize, teamLoading, onCreateTeam }) => {
  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-lg border border-gray-700 p-8">
      <h2 className="text-2xl font-bold mb-6">Create New Team</h2>
      <form onSubmit={onCreateTeam} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g., Code Warriors"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Team Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setTeamSize(size)}
                className={`py-2 px-4 rounded font-semibold transition-colors ${
                  teamSize === size
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {size}v{size}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={teamLoading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold disabled:opacity-50"
        >
          {teamLoading ? "Creating..." : "Create Team"}
        </button>
      </form>
    </div>
  );
};
