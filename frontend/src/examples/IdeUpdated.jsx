/**
 * Updated Ide.jsx - Using Async Submissions
 * 
 * This is an example of how to update the existing Ide.jsx component
 * to use the new async submission system with real-time updates
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../../lib/socket";
import EditorToolbar from "../components/EditorToolbar";
import EditorPane from "../components/EditorPane";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";
import { Skeleton } from "../components/Skeleton";
import { getBattle } from "../../store/api/battle.thunk";
import { BattleProblem } from "../components/BattleProblem";

// NEW IMPORTS
import { useSubmission } from "../hooks/useSubmission";
import { SubmissionStatus } from "../components/SubmissionStatus";

const LANGUAGES = {
  java: {
    monaco: "java",
    defaultCode: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello");
  }
}`,
  },
};

const WaitingForOpponent = ({ battleId }) => {
  const inviteLink = `${window.location.origin}/battle/${battleId}/join`;

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <h2 className="text-2xl font-bold mb-4">Waiting for opponent...</h2>
      <p className="text-gray-600 mb-6">
        Share this battle link with your friend to start the match.
      </p>
      <div className="bg-gray-100 px-4 py-3 rounded-lg text-sm mb-4 break-all">
        {inviteLink}
      </div>
    </div>
  );
};

export default function IdeUpdated() {
  const { battleId } = useParams();
  const dispatch = useDispatch();

  const { currentBattle } = useSelector((state) => state.battle);

  const isBattleLoading = !currentBattle;
  const isWaitingForOpponent =
    currentBattle?.status === "WAITING" && !currentBattle?.player2Id;

  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(LANGUAGES.java.defaultCode);

  // NEW: Use the submission hook instead of manual state management
  const { submit, loading, status, reset } = useSubmission();

  useEffect(() => {
    dispatch(getBattle({ battleId }));
  }, [battleId]);

  // Socket.io connection for battle updates (player joined, started, finished)
  useEffect(() => {
    const socket = getSocket();
    socket.emit("joinBattle", battleId);

    socket.on("playerJoined", () => {
      console.log("Player joined the battle");
      dispatch(getBattle({ battleId }));
    });

    socket.on("battleStarted", () => {
      console.log("Battle started");
      dispatch(getBattle({ battleId }));
    });

    socket.on("battleFinished", ({ winnerId }) => {
      console.log("Battle finished, winner:", winnerId);
      dispatch(getBattle({ battleId }));
    });

    return () => {
      socket.off("playerJoined");
      socket.off("battleStarted");
      socket.off("battleFinished");
    };
  }, [battleId, dispatch]);

  // NEW: Simple submission handler
  const handleSubmit = async () => {
    try {
      await submit({
        code,
        language,
        problemId: currentBattle?.problemId,
        battleId,
      });

      // No need to manually set status - the hook handles it!
      // Status updates will come via Socket.IO and polling automatically

    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(LANGUAGES[lang].defaultCode);
    reset(); // Clear previous submission status
  };

  // NEW: Determine if user can proceed based on submission status
  const canProceed = status?.status === "PASSED";
  const hasError = status?.status === "ERROR" || status?.status === "FAILED";

  return (
    <div className="h-screen flex overflow-hidden">
      {/* LEFT — Problem */}
      <div className="w-[40%] border-r border-gray-300 overflow-y-auto">
        <BattleProblem problem={currentBattle?.problem} />
      </div>

      {/* RIGHT — IDE */}
      <div className="w-[60%] flex flex-col">
        {isBattleLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[60%] w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            {/* Waiting for opponent banner */}
            {isWaitingForOpponent && (
              <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-yellow-800">
                      ⏳ Waiting for opponent...
                    </p>
                    <p className="text-xs text-yellow-700">
                      Share battle code:{" "}
                      <span className="font-mono font-bold text-lg">
                        {currentBattle?.battleCode}
                      </span>
                    </p>
                  </div>
                  <p className="text-xs text-yellow-700">
                    You can practice while waiting!
                  </p>
                </div>
              </div>
            )}

            {/* Battle status banner */}
            {currentBattle?.status === "FINISHED" && (
              <div className="bg-green-100 border-b border-green-300 px-4 py-3">
                <p className="font-semibold text-green-800">
                  🏆 Battle Finished!
                </p>
              </div>
            )}

            <EditorPane>
              <EditorToolbar
                language={language}
                onLanguageChange={handleLanguageChange}
                onRun={handleSubmit}
                status={loading ? "running" : status?.isProcessing ? "processing" : "idle"}
                disabled={loading || status?.isProcessing}
              />

              <div className="flex flex-col h-[calc(100%-3rem)]">
                <div className="flex-1 overflow-hidden">
                  <CodeEditor
                    language={language}
                    code={code}
                    onChange={setCode}
                  />
                </div>

                {/* NEW: Real-time Submission Status */}
                <div className="h-[30%] border-t border-gray-300 overflow-y-auto p-4 bg-gray-50">
                  {status ? (
                    <>
                      <h3 className="text-sm font-bold text-gray-700 mb-3">
                        Submission Results
                      </h3>

                      {/* Beautiful status component with real-time updates */}
                      <SubmissionStatus status={status} />

                      {/* Success actions */}
                      {canProceed && currentBattle?.status === "ACTIVE" && (
                        <div className="mt-4">
                          <div className="p-3 bg-green-50 border border-green-300 rounded">
                            <p className="text-green-800 font-semibold">
                              ✅ All test cases passed! Waiting for opponent...
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Error message */}
                      {hasError && (
                        <div className="mt-4">
                          <button
                            onClick={reset}
                            className="px-4 py-2 bg-red-600 text-[var(--color-text-main)] rounded hover:bg-red-700"
                          >
                            Try Again
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>Run your code to see results here</p>
                    </div>
                  )}
                </div>
              </div>
            </EditorPane>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * KEY CHANGES FROM ORIGINAL:
 * 
 * 1. ✅ Removed manual status/message state management
 * 2. ✅ Added useSubmission hook
 * 3. ✅ Simplified handleSubmit (no try-catch needed for status)
 * 4. ✅ Added SubmissionStatus component for real-time updates
 * 5. ✅ Status updates happen automatically via Socket.IO + polling
 * 6. ✅ Cleaner, more maintainable code
 * 7. ✅ Better UX with visual feedback
 * 
 * BENEFITS:
 * - ⚡ Instant response to user (no waiting for execution)
 * - 📡 Real-time updates (Socket.IO)
 * - 🔄 Fallback polling (if socket fails)
 * - 🎨 Beautiful UI component
 * - 🧹 Cleaner code
 */
