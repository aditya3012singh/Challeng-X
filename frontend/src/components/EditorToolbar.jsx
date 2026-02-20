export default function EditorToolbar({
  language,
  onLanguageChange,
  onRun,
  status,
}) {
  return (
    <div className="h-12 bg-black/20 border-b border-slate-700 flex items-center px-4 gap-4">

      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="bg-slate-800 text-slate-200 px-3 py-1 rounded"
      >
        <option value="python">Python 3</option>
        <option value="js">JavaScript (Node.js)</option>
        <option value="c">C (GCC)</option>
        <option value="cpp">C++ (G++)</option>
      </select>

      <button
        onClick={onRun}
        disabled={status === "running"}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded"
      >
        ▶ Run
      </button>

      <span className="text-sm text-slate-400">
        {status === "running" && "Running..."}
        {status === "success" && "Success"}
        {status === "error" && "Error"}
      </span>
    </div>
  );
}
