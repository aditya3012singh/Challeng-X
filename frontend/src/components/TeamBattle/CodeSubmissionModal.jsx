export const CodeSubmissionModal = ({
  selectedMatch,
  onClose,
  code,
  setCode,
  language,
  setLanguage,
  onSubmitCode,
  onMarkWinner,
  battleLoading,
}) => {
  if (!selectedMatch) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">
            {selectedMatch.player1?.username} vs {selectedMatch.player2?.username}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Problem Display */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h4 className="text-lg font-bold text-blue-400 mb-2">
              {selectedMatch.problem?.title}
            </h4>
            <p className="text-gray-300 mb-4">
              {selectedMatch.problem?.description}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Difficulty</p>
                <p className="font-semibold text-yellow-400">
                  {selectedMatch.problem?.difficulty}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Constraints</p>
                <p className="font-semibold text-gray-300">
                  {selectedMatch.problem?.constraints}
                </p>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
            </div>

            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Your Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your solution here..."
              className="w-full h-64 bg-gray-900 border border-gray-600 rounded px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onSubmitCode}
              disabled={battleLoading || !code.trim()}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:opacity-50"
            >
              {battleLoading ? "Submitting..." : "Submit Solution"}
            </button>
            <button
              onClick={onMarkWinner}
              disabled={
                battleLoading ||
                !selectedMatch.submissions?.length ||
                selectedMatch.winnerId
              }
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold disabled:opacity-50"
            >
              Mark Winner
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
