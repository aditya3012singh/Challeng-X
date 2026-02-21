import { useState, useEffect } from "react";

export default function OutputPanel({ output, error, status, testCaseResults, problem }) {
  const [activeTab, setActiveTab] = useState(-1);
  const [viewMode, setViewMode] = useState("testcase"); // "testcase" or "result"

  // Extract sample cases from problem
  const sampleCases = problem?.testcases?.filter(tc => tc.isSample) || [];

  // Auto-switch logic
  useEffect(() => {
    if (testCaseResults?.length > 0) {
      const firstFailed = testCaseResults.findIndex(r => !r.passed);
      setActiveTab(firstFailed !== -1 ? firstFailed : 0);
      setViewMode("result");
    } else if (status === "running") {
      setActiveTab(-1);
    }
  }, [testCaseResults, status]);

  const isRunning = status === "running" || status === "QUEUED";

  return (
    <div className="h-72 bg-[#0a0a0a] border border-slate-800 rounded-b-2xl text-sm flex flex-col shadow-2xl overflow-hidden">
      {/* Tabs Header */}
      <div className="flex bg-[#111111] border-b border-slate-800 px-2 pt-2 gap-1 overflow-x-auto scrollbar-hide shrink-0">
        <button
          onClick={() => setActiveTab(-1)}
          className={`px-4 py-2 rounded-t-lg transition-all text-[10px] font-bold uppercase tracking-widest shrink-0 ${activeTab === -1
            ? "bg-[#1e1e1e] text-[var(--color-primary)] border-x border-t border-slate-700"
            : "text-slate-500 hover:text-slate-300"
            }`}
        >
          StdOut
        </button>
        {sampleCases.map((tc, i) => {
          const result = testCaseResults?.[i];
          const hasResult = !!result;
          return (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-t-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider shrink-0 ${activeTab === i
                ? "bg-[#1e1e1e] text-white border-x border-t border-slate-700 shadow-[0_-2px_10px_rgba(0,0,0,0.5)]"
                : "text-slate-500 hover:text-slate-300"
                }`}
            >
              {hasResult ? (
                <span className={result.passed ? "text-[var(--color-success)]" : "text-red-500"}>
                  {result.passed ? "✓" : "✗"}
                </span>
              ) : (
                <span className="text-slate-600 opacity-30">●</span>
              )}
              Case {i + 1}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isRunning && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-50 bg-[#0a0a0a]/80 backdrop-blur-sm z-20">
            <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent animate-spin rounded-full"></div>
            <div className="uppercase tracking-[0.2em] font-black text-[9px] animate-pulse text-[var(--color-primary)]">Judicial Evaluation in Progress...</div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed custom-scrollbar">
          {activeTab === -1 ? (
            <div className="whitespace-pre-wrap text-slate-300">
              {error && <div className="text-red-400 mb-2 border-l-2 border-red-500 pl-3 py-1 bg-red-500/5 uppercase font-black text-[10px]">Compilation/Runtime Error</div>}
              {error && <span className="text-red-400">{error}</span>}
              {!error && output}
              {!error && !output && <span className="text-slate-600 italic">No console output...</span>}
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Internal Sub-Tabs (Testcase vs Result) */}
              <div className="flex gap-4 border-b border-slate-800/50 mb-4 pb-0.5 shrink-0">
                <button
                  onClick={() => setViewMode("testcase")}
                  className={`text-[9px] uppercase font-black tracking-widest pb-2 border-b-2 transition-all ${viewMode === "testcase" ? "text-white border-[var(--color-primary)]" : "text-slate-600 border-transparent hover:text-slate-400"}`}
                >
                  Testcase
                </button>
                <button
                  onClick={() => setViewMode("result")}
                  disabled={!testCaseResults?.[activeTab]}
                  className={`text-[9px] uppercase font-black tracking-widest pb-2 border-b-2 transition-all ${!testCaseResults?.[activeTab] ? "opacity-30 cursor-not-allowed" : viewMode === "result" ? "text-white border-[var(--color-primary)]" : "text-slate-600 border-transparent hover:text-slate-400"}`}
                >
                  Result
                </button>
              </div>

              {viewMode === "testcase" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase text-slate-500 mb-1 font-bold">Input</div>
                    <div className="bg-[#151515] p-3 rounded border border-slate-800 text-slate-200">
                      {sampleCases[activeTab]?.input}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase text-slate-500 mb-1 font-bold">Expected Output</div>
                    <div className="bg-[#151515] p-3 rounded border border-slate-800 text-slate-200">
                      {sampleCases[activeTab]?.output || sampleCases[activeTab]?.expected}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className={`text-lg font-black uppercase tracking-tighter ${testCaseResults[activeTab]?.passed ? "text-[var(--color-success)]" : "text-red-500"}`}>
                      {testCaseResults[activeTab]?.passed ? "Accepted" : "Wrong Answer"}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Case {activeTab + 1}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] uppercase text-slate-500 mb-1 font-bold">Your Output</div>
                    <div className={`p-3 rounded border ${testCaseResults[activeTab]?.passed
                      ? "bg-green-500/5 border-[var(--color-success)]/30 text-[var(--color-success)]"
                      : "bg-red-500/5 border-red-500/30 text-red-400"
                      }`}>
                      {testCaseResults[activeTab]?.error ? (
                        <span className="text-red-500 font-bold uppercase text-[10px]">Error: {testCaseResults[activeTab].error}</span>
                      ) : (
                        testCaseResults[activeTab]?.actual || <span className="text-slate-600 italic">Empty output</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
