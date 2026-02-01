import { Skeleton } from "./Skeleton";

export const BattleProblem = ({ problem }) => {
  // 🔥 Skeleton while loading
  if (!problem) {
    return (
      <div className="px-6 py-6 space-y-6">
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
    <div className="px-6 py-6 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-3">{problem.title}</h1>

      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
        {problem.difficulty}
      </span>

      <div className="bg-white rounded-lg shadow p-6 my-6">
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        <p className="whitespace-pre-line">{problem.description}</p>
      </div>

      {problem.testcases && problem.testcases.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Test Cases</h2>

          <div className="space-y-4">
            {problem.testcases.map((testcase, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded p-4"
              >
                <h3 className="font-semibold mb-2">
                  Test Case {index + 1}
                </h3>

                <div className="mb-2">
                  <strong>Input:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1">
                    {testcase.input}
                  </pre>
                </div>

                <div>
                  <strong>Expected Output:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1">
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
