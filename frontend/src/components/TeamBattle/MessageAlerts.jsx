export const MessageAlerts = ({ battleSuccess, teamSuccess, battleError, teamError }) => {
  return (
    <>
      {(battleSuccess || teamSuccess) && (
        <div className="border-l-4 border-[var(--color-success)] bg-white/[0.02] p-6 mb-12 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--color-success)] uppercase tracking-[0.2em] mb-1">Authorization Success</div>
          <p className="text-slate-300 text-sm font-light">{battleSuccess || teamSuccess}</p>
        </div>
      )}

      {(battleError || teamError) && (
        <div className="border-l-4 border-red-500 bg-white/[0.02] p-6 mb-12 shadow-xl">
          <div className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] mb-1">Protocol Failure</div>
          <p className="text-slate-300 text-sm font-light">{battleError || teamError}</p>
        </div>
      )}
    </>
  );
};
