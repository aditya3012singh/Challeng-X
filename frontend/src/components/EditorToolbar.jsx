export default function EditorToolbar({
  language,
  onLanguageChange,
  onRun,
  onSubmit, // New prop
  status,
  attempts = 0, // New prop
}) {
  const attemptsLeft = 3 - attempts;
  const counterText = `${attemptsLeft}/3`;

  return (
    <div className="h-12 bg-black border-b border-white/[0.03] flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1 rounded text-sm focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="java">Java (JDK 17)</option>
          <option value="cpp">C++ (G++)</option>
        </select>

        <button
          onClick={onRun}
          disabled={status === "running" || status === "QUEUED"}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded text-sm font-bold tracking-widest transition-all hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
        >
          RUN
        </button>

        <button
          onClick={onSubmit}
          disabled={status === "running" || status === "QUEUED" || attempts >= 3}
          className={`px-4 py-1.5 rounded text-sm font-black tracking-widest transition-all ${attempts >= 3
            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
            : "bg-[var(--color-primary)] hover:bg-white text-black transition-all"
            }`}
          style={{ borderRadius: "2px" }}
        >
          SUBMIT {attempts >= 3 ? "(LIMIT REACHED)" : ""}
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex gap-2 items-center bg-white/5 px-3 py-1 rounded border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">ATTEMPTS REMAINING</span>
          <span className={`text-[11px] font-black font-mono transition-colors ${attemptsLeft === 0 ? "text-red-500" : "text-[var(--color-primary)]"}`}>
            {counterText}
          </span>
        </div>

        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
          {status === "running" && "JUDGING..."}
          {status === "success" && "SUCCESS"}
          {status === "error" && "ERROR"}
        </span>
      </div>
    </div>
  );
}
