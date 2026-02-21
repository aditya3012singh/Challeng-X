import { useEffect, useState } from "react";
import { useSubmission } from "../hooks/useSubmission";
import { useParams, useNavigate } from "react-router-dom";
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
  c: { monaco: "c", defaultCode: `#include <stdio.h>\nint main() {\n  printf("Hello\\n");\n  return 0;\n}` },
  cpp: { monaco: "cpp", defaultCode: `#include <iostream>\nint main() {\n  std::cout << "Hello\\n";\n  return 0;\n}` }
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

// Blocker confirmation overlay shown when the user tries to navigate away mid-battle
const LeaveConfirmModal = ({ onStay, onLeave }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div
      className="relative glass-panel border border-[var(--color-primary)] p-10 max-w-md w-full text-center"
      style={{ clipPath: "polygon(4% 0, 100% 0, 100% 88%, 96% 100%, 0 100%, 0 12%)" }}
    >
      {/* Corner decor */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[var(--color-primary)]" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[var(--color-primary)]" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[var(--color-primary)]" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[var(--color-primary)]" />

      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-2xl font-black text-white mb-2 font-[family:var(--font-heading)] tracking-widest">
        ABANDON BATTLE?
      </h2>
      <p className="text-[var(--color-text-muted)] mb-8 text-sm leading-relaxed">
        You are in an active battle. Leaving now will forfeit the match. Your opponent wins automatically.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={onStay}
          className="px-8 py-3 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest hover:shadow-[0_0_20px_var(--color-primary)] transition-all text-sm"
          style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
        >
          Stay in Battle
        </button>
        <button
          onClick={onLeave}
          className="px-8 py-3 border border-red-500 text-red-400 font-bold uppercase tracking-widest hover:bg-red-900/30 transition-all text-sm"
          style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
        >
          Leave Anyway
        </button>
      </div>
    </div>
  </div>
);

export default function Ide() {
  // Track win/loss state
  const [hasWon, setHasWon] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const { battleId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentBattle, submissionResult } = useSelector(
    (state) => state.battle
  );

  const isBattleFinished = currentBattle?.status === "FINISHED";
  const isBattleLoading = !currentBattle;
  const isWaitingForOpponent =
    currentBattle?.status === "WAITING" && !currentBattle?.player2Id;

  const DRAFT_KEY = `battle_draft_${battleId}`;

  // Restore draft from localStorage on mount
  const savedDraft = (() => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return null; } })();
  const [language, setLanguage] = useState(savedDraft?.language || "python");
  const [code, setCode] = useState(savedDraft?.code || LANGUAGES[savedDraft?.language || "python"].defaultCode);
  const [draftSaved, setDraftSaved] = useState(false);
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

  // Auto-save code + language to localStorage on every change
  useEffect(() => {
    if (isBattleFinished) return;
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ code, language }));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 1500);
    }, 800); // debounce 800ms
    return () => clearTimeout(timer);
  }, [code, language, isBattleFinished]);

  // Clear draft from localStorage when battle finishes
  useEffect(() => {
    if (isBattleFinished) {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [isBattleFinished]);

  // Block back button while battle is ongoing (BrowserRouter compatible)
  useEffect(() => {
    if (isBattleFinished) return;
    // Push a dummy state so the back button hits it instead of leaving
    window.history.pushState(null, "", window.location.pathname);
    const handlePopState = () => {
      // Push again to keep trapping
      window.history.pushState(null, "", window.location.pathname);
      setShowLeaveModal(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isBattleFinished]);

  // Warn on page refresh / close while battle is active
  useEffect(() => {
    if (isBattleFinished) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isBattleFinished]);

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
      const myUserId = currentBattle.myUserId || localStorage.getItem("userId");
      // Use winner object from backend
      if (currentBattle.winner && currentBattle.winner.id === myUserId) {
        setMessage(`🏆 You won the battle! (${currentBattle.winner.username})`);
        setHasWon(true);
        setStatus("finished");
      } else if (myUserId === currentBattle.player1?.id || myUserId === currentBattle.player2?.id) {
        setMessage(`❌ You lost the battle. Winner: ${currentBattle.winner?.username || "Unknown"}`);
        setHasLost(true);
        setStatus("finished");
      } else {
        setMessage(`🏆 Winner: ${currentBattle.winner?.username || currentBattle.winnerId}`);
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
    <>
      {/* Leave-battle confirmation modal */}
      {showLeaveModal && (
        <LeaveConfirmModal
          onStay={() => setShowLeaveModal(false)}
          onLeave={() => { setShowLeaveModal(false); navigate("/"); }}
        />
      )}

      <div className="h-screen flex bg-gray-900 flex-col">
        {/* Draft saved toast */}
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-2 bg-black border border-[var(--color-success)] text-[var(--color-success)] text-xs font-mono uppercase tracking-widest transition-all duration-500 ${draftSaved ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
        >
          ✓ Draft saved
        </div>

        {/* Battle-finished top bar with back button */}
        {isBattleFinished && (
          <div className="flex items-center justify-between px-6 py-3 bg-[#050505] border-b border-[rgba(0,240,255,0.15)] z-50 shrink-0">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] font-bold uppercase tracking-widest text-sm hover:bg-[rgba(0,240,255,0.1)] hover:shadow-[0_0_15px_var(--color-primary)] transition-all"
              style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
            >
              ← RETURN TO BASE
            </button>
            <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
              Battle Concluded
            </div>
            <div className="text-xs font-mono text-[var(--color-success)] border border-[var(--color-success)] px-3 py-1">
              {hasWon ? "VICTORY" : hasLost ? "DEFEAT" : "FINISHED"}
            </div>
          </div>
        )}

        {/* Main IDE layout */}
        <div className="flex flex-1 min-h-0">
          {/* LEFT — Problem */}
          <div className="w-[40%]">
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
      </div>
    </>
  );
}
