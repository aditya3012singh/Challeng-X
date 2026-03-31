export default function EditorToolbar({
  language,
  onLanguageChange,
  onRun,
  onSubmit, // New prop
  status,
  attempts = 0,
  loadingAction,
}) {
  const attemptsLeft = 3 - attempts;
  const counterText = `${attemptsLeft}/3`;

  return (
    <div className="h-12 bg-[var(--color-bg-card)] border-b border-white/[0.03] flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-transparent border border-[var(--glass-border)] text-[var(--color-text-main)] px-3 py-1 rounded text-sm focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="java" className="bg-[var(--color-bg-dark)]">Java (JDK 17)</option>
          <option value="cpp" className="bg-[var(--color-bg-dark)]">C++ (G++)</option>
        </select>

        <button
          onClick={onRun}
          disabled={status === "running" || status === "QUEUED"}
          className="min-w-[80px] flex items-center justify-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 text-[var(--color-text-main)] rounded text-sm font-bold tracking-widest transition-all"
        >
          {(status === "running" || status === "QUEUED") && loadingAction === "RUN" ? (
            <span className="w-3.5 h-3.5 border-2 border-[var(--color-primary)] border-t-transparent animate-spin rounded-full"></span>
          ) : (
            "RUN"
          )}
        </button>

        <button
          onClick={onSubmit}
          disabled={status === "running" || status === "QUEUED" || attempts >= 3}
          className={`min-w-[100px] flex items-center justify-center gap-2 px-4 py-1.5 rounded text-sm font-black tracking-widest transition-all ${attempts >= 3
            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
            : "bg-[var(--color-primary)] hover:bg-white text-black transition-all"
            }`}
          style={{ borderRadius: "2px" }}
        >
          {(status === "running" || status === "QUEUED") && loadingAction === "SUBMIT" ? (
            <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent animate-spin rounded-full"></span>
          ) : (
            <>SUBMIT {attempts >= 3 ? "(LIMIT REACHED)" : ""}</>
          )}
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex gap-2 items-center bg-white/5 px-3 py-1 rounded border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">ATTEMPTS REMAINING</span>
          <span className={`text-[11px] font-black font-mono transition-colors ${attemptsLeft === 0 ? "text-red-500" : "text-[var(--color-primary)]"}`}>
            {counterText}
          </span>
        </div>

        <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
          {status === "running" && "RUNNING..."}
          {status === "success" && "SUCCESS"}
          {status === "error" && "ERROR"}
        </span>
      </div>
    </div>
  );
}
