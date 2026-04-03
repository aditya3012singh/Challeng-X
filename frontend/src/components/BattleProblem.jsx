import { Skeleton } from "./Skeleton";

export const BattleProblem = ({ problem }) => {
  // 🔥 Skeleton while loading
  if (!problem) {
    return (
      <div className="px-6 py-6 space-y-6 bg-[var(--color-bg-card)] border-r border-[var(--color-bg-dark)] min-h-screen pt-12 shadow-md">
        <h2 className="text-[var(--color-primary)] font-black tracking-widest uppercase text-sm mb-8">ChallengX</h2>
        <Skeleton className="h-8 w-2/3 !bg-white/5" />
        <Skeleton className="h-6 w-24 !bg-white/5" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-full !bg-white/5" />
          <Skeleton className="h-5 w-5/6 !bg-white/5" />
          <Skeleton className="h-5 w-4/6 !bg-white/5" />
          <Skeleton className="h-5 w-3/6 !bg-white/5" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full !bg-white/5" />
          <Skeleton className="h-24 w-full !bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 h-full overflow-y-auto bg-[var(--color-bg-card)] border-r border-[var(--color-bg-dark)] min-h-screen pt-12 shadow-md pb-24">
      <h2 className="text-[var(--color-primary)] font-black tracking-widest uppercase text-sm mb-8">ChallengX</h2>

      <h1 className="text-3xl font-black mb-3 text-[var(--color-text-main)] tracking-tight">{problem.title}</h1>
      <span className="inline-block mt-2 mb-4 px-3 py-1 rounded-[2px] text-[10px] font-bold tracking-widest uppercase bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
        {problem.difficulty}
      </span>

      <div className="bg-white/[0.02] border border-white/5 rounded-[2px] p-6 my-6 border-l-4 border-l-[var(--color-primary)]">
        <h2 className="text-sm font-bold tracking-widest uppercase mb-3 text-[var(--color-text-muted)]">Description</h2>
        <p className="whitespace-pre-line text-slate-300 text-sm font-light leading-relaxed">{problem.description}</p>
      </div>

      {problem.constraints && (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2px] p-6 mb-6">
          <h2 className="text-sm font-bold tracking-widest uppercase mb-3 text-[var(--color-text-muted)]">Constraints</h2>
          <pre className="text-slate-300 text-sm font-mono whitespace-pre-line bg-[var(--color-bg-dark)] p-4 border border-white/5">
            {problem.constraints}
          </pre>
        </div>
      )}

      {problem.testcases && problem.testcases.filter(tc => tc.isSample || !tc.isHidden).length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2px] p-6 mb-6">
          <h2 className="text-sm font-bold tracking-widest uppercase mb-4 text-[var(--color-text-muted)]">Sample Cases</h2>
          <div className="space-y-4">
            {problem.testcases
              .filter(tc => tc.isSample || !tc.isHidden)
              .map((testcase, index) => (
                <div
                  key={index}
                  className="border border-white/5 bg-[var(--color-bg-dark)] p-4 rounded-[2px]"
                >
                  <h3 className="font-bold mb-3 text-slate-300 text-xs uppercase tracking-widest">
                    Example {index + 1}
                  </h3>
                  <div className="mb-3">
                    <strong className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] block mb-2">Input:</strong>
                    <pre className="bg-white/[0.02] border border-white/5 p-3 text-slate-300 font-mono text-sm rounded-[2px] overflow-x-auto">
                      {testcase.input}
                    </pre>
                  </div>
                  <div>
                    <strong className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] block mb-2">Expected Output:</strong>
                    <pre className="bg-white/[0.02] border border-white/5 p-3 text-[var(--color-primary)] font-mono text-sm rounded-[2px] overflow-x-auto">
                      {testcase.expected || testcase.output}
                    </pre>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
