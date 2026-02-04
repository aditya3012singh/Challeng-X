export const TournamentCreationPanel = ({
  selectedTeam,
  selectedOpponent,
  availableTeams,
  onOpponentChange,
  onCreateBattle,
  battleLoading,
}) => {
  if (!selectedTeam) return null;

  return (
    <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Create Tournament</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-200 mb-2">Your Team</p>
          <div className="bg-gray-900/50 rounded px-4 py-2 font-semibold">
            {selectedTeam.name}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-200 mb-2">Opponent Team</p>
          <select
            value={selectedOpponent?.id || ""}
            onChange={(e) => {
              const opponent = availableTeams.find((t) => t.id === e.target.value);
              onOpponentChange(opponent);
            }}
            className="w-full bg-gray-900/50 border border-gray-600 rounded px-4 py-2 text-white"
          >
            <option value="">Select opponent team...</option>
            {availableTeams
              .filter(
                (t) =>
                  t.id !== selectedTeam.id &&
                  t.members.length === selectedTeam.members.length
              )
              .map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.members.length}v{team.members.length})
                </option>
              ))}
          </select>
        </div>
      </div>
      <button
        onClick={onCreateBattle}
        disabled={!selectedOpponent || battleLoading}
        className="w-full py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 disabled:opacity-50"
      >
        {battleLoading ? "Creating Tournament..." : "Start Tournament"}
      </button>
    </div>
  );
};
