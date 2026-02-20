export default function OutputPanel({ output, error, status }) {
  return (
    <div className="h-48 bg-gray-900 border border-gray-700 rounded-b-2xl text-sm overflow-auto shadow-inner">
      <div className="px-3 py-1 text-slate-300 border-b border-gray-700 bg-gray-800 rounded-t">
        Output
      </div>
      <pre className="px-3 py-2 text-slate-100 whitespace-pre-wrap min-h-[2rem]">
        {status === "running" && "⏳ Running...\n"}
        {error && <span className="text-red-400">{error}</span>}
        {!error && output}
      </pre>
    </div>
  );
}
