export default function EditorToolbar({
  language,
  onLanguageChange,
  onRun,
  onSubmit, // New prop
  status,
  attempts = 0, // New prop
}) {
  const hearts = [1, 2, 3].map((h) => (
    <span key={h} className={h <= (3 - attempts) ? "text-red-500 animate-pulse" : "text-gray-700"}>
      ❤️
    </span>
  ));

  return (
    <div className="h-12 bg-black/40 border-b border-[rgba(0,240,255,0.1)] flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1 rounded text-sm focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="python">Python 3</option>
          <option value="js">JavaScript (Node.js)</option>
          <option value="c">C (GCC)</option>
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
              : "bg-[#FFD700] hover:bg-[#FFC000] text-black hover:shadow-[0_0_15px_rgba(255,215,0,0.4)]"
            }`}
        >
          SUBMIT {attempts >= 3 ? "(LIMIT REACHED)" : ""}
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex gap-1 items-center bg-black/30 px-3 py-1 rounded-full border border-white/5">
          <span className="text-[10px] uppercase tracking-tighter text-gray-400 mr-2">Attempts</span>
          {hearts}
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
