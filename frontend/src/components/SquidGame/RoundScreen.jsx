import { useState, useEffect, useRef } from "react";
import CodeEditor from "../CodeEditor";
import { LANGUAGES } from "./SquidGameConfig";

const RoundScreen = ({ tournament, roundInfo, timeLeft, onSubmit, leaderboard, socket, user }) => {
    const [language, setLanguage] = useState("java");
    const [code, setCode] = useState(LANGUAGES.java.defaultCode);
    const [submitted, setSubmitted] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState("IDLE"); // IDLE, PENDING, PASSED, FAILED
    const [runResults, setRunResults] = useState(null);
    const hasInitializedRef = useRef(false);

    // Get problem from tournament roundProblems (DB) or from socket roundInfo
    const roundNum = tournament?.currentRound || roundInfo?.roundNumber || 1;
    const currentRoundData = tournament?.roundProblems?.find(r => r.roundNumber === roundNum);
    const problem = currentRoundData?.problem || roundInfo?.problem;

    const handleLangChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(LANGUAGES[lang].defaultCode);
    };

    const handleSubmit = () => {
        console.log("🔵 [RoundScreen] handleSubmit clicked, triggering onSubmit...");
        setSubmissionStatus("PENDING");
        setSubmitted(true);
        onSubmit({ code, language, type: "SUBMIT" });
    };

    const handleRun = () => {
        setSubmissionStatus("PENDING");
        setRunResults(null);
        onSubmit({ code, language, type: "RUN" });
    };

    // Reset state when a new round starts
    useEffect(() => {
        if (roundInfo?.roundNumber) {
            console.log("🆕 [RoundScreen] Round changed to:", roundInfo.roundNumber, "- Resetting state");
            setSubmitted(false);
            setSubmissionStatus(null);
            setRunResults(null);
            hasInitializedRef.current = false; // Allow re-initialization for the new round
            // Optionally clear code if not already cleared by parent/backend
            // but usually code is restored by the first useEffect if we want persistence
            // Since backend clears draft, this will naturally result in empty editor on reload.
            // For live transition, we might want to manually clear it:
            if (!tournament?.myStatus?.lastSubmission && !tournament?.myStatus?.participant?.lastCode) {
                setCode(LANGUAGES[language]?.defaultCode || "");
            }
        }
    }, [roundInfo?.roundNumber]);

    // Initialize state from existing submission or draft if available
    useEffect(() => {
        if (!hasInitializedRef.current && tournament?.myStatus) {
            const { lastSubmission, participant } = tournament.myStatus;
            console.log("🔄 [RoundScreen] Initializing from myStatus:", tournament.myStatus);

            // Priority: 1. Official Submission, 2. Draft Code
            if (lastSubmission?.code) {
                setCode(lastSubmission.code);
                if (lastSubmission.language && LANGUAGES[lastSubmission.language]) {
                    setLanguage(lastSubmission.language);
                }
            } else if (participant?.lastCode) {
                setCode(participant.lastCode);
                if (participant.lastLanguage && LANGUAGES[participant.lastLanguage]) {
                    setLanguage(participant.lastLanguage);
                }
            }

            if (lastSubmission) {
                if (lastSubmission.status === "PASSED") {
                    setSubmissionStatus("PASSED");
                    setSubmitted(true);
                } else if (lastSubmission.status === "PENDING" || lastSubmission.status === "QUEUED") {
                    setSubmissionStatus("PENDING");
                    setSubmitted(true);
                } else if (lastSubmission.status === "FAILED") {
                    setSubmissionStatus("FAILED");
                    setSubmitted(false);
                }
            }

            hasInitializedRef.current = true;
        }
    }, [tournament?.myStatus]);

    // Listen for my specific result
    useEffect(() => {
        if (!socket) return;

        const handleResult = (data) => {
            console.log("📥 [RoundScreen] Received submission_result (prop socket):", data);
            if (data.userId === user?.id) {
                if (data.type === "RUN") {
                    setRunResults(data.testCaseResults);
                    setSubmissionStatus("IDLE");
                } else {
                    if (data.status === "PASSED") {
                        setSubmissionStatus("PASSED");
                    } else {
                        setSubmissionStatus("FAILED");
                        setSubmitted(false); // Allow re-submission if failed
                    }
                }
            }
        };

        const handleError = (data) => {
            console.error("❌ [RoundScreen] Socket Error:", data);
            setSubmissionStatus("IDLE");
            setSubmitted(false);
            // We could use a toast here if available, but for now we reset
            alert(`Submission Error: ${data.message || "Unknown error"}`);
        };

        socket.on("submission_result", handleResult);
        socket.on("error", handleError);
        return () => {
            socket.off("submission_result", handleResult);
            socket.off("error", handleError);
        };
    }, [socket, user?.id]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
    };

    const codeRef = useRef(code);
    const langRef = useRef(language);

    useEffect(() => { codeRef.current = code; }, [code]);
    useEffect(() => { langRef.current = language; }, [language]);

    // Live Code Sync — Periodically emit code to host
    useEffect(() => {
        const tid = tournament?.id || tournament?._id;
        if (!tid || !user?.id || submitted) return;

        const syncInterval = setInterval(() => {
            if (socket && socket.connected) {
                console.log("📤 Emitting code sync for", user.username);
                socket.emit("squid_game:code_sync", {
                    squidGameId: tid,
                    userId: user?.id,
                    username: user?.username,
                    code: codeRef.current,
                    language: langRef.current
                });
            }
        }, 3000); // Sync every 3 seconds

        return () => clearInterval(syncInterval);
    }, [tournament, user?.id, socket, submitted]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#080808] shrink-0">
                <div className="flex items-center gap-6">
                    <div>
                        <div className="text-[8px] font-bold tracking-[0.4em] text-red-500 uppercase">Round {roundNum}</div>
                        <div className="text-white text-sm font-bold">{problem?.title || "Loading..."}</div>
                    </div>
                    <div className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${problem?.difficulty === "EASY" ? "text-green-400 border-green-400/20"
                        : problem?.difficulty === "MEDIUM" ? "text-yellow-400 border-yellow-400/20"
                            : "text-red-400 border-red-400/20"
                        }`} style={{ borderRadius: "2px" }}>
                        {problem?.difficulty || "???"}
                    </div>
                </div>

                {/* Timer */}
                <div className={`text-3xl font-black tabular-nums font-[family:var(--font-heading)] ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-white"}`}>
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-3">
                    <select value={language} onChange={handleLangChange} className="bg-[#0a0a0a] border border-white/10 text-white text-[10px] px-3 py-2 uppercase font-bold tracking-wider" style={{ borderRadius: "2px" }}>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                    <button
                        onClick={handleRun}
                        disabled={submitted || submissionStatus === "PENDING" || submissionStatus === "PASSED"}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${submissionStatus === "PENDING" ? "bg-white/5 text-white/40 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20"}`}
                        style={{ borderRadius: "2px" }}
                    >
                        RUN CODE
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitted || submissionStatus === "PENDING" || submissionStatus === "PASSED"}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${submissionStatus === "PASSED" ? "bg-green-500 text-white" :
                            submissionStatus === "FAILED" ? "bg-red-500 text-white" :
                                submissionStatus === "PENDING" ? "bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed animate-pulse" :
                                    submitted ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed" :
                                        "bg-red-500 text-white hover:bg-red-400"
                            }`}
                        style={{ borderRadius: "2px" }}
                    >
                        {submissionStatus === "PASSED" ? "PASSED ✓" :
                            submissionStatus === "FAILED" ? "FAILED ✗ (TRY AGAIN)" :
                                submissionStatus === "PENDING" ? "JUDGING..." :
                                    submitted ? "SUBMITTED" : "SUBMIT CODE"}
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex flex-1 min-h-0">
                {/* Left: Problem Description */}
                <div className="w-[35%] border-r border-white/5 overflow-y-auto p-6 bg-[#060606]">
                    <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-4">Problem Statement</div>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {problem?.description || "Loading problem..."}
                    </div>

                    {/* Run Results */}
                    {runResults && (
                        <div className="mt-8 border-t border-white/5 pt-6">
                            <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-3">Test Results</div>
                            <div className="space-y-3">
                                {runResults.map((res, i) => (
                                    <div key={i} className={`p-3 border ${res.passed ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`} style={{ borderRadius: "2px" }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Case #{i + 1}</span>
                                            <span className={`text-[9px] font-black uppercase ${res.passed ? "text-green-400" : "text-red-400"}`}>
                                                {res.passed ? "PASSED" : "FAILED"}
                                            </span>
                                        </div>
                                        {!res.passed && (
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="text-[8px] text-slate-500 uppercase font-bold">Input:</div>
                                                    <pre className="text-[10px] text-slate-300 bg-black/40 p-1 mt-1 font-mono">{res.input}</pre>
                                                </div>
                                                <div>
                                                    <div className="text-[8px] text-slate-500 uppercase font-bold">Expected:</div>
                                                    <pre className="text-[10px] text-green-400/80 bg-black/40 p-1 mt-1 font-mono">{res.expected}</pre>
                                                </div>
                                                <div>
                                                    <div className="text-[8px] text-slate-500 uppercase font-bold">Actual:</div>
                                                    <pre className="text-[10px] text-red-400/80 bg-black/40 p-1 mt-1 font-mono">{res.actual || res.error || "No output"}</pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mini Leaderboard */}
                    {Array.isArray(leaderboard) && leaderboard.length > 0 && (
                        <div className="mt-8 border-t border-white/5 pt-6">
                            <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-3">Live Rankings</div>
                            <div className="space-y-1">
                                {leaderboard.slice(0, 10).map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-2 border border-white/[0.03] bg-white/[0.01]" style={{ borderRadius: "2px" }}>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black ${i === 0 ? "text-[var(--color-primary)]" : i < 3 ? "text-white" : "text-slate-600"}`}>
                                                #{i + 1}
                                            </span>
                                            <span className="text-[10px] text-white font-bold">{entry.username || `Player`}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400">{entry.score || 0} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Code Editor */}
                <div className="w-[65%] bg-[#080808] flex flex-col">
                    <div className="flex-1 min-h-0">
                        <CodeEditor
                            language={LANGUAGES[language]?.monaco || LANGUAGES.java.monaco}
                            value={code}
                            onChange={(v) => setCode(v || "")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoundScreen;
