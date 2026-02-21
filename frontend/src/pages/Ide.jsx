import { useEffect, useState } from "react";
import { useSubmission } from "../hooks/useSubmission";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../../lib/socket";
import EditorToolbar from "../components/EditorToolbar";
import EditorPane from "../components/EditorPane";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";
import { Skeleton } from "../components/Skeleton";

import { getBattle, submitBattleCode } from "../../store/api/battle.thunk";
import { submitCode, getSubmissionStatus } from "../../store/api/submission.thunk";
import { BattleProblem } from "../components/BattleProblem";

const LANGUAGES = {
  python: { monaco: "python", defaultCode: `print("Hello")` },
  js: { monaco: "javascript", defaultCode: `console.log("Hello");` },
  c: { monaco: "c", defaultCode: `#include <stdio.h>\nint main() {\n  printf(\"Hello\\n\");\n  return 0;\n}` },
  cpp: { monaco: "cpp", defaultCode: `#include <iostream>\nint main() {\n  std::cout << \"Hello\\n\";\n  return 0;\n}` }
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

export default function Ide() {
    // Track win/loss state
    const [hasWon, setHasWon] = useState(false);
    const [hasLost, setHasLost] = useState(false);
  const { battleId } = useParams();
  const dispatch = useDispatch();

  const { currentBattle, submissionResult } = useSelector(
    (state) => state.battle
  );

  const isBattleLoading = !currentBattle;
  const isWaitingForOpponent =
    currentBattle?.status === "WAITING" && !currentBattle?.player2Id;

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(LANGUAGES.python.defaultCode);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  // Use the custom hook for async submission (practice mode)
  const {
    handleSubmit: handlePracticeSubmit,
    currentSubmission,
    submissionStatus,
    loading: practiceLoading,
    error: practiceError,
    resetSubmission
  } = useSubmission();

  useEffect(() => {
    dispatch(getBattle({ battleId }));
  }, [battleId]);

  // Socket.io connection for real-time updates
  useEffect(() => {
    const socket = getSocket();

    // Join the battle room
    socket.emit("joinBattle", battleId);

    // Listen for player joined event
    socket.on("playerJoined", () => {
      console.log("Player joined the battle");
      dispatch(getBattle({ battleId }));
    });

    // Listen for battle started event
    socket.on("battleStarted", () => {
      console.log("Battle started");
      dispatch(getBattle({ battleId }));
    });

    // Listen for battle finished event
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

  useEffect(() => {
    if (!currentBattle) return;

    // If battle finished, check winner
    if (currentBattle.status === "FINISHED") {
      // Assume myUserId is available in currentBattle (add from backend if not)
      const myUserId = currentBattle.myUserId || localStorage.getItem("userId");
      if (currentBattle.winnerId === myUserId) {
        setMessage("🏆 You won the battle!");
        setHasWon(true);
        setStatus("finished");
      } else if (currentBattle.player1Id === myUserId || currentBattle.player2Id === myUserId) {
        setMessage("❌ You lost the battle.");
        setHasLost(true);
        setStatus("finished");
      } else {
        setMessage(`🏆 Winner: ${currentBattle.winnerId}`);
        setStatus("finished");
      }
    } else if (submissionResult) {
      setMessage("✅ Code submitted. Waiting for opponent...");
      setStatus("waiting");
    }
  }, [currentBattle, submissionResult]);

  // Handles both battle and practice submissions
  const handleSubmit = async () => {
    // Block submission if user has won or lost
    if (hasWon || hasLost || (currentBattle && currentBattle.status === "FINISHED")) {
      return;
    }
    setStatus("running");
    setMessage("");

    if (battleId) {
      try {
        const result = await dispatch(submitBattleCode({ battleId, code, language })).unwrap();
        setStatus("submitted");
        if (result.status === "PASSED") {
          if (currentBattle?.status === "WAITING") {
            setMessage("✅ All test cases passed! Waiting for opponent to join...");
          } else {
            setMessage("✅ All test cases passed! You won the battle!");
            setHasWon(true);
          }
        } else if (result.status === "FAILED") {
          setMessage(`❌ Some test cases failed`);
        } else if (result.status === "ERROR") {
          setMessage(`❌ Compilation/Runtime Error: ${result.error || ''}`);
        } else {
          setMessage(`⚠️ ${result.status}: ${result.message || ''}`);
        }
      } catch (error) {
        setStatus("error");
        setMessage(`❌ Error: ${error.message || 'Submission failed'}`);
      }
    } else {
      // Practice mode: use the custom hook
      try {
        await handlePracticeSubmit({ code, language, problemId: currentBattle?.problem?.id });
        setMessage("🟡 Evaluating your code...");
      } catch (error) {
        setMessage(`❌ Error: ${error.message || 'Submission failed'}`);
      }
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(LANGUAGES[lang].defaultCode);
  };

  return (
    <div className="h-screen flex pt-20 bg-gray-900"> {/* pt-20 for navbar height, bg for right panel */}
      {/* LEFT — Problem */}
      <div className="w-[40%]"> {/* Left panel now styled in BattleProblem */}
        <BattleProblem problem={currentBattle?.problem} />
      </div>

      {/* RIGHT — IDE */}
      <div className="w-[60%] bg-gray-900 flex flex-col h-full">
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
                    <p className="font-semibold text-yellow-800">⏳ Waiting for opponent...</p>
                    <p className="text-xs text-yellow-700">Share battle code: <span className="font-mono font-bold text-lg">{currentBattle?.battleCode}</span></p>
                  </div>
                  <p className="text-xs text-yellow-700">You can practice while waiting!</p>
                </div>
              </div>
            )}

            <EditorPane>
              <EditorToolbar
                language={language}
                onLanguageChange={handleLanguageChange}
                onRun={handleSubmit}
                status={battleId ? (hasWon || hasLost || (currentBattle && currentBattle.status === "FINISHED") ? "finished" : status) : practiceStatus || status}
              />
              <div className="flex flex-col h-[calc(100%-3rem)]">
                <div className="flex-1 min-h-0">
                  <CodeEditor
                    language={LANGUAGES[language].monaco}
                    value={code}
                    onChange={(v) => setCode(v || "")}
                  />
                </div>
                <div className="h-48">
                  <OutputPanel
                    output={
                      battleId
                        ? message
                        : practiceError
                        ? `❌ ${practiceError}`
                        : submissionStatus
                        ? `Result: ${submissionStatus.status}\nPassed: ${submissionStatus.passedTests}/${submissionStatus.totalTests}`
                        : message
                    }
                    error={battleId ? "" : practiceError}
                    status={battleId ? status : submissionStatus?.status || status}
                  />
                </div>
              </div>
            </EditorPane>
          </>
        )}
      </div>
    </div>
  );
}
