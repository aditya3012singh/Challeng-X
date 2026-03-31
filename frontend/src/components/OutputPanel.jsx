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

  const handleTabClick = (i) => {
    setActiveTab(i);
    // If we have results for this case, show them by default
    if (testCaseResults?.[i]) {
      setViewMode("result");
    }
  };

  return (
    <div className="h-72 bg-[var(--color-bg-card)] border border-slate-800 rounded-b-2xl text-sm flex flex-col shadow-2xl overflow-hidden">
      {/* Tabs Header */}
      <div className="flex bg-[var(--color-bg-card)] border-b border-[var(--glass-border)] px-2 pt-2 gap-1 overflow-x-auto scrollbar-hide shrink-0">
        <button
          onClick={() => setActiveTab(-1)}
          className={`px-4 py-2 rounded-t-lg transition-all text-[10px] font-bold uppercase tracking-widest shrink-0 ${activeTab === -1
            ? "bg-[var(--color-bg-dark)] text-[var(--color-primary)] border-x border-t border-[var(--glass-border)]"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
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
              onClick={() => handleTabClick(i)}
              className={`px-4 py-2 rounded-t-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider shrink-0 ${activeTab === i
                ? "bg-[var(--color-bg-dark)] text-[var(--color-text-main)] border-x border-t border-[var(--glass-border)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
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
      <div className="flex-1 overflow-hidden flex flex-col relative">

        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed custom-scrollbar">
          {activeTab === -1 ? (
            <div className="whitespace-pre-wrap text-slate-300">
              {error && <div className="text-red-400 mb-2 border-l-2 border-red-500 pl-3 py-1 bg-red-500/5 uppercase font-black text-[10px]">Compilation/Runtime Error</div>}
              {error && <span className="text-red-400 font-mono">{error}</span>}
              {!error && Array.isArray(testCaseResults) && testCaseResults.length > 0 && (
                <div className="mb-6 animate-in slide-in-from-left duration-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`text-4xl font-black tracking-tighter uppercase ${status === "PASSED" || status === "success" ? "text-[var(--color-success)]" : "text-red-500"}`}>
                      {status === "PASSED" || status === "success" ? "Accepted" : "Rejected"}
                    </div>
                    <div className="h-8 w-px bg-slate-800"></div>
                    <div>
                      <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold mb-1">Pass Count</div>
                      <div className="text-xl font-mono text-[var(--color-text-main)]">
                        {testCaseResults.filter(r => r?.passed).length} / {testCaseResults.length}
                      </div>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ease-out ${status === "PASSED" || status === "success" ? "bg-[var(--color-success)]" : "bg-red-500"}`}
                      style={{ width: `${(testCaseResults.filter(r => r?.passed).length / (testCaseResults.length || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {!error && !testCaseResults && output}
              {!error && !testCaseResults && !output && <span className="text-slate-600 italic">No console output...</span>}
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Internal Sub-Tabs (Testcase vs Result) */}
              <div className="flex gap-4 border-b border-slate-800/50 mb-4 pb-0.5 shrink-0">
                <button
                  onClick={() => setViewMode("testcase")}
                  className={`text-[9px] uppercase font-black tracking-widest pb-2 border-b-2 transition-all ${viewMode === "testcase" ? "text-[var(--color-text-main)] border-[var(--color-primary)]" : "text-slate-600 border-transparent hover:text-[var(--color-text-muted)]"}`}
                >
                  Testcase
                </button>
                <button
                  onClick={() => setViewMode("result")}
                  disabled={!testCaseResults?.[activeTab]}
                  className={`text-[9px] uppercase font-black tracking-widest pb-2 border-b-2 transition-all ${!testCaseResults?.[activeTab] ? "opacity-30 cursor-not-allowed" : viewMode === "result" ? "text-[var(--color-text-main)] border-[var(--color-primary)]" : "text-slate-600 border-transparent hover:text-[var(--color-text-muted)]"}`}
                >
                  Result
                </button>
              </div>

              {viewMode === "testcase" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase text-[var(--color-text-muted)] mb-1 font-bold">Input</div>
                    <div className="bg-[var(--color-bg-dark)] p-3 rounded border border-[var(--glass-border)] text-[var(--color-text-main)] whitespace-pre-wrap">
                      {sampleCases[activeTab]?.input || <span className="text-[var(--color-text-muted)] italic">No input</span>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase text-[var(--color-text-muted)] mb-1 font-bold">Expected Output</div>
                    <div className="bg-[var(--color-bg-dark)] p-3 rounded border border-[var(--glass-border)] text-[var(--color-text-main)] whitespace-pre-wrap">
                      {sampleCases[activeTab]?.output || sampleCases[activeTab]?.expected || <span className="text-[var(--color-text-muted)] italic">No expected output</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className={`text-lg font-black uppercase tracking-tighter ${testCaseResults?.[activeTab]?.passed ? "text-[var(--color-success)]" : "text-red-500"}`}>
                      {testCaseResults?.[activeTab]?.passed ? "Accepted" : "Wrong Answer"}
                    </div>
                    <div className="flex items-center gap-3">
                      {status === "PASSED" && (
                        <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded px-2 py-0.5 flex items-center gap-2 animate-in zoom-in duration-500">
                          <span className="text-[var(--color-primary)] text-[9px] font-black uppercase tracking-widest">Performance</span>
                          <span className="text-[var(--color-text-main)] text-[10px] font-bold">Beats {problem?.beatsPercentile || 100}%</span>
                        </div>
                      )}
                      <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">Case {activeTab + 1}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] uppercase text-[var(--color-text-muted)] mb-1 font-bold">Your Output</div>
                    <div className={`p-3 rounded border whitespace-pre-wrap ${testCaseResults?.[activeTab]?.passed
                      ? "bg-green-500/5 border-[var(--color-success)]/30 text-[var(--color-success)]"
                      : "bg-red-500/5 border-red-500/30 text-red-400"
                      }`}>
                      {testCaseResults?.[activeTab]?.error ? (
                        <span className="text-red-500 font-bold uppercase text-[10px]">Error: {testCaseResults[activeTab].error}</span>
                      ) : (
                        testCaseResults?.[activeTab]?.actual || <span className="text-slate-600 italic">Empty output</span>
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
