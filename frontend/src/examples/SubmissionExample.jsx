/**
 * ASYNC SUBMISSION - EXAMPLE USAGE
 * 
 * This example shows how to use the useSubmission hook and SubmissionStatus component
 * to handle async code submissions with real-time updates via polling + Socket.IO
 */

import React, { useState } from "react";
import { useSubmission } from "../hooks/useSubmission";
import { SubmissionStatus } from "../components/SubmissionStatus";

export const CodeEditorExample = () => {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("java");

    // Use the submission hook
    const { submit, loading, error, status, reset } = useSubmission();

    const handleSubmitCode = async () => {
        try {
            // Submit code (returns immediately with submissionId)
            const result = await submit({
                code,
                language,
                problemId: "your-problem-id", // Get from props/context
                battleId: null, // Optional: for battle submissions
            });

            console.log("Submission queued:", result);
            // Result: { submissionId, status: "QUEUED", message }

            // The hook automatically:
            // 1. Starts polling every 2 seconds
            // 2. Listens for Socket.IO "submissionResult" events
            // 3. Updates the status state in real-time
            // 4. Stops polling when complete

        } catch (err) {
            console.error("Submission failed:", err);
        }
    };

    const handleReset = () => {
        reset(); // Clear submission state
        setCode("");
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Code Editor</h1>

            {/* Code Editor */}
            <div>
                <label className="block mb-2 font-semibold">Language</label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-2 border rounded mb-4"
                >
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                </select>

                <label className="block mb-2 font-semibold">Code</label>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-64 p-4 font-mono bg-gray-900 text-white rounded border border-gray-700"
                    placeholder="Write your code here..."
                />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
                <button
                    onClick={handleSubmitCode}
                    disabled={loading || !code}
                    className="px-6 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {loading ? "Submitting..." : "Submit Code"}
                </button>

                <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-600 text-white rounded font-bold hover:bg-gray-700"
                >
                    Reset
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Submission Status - Real-time updates! */}
            <SubmissionStatus status={status} />

            {/* Debug Info */}
            {status && (
                <div className="p-4 bg-gray-800 rounded text-xs text-gray-300 font-mono">
                    <strong>Debug Info:</strong>
                    <pre>{JSON.stringify(status, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

/**
 * ANOTHER EXAMPLE: Using in a Battle/IDE Component
 */
export const BattleIdeExample = ({ battleId, problemId }) => {
    const [code, setCode] = useState("");
    const { submit, status } = useSubmission();

    const handleRunCode = async () => {
        await submit({
            code,
            language: "java",
            problemId,
            battleId, // Include battleId for battle submissions
        });
    };

    // Check if submission passed to enable "next" button
    const canProceed = status?.status === "PASSED";

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Code Editor */}
            <div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-96 p-4 font-mono bg-gray-900 text-white"
                />
                <button onClick={handleRunCode} className="mt-4 px-6 py-2 bg-green-600 text-white rounded">
                    Run Code
                </button>
            </div>

            {/* Results Panel */}
            <div>
                <h2 className="text-xl font-bold mb-4">Results</h2>
                <SubmissionStatus status={status} />

                {canProceed && (
                    <button className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded font-bold">
                        Proceed to Next Round
                    </button>
                )}
            </div>
        </div>
    );
};
