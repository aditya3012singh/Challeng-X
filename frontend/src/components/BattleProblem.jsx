import { Skeleton } from "./Skeleton";

export const BattleProblem = ({ problem }) => {
  // 🔥 Skeleton while loading
  if (!problem) {
    return (
      <div className="px-6 py-6 space-y-6 bg-white border-r border-gray-200 min-h-screen pt-20 shadow-md">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-24" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-4/6" />
          <Skeleton className="h-5 w-3/6" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 h-full overflow-y-auto bg-white border-r border-gray-200 min-h-screen pt-20 shadow-md">
      <h1 className="text-3xl font-bold mb-3 text-gray-900">{problem.title}</h1>
      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
        {problem.difficulty}
      </span>
      <div className="bg-gray-50 rounded-lg shadow p-6 my-6 border-l-4 border-[var(--color-primary)]">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Description</h2>
        <p className="whitespace-pre-line text-gray-800 text-base leading-relaxed">{problem.description}</p>
      </div>

      {problem.constraints && (
        <div className="bg-gray-50 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 uppercase tracking-widest text-xs">Constraints</h2>
          <pre className="text-gray-700 text-sm font-mono whitespace-pre-line bg-white p-4 border border-gray-100 italic">
            {problem.constraints}
          </pre>
        </div>
      )}

      {problem.testcases && problem.testcases.filter(tc => tc.isSample || !tc.isHidden).length > 0 && (
        <div className="bg-gray-50 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Sample Cases</h2>
          <div className="space-y-4">
            {problem.testcases
              .filter(tc => tc.isSample || !tc.isHidden)
              .map((testcase, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded p-4 bg-white"
                >
                  <h3 className="font-semibold mb-2 text-gray-700">
                    Example {index + 1}
                  </h3>
                  <div className="mb-2">
                    <strong>Input:</strong>
                    <pre className="bg-gray-100 p-2 rounded mt-1 text-gray-700">
                      {testcase.input}
                    </pre>
                  </div>
                  <div>
                    <strong>Expected Output:</strong>
                    <pre className="bg-gray-100 p-2 rounded mt-1 text-gray-700">
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
