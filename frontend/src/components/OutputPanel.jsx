export default function OutputPanel({ output, error, status }) {
  return (
    <div className="h-40 bg-black border-t border-slate-700 text-sm overflow-auto">
      <div className="px-3 py-1 text-slate-400 border-b border-slate-800">
        Output
      </div>

      <pre className="px-3 py-2 text-slate-200 whitespace-pre-wrap">
        {status === "running" && "⏳ Running...\n"}
        {error && <span className="text-red-400">{error}</span>}
        {!error && output}
      </pre>
    </div>
  );
}
