export const MessageAlerts = ({ battleSuccess, teamSuccess, battleError, teamError }) => {
  return (
    <>
      {(battleSuccess || teamSuccess) && (
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
          <p className="text-green-300">{battleSuccess || teamSuccess}</p>
        </div>
      )}

      {(battleError || teamError) && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-300">{battleError || teamError}</p>
        </div>
      )}
    </>
  );
};
