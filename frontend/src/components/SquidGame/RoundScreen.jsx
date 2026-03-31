import { useState, useEffect, useRef } from "react";
import CodeEditor from "../CodeEditor";
import { LANGUAGES } from "./SquidGameConfig";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Timer, Terminal, Trophy, 
    Play, Send, CheckCircle2, 
    AlertCircle, Layout, Code2
} from "lucide-react";

const RoundScreen = ({ tournament, roundInfo, timeLeft, onSubmit, leaderboard, socket, user }) => {
    const [language, setLanguage] = useState("java");
    const [code, setCode] = useState(LANGUAGES.java.defaultCode);
    const [submitted, setSubmitted] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState("IDLE");
    const [runResults, setRunResults] = useState(null);
    const hasInitializedRef = useRef(false);

    const roundNum = tournament?.currentRound || roundInfo?.roundNumber || 1;
    const currentRoundData = tournament?.roundProblems?.find(r => r.roundNumber === roundNum);
    const problem = currentRoundData?.problem || roundInfo?.problem;

    const handleLangChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(LANGUAGES[lang].defaultCode);
    };

    const handleSubmit = () => {
        setSubmissionStatus("PENDING");
        setSubmitted(true);
        onSubmit({ code, language, type: "SUBMIT" });
    };

    const handleRun = () => {
        setSubmissionStatus("PENDING");
        setRunResults(null);
        onSubmit({ code, language, type: "RUN" });
    };

    useEffect(() => {
        if (roundInfo?.roundNumber) {
            setSubmitted(false);
            setSubmissionStatus(null);
            setRunResults(null);
            hasInitializedRef.current = false;
            if (!tournament?.myStatus?.lastSubmission && !tournament?.myStatus?.participant?.lastCode) {
                setCode(LANGUAGES[language]?.defaultCode || "");
            }
        }
    }, [roundInfo?.roundNumber]);

    useEffect(() => {
        if (!hasInitializedRef.current && tournament?.myStatus) {
            const { lastSubmission, participant } = tournament.myStatus;
            if (lastSubmission?.code) {
                setCode(lastSubmission.code);
                if (lastSubmission.language && LANGUAGES[lastSubmission.language]) setLanguage(lastSubmission.language);
            } else if (participant?.lastCode) {
                setCode(participant.lastCode);
                if (participant.lastLanguage && LANGUAGES[participant.lastLanguage]) setLanguage(participant.lastLanguage);
            }

            if (lastSubmission) {
                if (lastSubmission.status === "PASSED") { setSubmissionStatus("PASSED"); setSubmitted(true); }
                else if (lastSubmission.status === "PENDING" || lastSubmission.status === "QUEUED") { setSubmissionStatus("PENDING"); setSubmitted(true); }
                else if (lastSubmission.status === "FAILED") { setSubmissionStatus("FAILED"); setSubmitted(false); }
            }
            hasInitializedRef.current = true;
        }
    }, [tournament?.myStatus]);

    useEffect(() => {
        if (!socket) return;
        const handleResult = (data) => {
            if (data.userId === user?.id) {
                if (data.type === "RUN") { setRunResults(data.testCaseResults); setSubmissionStatus("IDLE"); }
                else {
                    if (data.status === "PASSED") setSubmissionStatus("PASSED");
                    else { setSubmissionStatus("FAILED"); setSubmitted(false); }
                }
            }
        };
        const handleError = (data) => {
            setSubmissionStatus("IDLE");
            setSubmitted(false);
            toast.error(`Error: ${data.message || "Submission failed"}`);
        };
        socket.on("submission_result", handleResult);
        socket.on("error", handleError);
        return () => { socket.off("submission_result", handleResult); socket.off("error", handleError); };
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

    useEffect(() => {
        const tid = tournament?.id || tournament?._id;
        if (!tid || !user?.id || submitted) return;
        const syncInterval = setInterval(() => {
            if (socket && socket.connected) {
                socket.emit("squid_game:code_sync", {
                    squidGameId: tid, userId: user?.id, username: user?.username,
                    code: codeRef.current, language: langRef.current
                });
            }
        }, 3000);
        return () => clearInterval(syncInterval);
    }, [tournament, user?.id, socket, submitted]);

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--color-bg-dark)] flex flex-col font-sans">
            {/* Simple Clean Header */}
            <header className="h-20 bg-[var(--color-bg-card)] border-b border-[var(--glass-border)] px-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-10">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black tracking-widest text-[var(--color-primary)] uppercase">Round 0{roundNum}</span>
                        </div>
                        <h1 className="text-xl font-black text-[var(--color-text-main)] truncate max-w-[250px] tracking-tight">
                            {problem?.title || "Loading Problem..."}
                        </h1>
                    </div>

                    <div className="hidden md:flex items-center gap-8 border-l border-[var(--glass-border)] pl-10">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Difficulty</span>
                            <span className={`text-[10px] font-black uppercase ${
                                problem?.difficulty === "HARD" ? "text-red-500" : "text-[var(--color-primary)]"
                            }`}>
                                {problem?.difficulty || "EASY"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Status</span>
                            <span className="text-[10px] font-black text-[var(--color-text-main)]">
                                {leaderboard?.length || 0} SURVIVORS LEFT
                            </span>
                        </div>
                    </div>
                </div>

                {/* Central Timer - Minimalists */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <div className={`flex items-center gap-3 px-6 py-2 rounded-sm border border-[var(--glass-border)] bg-black/20 ${timeLeft < 60 ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                        <Timer size={16} className={timeLeft < 60 ? "text-red-500 animate-pulse" : "text-[var(--color-text-muted)]"} />
                        <span className={`text-3xl font-mono font-black tabular-nums tracking-tighter ${timeLeft < 60 ? 'text-red-500' : 'text-[var(--color-text-main)]'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <div className="w-32 h-1 bg-[var(--glass-border)] rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: "100%" }}
                            animate={{ width: `${(timeLeft / 600) * 100}%` }}
                            className={`h-full ${timeLeft < 60 ? 'bg-red-500' : 'bg-[var(--color-primary)]'}`}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Language</span>
                        <select 
                            value={language} 
                            onChange={handleLangChange} 
                            className="bg-transparent border-none text-[11px] font-black uppercase tracking-wider text-[var(--color-text-main)] focus:outline-none cursor-pointer"
                        >
                            <option value="java" className="bg-[#1e1e1e]">Java</option>
                            <option value="cpp" className="bg-[#1e1e1e]">C++</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRun}
                            disabled={submitted || submissionStatus === "PENDING" || submissionStatus === "PASSED"}
                            className="p-3 bg-white/5 border border-white/5 text-white/30 hover:text-white hover:border-white/20 transition-all rounded-sm disabled:opacity-20"
                        >
                            <Play size={16} />
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitted || submissionStatus === "PENDING" || submissionStatus === "PASSED"}
                            className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-sm ${
                                submissionStatus === "PASSED" ? "bg-green-600 text-white" :
                                submissionStatus === "FAILED" ? "bg-red-600 text-white" :
                                submissionStatus === "PENDING" ? "bg-white/10 text-white/50" :
                                "bg-[var(--color-primary)] text-black hover:brightness-110"
                            }`}
                        >
                            {submissionStatus === "PENDING" ? "Judging..." : submissionStatus === "PASSED" ? "Passed" : submissionStatus === "FAILED" ? "Retry" : "Submit Solution"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex min-h-0">
                {/* Left Side: Problem & Tests */}
                <div className="w-[35%] border-r border-[var(--glass-border)] flex flex-col bg-black/20 overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                        <div className="flex items-center gap-2 mb-10 opacity-30">
                            <Layout size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Problem Description</span>
                        </div>
                        
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-[var(--color-text-main)] tracking-tight">
                                {problem?.title}
                            </h2>
                            <div className="prose prose-invert prose-sm text-[var(--color-text-muted)] font-medium leading-relaxed">
                                {problem?.description}
                            </div>
                        </div>

                        <AnimatePresence>
                            {runResults && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-12 pt-12 border-t border-[var(--glass-border)]"
                                >
                                    <div className="flex items-center gap-2 mb-6">
                                        <Terminal size={14} className="text-[var(--color-primary)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Run Results</span>
                                    </div>
                                    <div className="space-y-3">
                                        {runResults.map((res, i) => (
                                            <div key={i} className={`p-4 rounded-sm border ${res.passed ? 'border-green-500/10 bg-green-500/5' : 'border-red-500/10 bg-red-500/5'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black uppercase text-white/20">Test Case 0{i + 1}</span>
                                                    <span className={`text-[9px] font-black uppercase ${res.passed ? 'text-green-500' : 'text-red-500'}`}>
                                                        {res.passed ? 'Passed' : 'Failed'}
                                                    </span>
                                                </div>
                                                {!res.passed && (
                                                    <div className="mt-4 space-y-3 text-[10px] font-mono">
                                                        <div className="text-red-400 bg-black/40 p-2 rounded-sm border border-red-500/10">
                                                            {res.error || res.actual || "No output"}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Ranking Sidebar (Integrated) */}
                    <div className="bg-black/40 border-t border-[var(--glass-border)] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Trophy size={14} className="text-white/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Standings</span>
                            </div>
                            <span className="text-[9px] font-black text-[var(--color-primary)]">{(leaderboard?.length || 0)} ACTIVE</span>
                        </div>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                            {leaderboard?.slice(0, 5).map((entry, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-sm">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black ${i === 0 ? 'text-[var(--color-primary)]' : 'text-white/30'}`}>#{i + 1}</span>
                                        <span className="text-xs font-bold text-white/70">{entry.username}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-white/40">{entry.score} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Code Editor */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    <div className="flex-1 min-h-0">
                        <CodeEditor
                            language={LANGUAGES[language]?.monaco || LANGUAGES.java.monaco}
                            value={code}
                            onChange={(v) => setCode(v || "")}
                        />
                    </div>
                    <div className="h-10 bg-[#151515] border-t border-[var(--glass-border)] px-6 flex items-center justify-between">
                         <div className="flex items-center gap-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                            <Code2 size={12} /> Environment: {language.toUpperCase()} / {LANGUAGES[language]?.monaco}
                         </div>
                         <div className="text-[9px] font-mono text-white/10 uppercase tracking-widest">
                             ChallegX Integrated Arena System
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RoundScreen;
