import { useEffect, useState, useRef } from "react";
import { useSubmission } from "../hooks/useSubmission";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../../lib/socket";
import EditorToolbar from "../components/EditorToolbar";
import EditorPane from "../components/EditorPane";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";
import { Skeleton } from "../components/Skeleton";

import { getBattle, submitBattleCode, forfeitBattle } from "../../store/api/battle.thunk";
import { clearCurrentBattle } from "../../store/slices/battle.slice";
import { submitCode, getSubmissionStatus } from "../../store/api/submission.thunk";
import { BattleProblem } from "../components/BattleProblem";

const LANGUAGES = {
  java: { monaco: "java", defaultCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}` },
  cpp: { monaco: "cpp", defaultCode: `#include <iostream>\nint main() {\n  std::cout << "Hello\\n";\n  return 0;\n}` }
};

const WaitingForOpponent = ({ battleId, battleCode }) => {
  const inviteLink = `${window.location.origin}/battle/${battleId}/join`;

  return (
    <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-[#050505] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-primary)] opacity-[0.03] blur-[100px] rounded-full"></div>

      <div className="relative z-10 max-w-md w-full">
        <div className="mb-10 flex justify-center">
          <div className="w-20 h-20 border border-white/5 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-[-4px] border border-[var(--color-primary)]/20 rounded-full animate-ping"></div>
            <div className="w-1 h-1 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_var(--color-primary)]"></div>
          </div>
        </div>

        <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Signal Broadcast // Active</div>
        <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter font-[family:var(--font-heading)]">Scanning Node</h2>

        <p className="text-slate-500 text-sm font-light mb-12 leading-relaxed">
          The arena is awaiting a second operator to authorize engagement. Distribute the access link to initialize the battle protocol.
        </p>

        <div className="premium-card p-6 border border-white/10 bg-white/[0.02] text-xs font-mono text-slate-400 break-all mb-4" style={{ borderRadius: "2px" }}>
          {inviteLink}
        </div>

        <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-8">
          <span className="animate-pulse">Waiting for parity</span>
          <div className="w-1 h-1 rounded-full bg-[var(--color-primary)]"></div>
        </div>
      </div>
    </div>
  );
};

const CountdownOverlay = ({ seconds }) => {
  if (seconds === null) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="text-center">
        <h1 className="text-8xl font-black text-white mb-4 animate-pulse">{seconds}</h1>
        <p className="text-[var(--color-primary)] uppercase tracking-widest text-sm font-bold">Battle begins in...</p>
      </div>
    </div>
  );
};

// Blocker confirmation overlay shown when the user tries to navigate away mid-battle
const LeaveConfirmModal = ({ onStay, onLeave }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
    <div
      className="relative bg-[#080808] border border-white/10 p-12 max-w-md w-full text-center shadow-2xl"
      style={{ borderRadius: "2px" }}
    >
      <div className="text-[10px] font-bold tracking-[0.4em] text-red-500 uppercase mb-8">System Alert // Security</div>
      <h2 className="text-4xl font-black text-white mb-4 font-[family:var(--font-heading)] tracking-tighter uppercase">
        Abandon Node?
      </h2>
      <p className="text-slate-500 mb-10 text-sm font-light leading-relaxed">
        Termination of an active battle protocol will result in an <span className="text-red-500 font-bold italic">Automatic Forfeit</span>. The opposing operator will secure the victory.
      </p>
      <div className="flex flex-col gap-4">
        <button
          onClick={onStay}
          className="w-full py-4 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest hover:bg-white transition-all text-[10px]"
          style={{ borderRadius: "2px" }}
        >
          [ Stay in Battle ]
        </button>
        <button
          onClick={onLeave}
          className="w-full py-4 border border-white/10 text-slate-600 hover:text-white hover:border-white transition-all text-[10px] font-bold uppercase tracking-widest"
          style={{ borderRadius: "2px" }}
        >
          Disconnect Anyway
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
  const [countdown, setCountdown] = useState(null);
  const [opponentStatusMsg, setOpponentStatusMsg] = useState("");
  const [ratingUpdate, setRatingUpdate] = useState(null);
  const { battleId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentBattle, submissionResult } = useSelector(
    (state) => state.battle
  );
  // Keep a ref to the current user id so socket closures always see the latest value
  const { user } = useSelector((state) => state.auth);
  const userRef = useRef(user);
  const currentBattleRef = useRef(currentBattle);

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { currentBattleRef.current = currentBattle; }, [currentBattle]);

  const userIdRef = useRef(user?.id);
  useEffect(() => { userIdRef.current = user?.id; }, [user]);

  const isBattleFinished = currentBattle?.status === "FINISHED";
  const currentStatus = currentBattle?.status;
  const isBattleLoading = !currentBattle;
  const isWaitingForOpponent =
    currentBattle?.status === "WAITING" && !currentBattle?.player2Id;

  const DRAFT_KEY = `battle_draft_${battleId}`;

  // Restore draft from localStorage on mount
  const savedDraft = (() => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return null; } })();
  const [language, setLanguage] = useState(savedDraft?.language || "java");
  const [code, setCode] = useState(savedDraft?.code || LANGUAGES[savedDraft?.language || "java"].defaultCode);
  const [draftSaved, setDraftSaved] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage] = useState("");
  const [testCaseResults, setTestCaseResults] = useState(null);
  const [myAttempts, setMyAttempts] = useState(0);
  const [beatsPercentile, setBeatsPercentile] = useState(0);
  const [opponentBeatsPercentile, setOpponentBeatsPercentile] = useState(0);

  // Sync attempts from battle state
  useEffect(() => {
    if (currentBattle && user) {
      const isPlayer1 = currentBattle.player1Id === user.id;
      setMyAttempts(isPlayer1 ? currentBattle.attemptsPlayer1 : currentBattle.attemptsPlayer2);
    }
  }, [currentBattle, user]);

  // Use the custom hook for async submission (practice mode)
  const {
    handleSubmit: handlePracticeSubmit,
    currentSubmission,
    submissionStatus,
    loading: practiceLoading,
    error: practiceError,
    resetSubmission
  } = useSubmission();

  // Track the ID of the last submission we sent, to match against incoming socket results
  const pendingSubmissionIdRef = useRef(null);

  // Save active battleId so we can return after a page refresh
  useEffect(() => {
    if (currentStatus && currentStatus !== "FINISHED") {
      localStorage.setItem("active_battle_id", battleId);
    } else if (currentStatus === "FINISHED") {
      localStorage.removeItem("active_battle_id");
    }
  }, [battleId, currentStatus]);

  // Ensure ID is removed on unmount if battle is over
  useEffect(() => {
    return () => {
      // If we're leaving and the battle in store is finished, clear the ID
      if (currentBattleRef.current?.status === "FINISHED") {
        localStorage.removeItem("active_battle_id");
      }
    };
  }, []);

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
    // Wipe any stale Redux state from a previous battle session
    dispatch(clearCurrentBattle());
    dispatch(getBattle({ battleId }));
  }, [battleId]);

  // Socket.io connection for real-time updates
  useEffect(() => {
    if (!battleId) return;

    const socket = getSocket();
    socket.emit("join_battle", { battleId }); // Updated payload format based on new standard logic

    const onPlayerJoined = () => {
      console.log("Player joined the battle");
      dispatch(getBattle({ battleId }));
    };

    const onBattleStarted = () => {
      console.log("Battle started");
      dispatch(getBattle({ battleId }));
    };

    const onAttemptsUpdated = ({ player1Attempts, player2Attempts }) => {
      const battle = currentBattleRef.current;
      const currentUser = userRef.current;
      if (battle && currentUser) {
        const isPlayer1 = battle.player1Id === currentUser.id;
        setMyAttempts(isPlayer1 ? battle.attemptsPlayer1 : battle.attemptsPlayer2);
      }
    };

    const onSubmissionProgress = (data) => {
      const { submissionId, index, total, passed } = data;
      const isMe = submissionId === pendingSubmissionIdRef.current;
      if (isMe) {
        setStatus("running");
        setMessage(`⏳ Evaluating: Test Case ${index + 1} / ${total} (${passed} passed)...`);
      }
    };

    const onSubmissionResult = (data) => {
      console.log("DEBUG: submissionResult data received:", data);
      const {
        submissionId, userId: resultUserId, status: resStatus, passedTests, totalTests,
        failedTestCase, errorMessage, executionTimeMs, type, testCaseResults: tcResults
      } = data;

      const isMe = resultUserId === userIdRef.current || submissionId === pendingSubmissionIdRef.current;
      console.log("DEBUG: submissionResult check:", { submissionId, resultUserId, myId: userIdRef.current, isMe, pending: pendingSubmissionIdRef.current });

      if (isMe) {
        // Clear pending ID since we got a result
        if (submissionId === pendingSubmissionIdRef.current) {
          pendingSubmissionIdRef.current = null;
        }

        if (type === "RUN") {
          setTestCaseResults(tcResults);
          setStatus(resStatus === "PASSED" ? "success" : "error");
          setMessage(resStatus === "PASSED" ? "✅ Sample tests passed!" : "❌ Sample tests failed.");
          return;
        }

        // SUBMIT logic
        if (resStatus === "PASSED") {
          console.log("DEBUG: Submission passed! Setting status to success.");
          setStatus("success");
          setTestCaseResults(null);
          setMessage(`✅ Evaluation passed! (${passedTests}/${totalTests}) Waiting for arena verification...`);

          // Store percentile for OutputPanel
          setBeatsPercentile(data.beatsPercentile);
        } else {
          console.log("DEBUG: Submission failed. Setting status to error.");
          setStatus("error");
          setTestCaseResults(null);
          const lines = [`❌ Wrong answer — ${passedTests ?? 0}/${totalTests ?? "?"} test cases passed`];
          if (failedTestCase) lines.push(`\nFailed on Test Case #${failedTestCase}`);
          if (errorMessage) lines.push(`\nRuntime Error:\n${errorMessage}`);
          setMessage(lines.join(""));
        }
      } else {
        if (type === "SUBMIT" && resStatus === "PASSED") {
          console.log("DEBUG: Opponent passed! Setting status to error/notified.");
          setStatus("error");
          setMessage(`🔔 Opponent passed all test cases!`);

          // Optionally update problem state if we want to show opponent's beat % too
          setOpponentBeatsPercentile(data.beatsPercentile);
        }
      }
    };

    const onBattleFinished = (data) => {
      console.log("DEBUG: battleFinished data received:", data);
      const { winnerId, draw } = data;
      if (draw) {
        setMessage("💀 ARENA WINS: Both players failed all attempts. Points deducted.");
        setStatus("finished");
        setHasLost(true);
      }
      // Re-fetch to get final winner object and rewards
      setTimeout(() => {
        console.log("DEBUG: Re-fetching battle after finish event...");
        dispatch(getBattle({ battleId }));
      }, 500);
    };

    const onConnect = () => {
      console.log("🟢 Socket connected/reconnected, joining battle room:", battleId);
      socket.emit("join_battle", { battleId });
    };

    const onBattleCountdown = ({ seconds }) => {
      setCountdown(seconds);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const MathSign = (num) => num > 0 ? `+${num}` : num;
    const onRatingUpdate = (data) => {
      setRatingUpdate(data);
    };

    const onOpponentSubmitted = () => {
      setOpponentStatusMsg("⏳ Opponent is submitting their code...");
      setTimeout(() => setOpponentStatusMsg(""), 5000);
    };

    const onBattleTimeout = () => {
      setMessage("⏰ Time's up! The arena has closed the battle resulting in a draw.");
      setStatus("finished");
      setHasLost(true);
    };

    socket.on("connect", onConnect);
    socket.on("battle_joined", onPlayerJoined);
    socket.on("battle_countdown", onBattleCountdown);
    socket.on("battle_start", onBattleStarted);
    socket.on("attempts_updated", onAttemptsUpdated);
    socket.on("submission_progress", onSubmissionProgress);
    socket.on("submission_result", onSubmissionResult);
    socket.on("opponent_submitted", onOpponentSubmitted);
    socket.on("rating_update", onRatingUpdate);
    socket.on("battle_timeout", onBattleTimeout);
    socket.on("battle_end", onBattleFinished);

    return () => {
      socket.off("connect", onConnect);
      socket.off("battle_joined", onPlayerJoined);
      socket.off("battle_countdown", onBattleCountdown);
      socket.off("battle_start", onBattleStarted);
      socket.off("attempts_updated", onAttemptsUpdated);
      socket.off("submission_progress", onSubmissionProgress);
      socket.off("submission_result", onSubmissionResult);
      socket.off("opponent_submitted", onOpponentSubmitted);
      socket.off("rating_update", onRatingUpdate);
      socket.off("battle_timeout", onBattleTimeout);
      socket.off("battle_end", onBattleFinished);
    };
  }, [battleId, dispatch]);

  useEffect(() => {
    if (!currentBattle) return;
    // Ignore stale Redux state from a DIFFERENT battle
    if (currentBattle.id !== battleId) return;

    // If battle finished, check winner
    if (currentBattle.status === "FINISHED") {
      const myUserId = currentBattle.myUserId || userIdRef.current;
      if (currentBattle.winner && currentBattle.winner.id === myUserId) {
        setMessage(`🏆 You won the battle! (${currentBattle.winner.username})`);
        setHasWon(true);
        setStatus("finished");
      } else if (myUserId === currentBattle.player1?.id || myUserId === currentBattle.player2?.id) {
        // If it wasn't a draw, then you lost
        if (currentBattle.winnerId) {
          setMessage(`❌ You lost the battle. Winner: ${currentBattle.winner?.username || "Unknown"}`);
          setHasLost(true);
          setStatus("finished");
        }
      }
    }
  }, [currentBattle, submissionResult]);

  // Handles both battle (Run/Submit) and practice submissions
  const handleSubmit = async (type = "SUBMIT") => {
    // Block submission if user has won or lost
    if (hasWon || hasLost || (currentBattle && currentBattle.status === "FINISHED")) {
      return;
    }

    setTestCaseResults(null);
    setStatus("running");
    setLoadingAction(type);
    setMessage("");

    if (battleId) {
      try {
        const result = await dispatch(submitBattleCode({ battleId, code, language, type })).unwrap();
        console.log("DEBUG: Submission result from dispatch:", result);
        if (result.submissionId) {
          pendingSubmissionIdRef.current = result.submissionId;
        }
        if (result.status === "QUEUED") {
          setStatus("running");
          setMessage(type === "RUN" ? "⏳ Running sample tests..." : "⏳ Judging final submission...");
        }
      } catch (error) {
        setStatus("error");
        setMessage(`❌ Error: ${error.message || 'Submission failed'}`);
      }
    } else {
      // Practice mode
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
    setTestCaseResults(null);
  };

  return (
    <>
      {/* Leave-battle confirmation modal */}
      {showLeaveModal && (
        <LeaveConfirmModal
          onStay={() => setShowLeaveModal(false)}
          onLeave={async () => {
            if (battleId) {
              await dispatch(forfeitBattle({ battleId }));
            }
            localStorage.removeItem("active_battle_id");
            setShowLeaveModal(false);
            dispatch(clearCurrentBattle());
            navigate("/");
          }}
        />
      )}

      <div className="h-screen flex bg-[#050505] flex-col overflow-hidden">
        {/* Draft saved toast */}
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-2 bg-black border border-[var(--color-success)] text-[var(--color-success)] text-xs font-mono uppercase tracking-widest transition-all duration-500 ${draftSaved ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
        >
          ✓ Draft saved
        </div>

        {/* Battle-finished top bar with back button */}
        {isBattleFinished && (
          <div className="flex items-center justify-between px-6 py-3 bg-black border-b border-white/[0.03] z-50 shrink-0">
            <button
              onClick={() => {
                localStorage.removeItem("active_battle_id");
                dispatch(clearCurrentBattle());
                navigate("/");
              }}
              className="px-6 py-2 border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all"
              style={{ borderRadius: "2px" }}
            >
              ← RETURN TO BASE
            </button>
            <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
              Battle Over: {currentBattle.winner ? `${currentBattle.winner.username} Won` : "Arena Victory"}
            </div>
            <div className={`text-xs font-mono border px-3 py-1 ${hasWon ? "text-[var(--color-success)] border-[var(--color-success)]" : "text-red-500 border-red-500"}`}>
              {hasWon ? "VICTORY" : "DEFEAT"}
            </div>
          </div>
        )}

        {/* Main IDE layout */}
        <div className="flex flex-1 min-h-0 relative">
          <CountdownOverlay seconds={countdown} />

          {/* LEFT — Problem */}
          <div className="w-[35%] border-r border-slate-800">
            <BattleProblem problem={currentBattle?.problem} />
          </div>

          {/* RIGHT — IDE */}
          <div className="w-[65%] bg-[#080808] flex flex-col h-full">
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
                  <div className="bg-[var(--color-primary)]/10 border-b border-[var(--color-primary)]/30 px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-[var(--color-primary)] uppercase tracking-widest text-xs">Waiting for Opponent</p>
                        <p className="text-[10px] text-gray-400 uppercase mt-1">Join Code: <span className="font-black text-white ml-2 text-sm">{currentBattle?.battleCode}</span></p>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-gray-500">
                        <span>Invite Link Copied</span>
                        <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}

                {opponentStatusMsg && (
                  <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-6 py-2">
                    <p className="font-bold text-yellow-500 text-xs animate-pulse tracking-wider uppercase">{opponentStatusMsg}</p>
                  </div>
                )}

                {ratingUpdate && isBattleFinished && (
                  <div className="bg-white/5 border-b border-white/10 px-6 py-2 flex items-center gap-4 text-xs font-mono">
                    <span className="text-gray-400 uppercase">Rating Updates: </span>
                    <span className="text-[var(--color-success)]">+30 W</span>
                    <span className="text-red-500">-20 L</span>
                  </div>
                )}

                <EditorPane>
                  <EditorToolbar
                    language={language}
                    onLanguageChange={handleLanguageChange}
                    onRun={() => handleSubmit("RUN")}
                    onSubmit={() => handleSubmit("SUBMIT")}
                    attempts={myAttempts}
                    status={battleId ? (hasWon || hasLost || (currentBattle && currentBattle.status === "FINISHED") ? "finished" : status) : submissionStatus?.status || status}
                    loadingAction={loadingAction}
                  />
                  <div className="flex flex-col h-[calc(100%-3rem)]">
                    <div className="flex-1 min-h-0">
                      <CodeEditor
                        language={LANGUAGES[language].monaco}
                        value={code}
                        onChange={(v) => setCode(v || "")}
                      />
                    </div>
                    <div className="h-64 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10 transition-all duration-300">
                      <OutputPanel
                        output={message}
                        error={practiceError}
                        status={battleId ? status : submissionStatus?.status || status}
                        testCaseResults={testCaseResults}
                        problem={currentBattle?.problem ? { ...currentBattle.problem, beatsPercentile } : null}
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
