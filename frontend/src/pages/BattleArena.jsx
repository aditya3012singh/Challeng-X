import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Editor from "@monaco-editor/react";
import {
    Zap, Terminal, Clock, Shield, ChevronLeft,
    Activity, Play, Send, X, Trophy, AlertTriangle,
    Monitor, Cpu, Globe, Rocket, Power, Target, Check, ShieldAlert, Code,
    ChevronUp, ChevronDown, ChevronRight, MousePointer2, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getSocket } from "../../lib/socket";
import { getBattle, submitBattleCode, forfeitBattle } from "../../store/api/battle.thunk";
import { clearCurrentBattle } from "../../store/slices/battle.slice";
import { playSound } from "../utils/audio";

const LANGUAGES = {
    java: { monaco: "java", defaultCode: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello World!");\n    }\n}` },
    cpp: { monaco: "cpp", defaultCode: `#include <iostream>\n\nint main() {\n    // Your code here\n    std::cout << "Hello World!" << std::endl;\n    return 0;\n}` },
    python: { monaco: "python", defaultCode: `# Your code here\nprint("Hello World!")` },
    javascript: { monaco: "javascript", defaultCode: `// Your code here\nconsole.log("Hello World!");` }
};

const BattleArena = () => {
    const { battleId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { currentBattle, loading } = useSelector((state) => state.battle);
    const { problem, player1, player2 } = currentBattle || {};
    const opponent = player1?.id === user?.id ? player2 : player1;

    // Editor State
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("java");
    const [theme, setTheme] = useState("vs-dark");

    // Match State
    const [status, setStatus] = useState("idle"); // idle, running, result, finished
    const [message, setMessage] = useState("");
    const [countdown, setCountdown] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [winner, setWinner] = useState(null);

    // Progress Tracking
    const [myProgress, setMyProgress] = useState({ passed: 0, total: 0 });
    const [opponentProgress, setOpponentProgress] = useState({ passed: 0, total: 0 });
    const [opponentStatus, setOpponentStatus] = useState("idle"); // idle, submitting
    const [opponentAlert, setOpponentAlert] = useState(null); // { type, message }

    const [testResults, setTestResults] = useState([]); // Array of { input, expected, actual, passed, error }
    const [pendingSubmissionId, setPendingSubmissionId] = useState(null);

    // Multi-panel focus
    const [activeTab, setActiveTab] = useState("description"); // description, console
    const [sidebarWidth, setSidebarWidth] = useState(400); // px
    const [isResizing, setIsResizing] = useState(false);

    // Timer state
    // Timer state
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
    const [timerActive, setTimerActive] = useState(false);

    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [mobileTab, setMobileTab] = useState("problem"); // problem, editor, console, status
    const [showMobileTools, setShowMobileTools] = useState(false);
    const [runningAction, setRunningAction] = useState(null); // "RUN" or "SUBMIT"

    const socket = getSocket();
    const editorRef = useRef(null);
    const terminalEndRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        if (battleId) {
            dispatch(getBattle({ battleId }));
            socket.emit("join_battle", { battleId });
        }
        return () => {
            dispatch(clearCurrentBattle());
        }
    }, [battleId, dispatch]);    // Timer logic
    useEffect(() => {
        if (currentBattle?.startedAt && currentBattle?.status === "ONGOING") {
            const start = new Date(currentBattle.startedAt).getTime();
            const now = new Date().getTime();
            const elapsed = Math.floor((now - start) / 1000);
            const remaining = Math.max(0, 1800 - elapsed);
            setTimeLeft(remaining);
            setTimerActive(true);
        }
    }, [currentBattle]);

    useEffect(() => {
        let timer;
        if (timerActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false);
        }
        return () => clearInterval(timer);
    }, [timerActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatElapsed = (startedAt) => {
        if (!startedAt) return "00:00";
        const start = new Date(startedAt).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - start) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Resize logic
    const startResizing = useCallback((e) => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 200 && newWidth < window.innerWidth * 0.6) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle Forfeit
    const handleForfeit = async () => {
        if (window.confirm("Are you sure you want to leave this match? This will count as a loss.")) {
            await dispatch(forfeitBattle({ battleId })).unwrap();
            navigate('/battles');
        }
    };

    const moveCursor = (direction) => {
        if (!editorRef.current) return;
        const editor = editorRef.current;
        const position = editor.getPosition();
        let newPosition = { ...position };

        switch (direction) {
            case 'up': newPosition.lineNumber = Math.max(1, position.lineNumber - 1); break;
            case 'down': newPosition.lineNumber = position.lineNumber + 1; break;
            case 'left': newPosition.column = Math.max(1, position.column - 1); break;
            case 'right': newPosition.column = position.column + 1; break;
        }

        editor.setPosition(newPosition);
        editor.revealPositionInCenterIfOutsideViewport(newPosition);
        editor.focus();
    };

    // Handle Socket Events
    useEffect(() => {
        if (!socket) return;

        const handleEvent = (event, data) => {
            if (event === "submission_progress") {
                if (data.userId === user?.id) {
                    setMyProgress({ passed: data.passed, total: data.total });
                } else if (data.userId === opponent?.id) {
                    setOpponentProgress({ passed: data.passed, total: data.total });
                }
            }

            if (event === "submission_result") {
                if (data.userId === user?.id) {
                    setStatus("result");
                    setActiveTab("console");

                    if (data.type === "SUBMIT" && data.status === "FAILED") {
                        setTestResults([{
                            input: data.input,
                            expected: data.expectedOutput,
                            actual: data.actualOutput,
                            error: data.errorMessage,
                            passed: false
                        }]);
                    } else if (data.type === "SUBMIT" && data.status === "PASSED") {
                        // For successful submit, we might not have results array, so set a summary
                        setTestResults([{
                            summary: true,
                            passed: true,
                            message: "Success: All test cases passed!"
                        }]);
                    } else {
                        setTestResults(data.testCaseResults || []);
                    }

                    if (data.status === "PASSED") {
                        setMessage("Submission Successful!");
                        setMyProgress({ passed: data.totalTests || 1, total: data.totalTests || 1 });
                    } else {
                        setMessage(`Submission Failed: ${data.errorMessage || "Error encountered"}`);
                    }
                    setRunningAction(null);
                } else if (data.userId === opponent?.id) {
                    setOpponentStatus("idle");
                    setOpponentProgress({ passed: data.passedTests || 0, total: data.totalTests || 100 });
                }
            }

            if (event === "opponent_submitted") {
                if (data.userId === opponent?.id) {
                    setOpponentStatus("submitting");
                    setTimeout(() => setOpponentStatus("idle"), 5000); // Fallback
                }
            }

            if (event === "opponent_cheat_flag") {
                setOpponentAlert({
                    type: data.type,
                    message: data.type === "TAB_SWITCH" ? "Opponent switched tabs" : "Opponent pasted code"
                });
                setTimeout(() => setOpponentAlert(null), 8000);
            }

            if (event === "battle_end") {
                setIsFinished(true);
                setWinner(data.winnerId);
                setStatus("finished");
            }
        };

        socket.onAny(handleEvent);
        return () => socket.offAny(handleEvent);
    }, [socket, user, opponent]);

    // Client-side Anti-Cheat Detection
    useEffect(() => {
        if (!socket || !battleId || !user) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                socket.emit("anti_cheat_flag", {
                    battleId,
                    userId: user.id,
                    username: user.username,
                    type: "TAB_SWITCH",
                    timestamp: new Date().toISOString()
                });
            }
        };

        const handleGlobalPaste = (e) => {
            const pastedText = e.clipboardData?.getData('text') || "";
            if (pastedText.length > 50) { // Only flag significant pastes
                socket.emit("anti_cheat_flag", {
                    battleId,
                    userId: user.id,
                    username: user.username,
                    type: "CODE_PASTE",
                    charCount: pastedText.length,
                    timestamp: new Date().toISOString()
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('paste', handleGlobalPaste);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('paste', handleGlobalPaste);
        };
    }, [socket, battleId, user]);

    // Sync Finished Status from Initial Load
    useEffect(() => {
        if (currentBattle?.status === "FINISHED") {
            setIsFinished(true);
            setWinner(currentBattle.winnerId);
            setStatus("finished");
        }
    }, [currentBattle]);

    // Set Initial Language/Code with Persistence
    const hasInitializedCode = useRef(false);
    useEffect(() => {
        if (currentBattle?.problem && !hasInitializedCode.current) {
            // Try to load from localStorage first
            const savedCode = localStorage.getItem(`battle_code_${battleId}`);
            const savedLang = localStorage.getItem(`battle_lang_${battleId}`);

            if (savedCode && savedLang) {
                setCode(savedCode);
                setLanguage(savedLang);
            } else {
                const defaultLang = "java";
                setLanguage(defaultLang);
                setCode(LANGUAGES[defaultLang].defaultCode);
            }
            hasInitializedCode.current = true;
        }
    }, [currentBattle, battleId]);

    // Persist code on change
    useEffect(() => {
        if (battleId && code && hasInitializedCode.current) {
            localStorage.setItem(`battle_code_${battleId}`, code);
        }
    }, [code, battleId]);

    useEffect(() => {
        if (battleId && language && hasInitializedCode.current) {
            localStorage.setItem(`battle_lang_${battleId}`, language);
        }
    }, [language, battleId]);

    const handleRun = async (type = "RUN") => {
        if (status === "running") return;

        setStatus("running");
        setRunningAction(type);
        if (isMobile) {
            setTimeout(() => {
                setMobileTab("console");
            }, 300);
        }
        setMessage(type === "RUN" ? "Running tests..." : "Submitting code...");
        setMyProgress({ passed: 0, total: 100 }); // Reset visual progress

        try {
            await dispatch(submitBattleCode({ battleId, code, language, type })).unwrap();
        } catch (error) {
            setStatus("result");
            setMessage(`❌ Deployment Failed: ${error.message || "Unknown Error"}`);
            setRunningAction(null);
        }
    };

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(LANGUAGES[lang].defaultCode);
    };

    const renderConsole = () => {
        if (status === "idle") return (
            <div className="h-full flex items-center justify-center text-slate-700 italic text-xs">
                Waiting for transmission...
            </div>
        );

        return (
            <div className="space-y-6 text-xs font-mono p-2">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Terminal size={14} className="text-[var(--color-primary)]" />
                    <span className="text-[var(--color-primary)] font-black uppercase tracking-widest">{message}</span>
                </div>

                {testResults.length > 0 ? (
                    <div className="space-y-4">
                        {testResults.map((res, i) => (
                            <div key={i} className={`p-4 border ${res.passed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`} style={{ borderRadius: "2px" }}>
                                {res.summary ? (
                                    <div className="flex items-center gap-3">
                                        <Check size={16} className="text-green-500" />
                                        <span className="text-green-500 font-black uppercase tracking-widest">{res.message}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className={`font-black uppercase tracking-widest ${res.passed ? 'text-green-500' : 'text-red-500'}`}>
                                                Test Case {i + 1}: {res.passed ? 'PASSED' : 'FAILED'}
                                            </span>
                                            {res.passed ? <Check size={12} className="text-green-500" /> : <AlertTriangle size={12} className="text-red-500" />}
                                        </div>
                                        <div className="space-y-2 opacity-80">
                                            <div className="flex gap-2">
                                                <span className="text-slate-500 w-20">Input:</span>
                                                <span className="text-white break-all">{res.input}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-slate-500 w-20">Expected:</span>
                                                <span className="text-green-400 break-all">{res.expected}</span>
                                            </div>
                                            {!res.passed && (
                                                <div className="flex gap-2">
                                                    <span className="text-slate-500 w-20">Actual:</span>
                                                    <span className="text-red-400 break-all">{res.actual || (res.error ? "Error" : "N/A")}</span>
                                                </div>
                                            )}
                                            {res.error && (
                                                <div className="mt-2 pt-2 border-t border-red-500/10 text-red-400 text-[10px] italic">
                                                    {res.error}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-1 h-1 bg-[var(--color-primary)] rounded-full" />
                        <span className="text-[var(--color-primary)] uppercase tracking-widest text-[10px]">Processing data packets...</span>
                    </div>
                )}
            </div>
        );
    };

    if ((loading && !currentBattle) || !currentBattle || !problem) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Cpu size={24} className="text-[var(--color-primary)] animate-pulse" />
                        </div>
                    </div>
                    <div className="text-[var(--color-primary)] text-xs font-black uppercase tracking-[0.5em] font-mono animate-pulse">Initializing Arena...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#050505] text-slate-300 flex flex-col overflow-hidden font-mono selection:bg-[var(--color-primary)] selection:text-black">

            {/* MATCH HEADER */}
            <header className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0 relative z-40">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/')} className="hover:text-[var(--color-primary)] transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-ping" />
                        <h1 className="text-sm font-black tracking-tighter uppercase text-white">
                            Match ID: <span className="text-[var(--color-primary)]">{battleId?.slice(-8) || "..."}</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10" style={{ borderRadius: "2px" }}>
                    <div className="w-1.5 h-1.5 bg-red-500 animate-pulse rounded-full" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-100">{formatTime(timeLeft)}</span>
                </div>

                <div className="h-4 w-[1px] bg-white/10 mx-2" />

                <button
                    onClick={handleForfeit}
                    className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-all group"
                    style={{ borderRadius: "2px" }}
                >
                    <Power size={14} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Abandon</span>
                </button>
            </header>

            {/* MAIN ARENA CONTENT */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* MOBILE TABS - PREMIUM SEGMENTED CONTROL */}
                <div className="flex lg:hidden bg-[#0a0a0a] border-b border-white/10 shrink-0 h-12 px-2 items-center">
                    <div className="flex w-full bg-white/5 rounded-lg p-1 relative h-9">
                        {[
                            { id: 'problem', label: 'Problem', icon: Target },
                            { id: 'editor', label: 'Editor', icon: Code },
                            { id: 'console', label: 'Console', icon: Terminal },
                            { id: 'status', label: 'Status', icon: Monitor }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setMobileTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-colors relative z-10 ${mobileTab === tab.id ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                            >
                                <tab.icon size={11} />
                                <span className={isMobile ? "hidden xs:inline" : "inline"}>{tab.label}</span>
                                {mobileTab === tab.id && (
                                    <motion.div
                                        layoutId="mobileTabPill"
                                        className="absolute inset-0 bg-white/10 rounded-md shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                    />
                                )}
                                {tab.id === 'console' && status === 'running' && (
                                    <div className="absolute top-1 right-1 w-1 h-1 bg-[var(--color-primary)] rounded-full animate-ping" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LEFT SIDEBAR - Problem (Desktop: Resizable, Mobile: Tabbed) */}
                <div
                    className={`flex-1 min-h-0 border-r border-white/5 bg-[#080808] relative group/sidebar 
                        ${mobileTab === "problem" || mobileTab === "console" ? "flex flex-col" : "hidden lg:flex lg:flex-col"}`}
                    style={{ width: isMobile ? '100%' : `${sidebarWidth}px` }}
                >
                    {/* Resize Handle - Desktop Only */}
                    {!isMobile && (
                        <div
                            onMouseDown={startResizing}
                            className={`absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-50 transition-colors ${isResizing ? 'bg-[var(--color-primary)]' : 'hover:bg-[var(--color-primary)]/30'}`}
                        />
                    )}

                    {!isMobile && (
                        <div className="flex border-b border-white/5 shrink-0">
                            <button
                                onClick={() => setActiveTab("description")}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === "description" ? "text-[var(--color-primary)] bg-white/5 shadow-[inset_0_-2px_0_var(--color-primary)]" : "text-slate-600 hover:text-slate-300"}`}
                            >
                                <Target size={14} /> Problem
                            </button>
                            <button
                                onClick={() => setActiveTab("console")}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === "console" ? "text-[var(--color-primary)] bg-white/5 shadow-[inset_0_-2px_0_var(--color-primary)]" : "text-slate-600 hover:text-slate-300"}`}
                            >
                                <Terminal size={14} /> Console {status !== "idle" && <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-ping" />}
                            </button>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
                        {((isMobile && mobileTab === "problem") || (!isMobile && activeTab === "description")) ? (
                            <div className="space-y-8 lg:space-y-12">
                                <section>
                                    <div className="flex items-center justify-between mb-4 lg:mb-8">
                                        <div className="px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] font-black uppercase tracking-widest">
                                            {problem.difficulty}
                                        </div>
                                    </div>
                                    <h2 className="text-xl lg:text-2xl font-black text-white mb-4 lg:mb-6 tracking-tight uppercase leading-tight">{problem.title}</h2>
                                    <div className="prose prose-invert prose-sm max-w-none text-slate-400 font-light leading-relaxed mb-8 lg:mb-12">
                                        {problem.description}
                                    </div>
                                </section>

                                {problem.testcases?.some(tc => tc.isSample) && (
                                    <section>
                                        <h3 className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.3em] mb-4 lg:mb-6 flex items-center gap-3">
                                            <div className="w-4 h-[1px] bg-[var(--color-primary)]/30" /> Sample Test Cases
                                        </h3>
                                        <div className="space-y-4">
                                            {problem.testcases.filter(tc => tc.isSample).map((tc, i) => (
                                                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-sm">
                                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Example {i + 1}</div>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <div className="text-[8px] font-black text-slate-700 uppercase mb-2">Input</div>
                                                            <pre className="p-3 bg-black/40 text-[11px] text-white font-mono overflow-x-auto border border-white/5">{tc.input}</pre>
                                                        </div>
                                                        <div>
                                                            <div className="text-[8px] font-black text-slate-700 uppercase mb-2">Expected Output</div>
                                                            <pre className="p-3 bg-black/40 text-[11px] text-[var(--color-primary)] font-mono overflow-x-auto border border-white/5">{tc.output}</pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {problem.constraints && (
                                    <section>
                                        <h3 className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.3em] mb-4 lg:mb-6 flex items-center gap-3">
                                            <div className="w-4 h-[1px] bg-[var(--color-primary)]/30" /> System Constraints
                                        </h3>
                                        <ul className="space-y-3">
                                            {(typeof problem.constraints === 'string' ? problem.constraints.split('\n') : problem.constraints).map((c, i) => (
                                                <li key={i} className="flex items-start gap-3 text-[11px] lg:text-xs text-slate-500 italic">
                                                    <div className="mt-1.5 w-1 h-1 bg-[var(--color-primary)] rounded-full shadow-[0_0_5px_var(--color-primary)]" />
                                                    {c}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>
                        ) : (
                            renderConsole()
                        )}
                    </div>

                    {/* ACTIONS POD - Desktop Only here, mobile shows it inside editor tab */}
                    {!isMobile && (
                        <div className="p-6 bg-[#0a0a0a] border-t border-white/5 grid grid-cols-2 gap-4 shrink-0">
                            <button
                                onClick={() => handleRun("RUN")}
                                disabled={status === "running"}
                                className="py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-white hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {runningAction === "RUN" ? <Loader2 size={12} className="animate-spin text-[var(--color-primary)]" /> : <Play size={12} fill="currentColor" />} Run Test
                            </button>
                            <button
                                onClick={() => handleRun("SUBMIT")}
                                disabled={status === "running"}
                                className="py-3 bg-[var(--color-primary)] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.1)] flex items-center justify-center gap-2"
                            >
                                {runningAction === "SUBMIT" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} fill="currentColor" />} Submit Data
                            </button>
                        </div>
                    )}
                </div>

                {/* CENTER - CODE EDITOR */}
                <div className={`flex-1 min-h-0 flex flex-col bg-[#050505] min-w-0 lg:min-w-[400px] 
                    ${mobileTab === "editor" ? "flex" : "hidden lg:flex"}`}>
                    {/* EDITOR TOOLBAR */}
                    <div className="h-10 lg:h-12 border-b border-white/5 bg-[#080808] flex items-center justify-between px-4 lg:px-6 shrink-0">
                        <div className="flex items-center gap-4 lg:gap-6">
                            <div className="flex items-center gap-2 border-r border-white/10 pr-4 lg:pr-6">
                                <Globe size={14} className="text-slate-500" />
                                <select
                                    value={language}
                                    onChange={handleLanguageChange}
                                    className="bg-transparent text-[9px] lg:text-[10px] font-black text-white outline-none uppercase tracking-widest cursor-pointer hover:text-[var(--color-primary)] transition-colors"
                                >
                                    {Object.keys(LANGUAGES).map(lang => (
                                        <option key={lang} value={lang} className="bg-[#0a0a0a]">{lang}</option>
                                    ))}
                                </select>
                            </div>

                            {isMobile && (
                                <button
                                    onClick={() => setShowMobileTools(!showMobileTools)}
                                    className={`p-2 rounded-sm border transition-all ${showMobileTools ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]/40 text-[var(--color-primary)]' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                >
                                    <MousePointer2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* MONACO EDITOR CONTAINER */}
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={LANGUAGES[language].monaco}
                            value={code}
                            onChange={(val) => setCode(val)}
                            onMount={(editor) => {
                                editorRef.current = editor;
                            }}
                            options={{
                                minimap: { enabled: false },
                                fontSize: isMobile ? 12 : 13,
                                fontFamily: "var(--font-mono)",
                                fontLigatures: true,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 20 },
                                cursorStyle: "block",
                                lineNumbersMinChars: isMobile ? 2 : 3,
                                renderLineHighlight: "all",
                                scrollbar: {
                                    vertical: "auto",
                                    horizontal: "auto",
                                    verticalScrollbarSize: 8,
                                    horizontalScrollbarSize: 8,
                                },
                                quickSuggestions: !isMobile,
                                hover: { enabled: !isMobile },
                            }}
                        />

                        {/* MOBILE D-PAD */}
                        {isMobile && showMobileTools && (
                            <div className="absolute bottom-6 right-6 z-50 flex flex-col items-center gap-2 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] scale-90 sm:scale-100">
                                <button onClick={() => moveCursor('up')} className="p-3 bg-white/5 border border-white/10 rounded-lg active:bg-[var(--color-primary)]/20 active:border-[var(--color-primary)]/40"><ChevronUp size={20} /></button>
                                <div className="flex gap-2">
                                    <button onClick={() => moveCursor('left')} className="p-3 bg-white/5 border border-white/10 rounded-lg active:bg-[var(--color-primary)]/20 active:border-[var(--color-primary)]/40"><ChevronLeft size={20} /></button>
                                    <button onClick={() => moveCursor('down')} className="p-3 bg-white/5 border border-white/10 rounded-lg active:bg-[var(--color-primary)]/20 active:border-[var(--color-primary)]/40"><ChevronDown size={20} /></button>
                                    <button onClick={() => moveCursor('right')} className="p-3 bg-white/5 border border-white/10 rounded-lg active:bg-[var(--color-primary)]/20 active:border-[var(--color-primary)]/40"><ChevronRight size={20} /></button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MOBILE ACTIONS POD - STICKY FOR BETTER ACCESSIBILITY */}
                    {isMobile && (
                        <div className="sticky bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-white/5 grid grid-cols-2 gap-4 shrink-0 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                            <button
                                onClick={() => handleRun("RUN")}
                                disabled={status === "running"}
                                className="py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                {runningAction === "RUN" ? <Loader2 size={12} className="animate-spin text-[var(--color-primary)]" /> : <Play size={12} fill="currentColor" />} Run
                            </button>
                            <button
                                onClick={() => handleRun("SUBMIT")}
                                disabled={status === "running"}
                                className="py-3 bg-[var(--color-primary)] text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,170,0,0.2)]"
                            >
                                {runningAction === "SUBMIT" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} fill="currentColor" />} Submit
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDEBAR - Opponent Progress (Desktop: Static, Mobile: Tabbed) */}
                <aside className={`w-full lg:w-[300px] flex-1 min-h-0 border-l border-white/5 bg-[#080808] shrink-0 
                    ${mobileTab === "status" ? "flex flex-col" : "hidden lg:flex lg:flex-col"}`}>
                    <div className="p-6 border-b border-white/5 bg-[#0a0a0a]">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Match Status</div>

                        <div className="space-y-8">
                            {/* LOCAL PROGRESS */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{user?.username}</span>
                                    <span className="text-[var(--color-primary)] font-mono text-xs font-black">{myProgress.passed}/{myProgress.total || 0}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 border border-white/5 overflow-hidden" style={{ borderRadius: "1px" }}>
                                    <div
                                        className="h-full bg-[var(--color-primary)] transition-all duration-500 shadow-[0_0_10px_var(--color-primary)]"
                                        style={{ width: `${(myProgress.passed / (myProgress.total || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="h-[1px] bg-white/5 w-1/2 mx-auto" />

                            {/* OPPONENT PROGRESS */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center group">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{opponent?.username || "Awaiting..."}</span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className={`w-1 h-1 rounded-full ${opponentStatus === 'submitting' ? 'bg-[var(--color-primary)] animate-ping' : 'bg-slate-600'}`} />
                                            <span className="text-[8px] uppercase font-bold text-slate-600">{opponentStatus === 'submitting' ? 'Transmitting Data...' : 'Idle'}</span>
                                        </div>
                                    </div>
                                    <span className="text-slate-500 font-mono text-xs">{opponentProgress.passed}/{opponentProgress.total || 0}</span>
                                </div>

                                {opponentAlert && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2">
                                        <ShieldAlert size={12} />
                                        {opponentAlert.message}
                                    </div>
                                ) || (
                                        <div className="h-1.5 w-full bg-white/5 border border-white/5 overflow-hidden" style={{ borderRadius: "1px" }}>
                                            <div
                                                className="h-full bg-white/20 transition-all duration-500"
                                                style={{ width: `${(opponentProgress.passed / (opponentProgress.total || 1)) * 100}%` }}
                                            />
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Anti-Cheat Stream</div>
                        <div className="space-y-4">
                            {opponentAlert ? (
                                <div className="p-4 bg-red-900/10 border-l-2 border-red-500">
                                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Violation Detected</div>
                                    <div className="text-[9px] text-red-400 italic">Opponent engaged in prohibited activity: {opponentAlert.type}</div>
                                </div>
                            ) : (
                                <div className="h-24 border-2 border-dashed border-white/5 flex items-center justify-center p-4 text-center">
                                    <span className="text-[8px] uppercase font-bold text-slate-700 tracking-widest">No violations detected in current stream</span>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </main>

            {/* PREMIUM FINISH OVERLAY */}
            {isFinished && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
                    <style>{`
                        @keyframes confetti-fall {
                            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                        }
                        .confetti {
                            position: absolute;
                            width: 10px;
                            height: 10px;
                            background: var(--color-primary);
                            animation: confetti-fall 4s linear infinite;
                        }
                        @keyframes pulse-glow {
                            0%, 100% { filter: drop-shadow(0 0 20px var(--color-primary)); transform: scale(1); }
                            50% { filter: drop-shadow(0 0 50px var(--color-primary)); transform: scale(1.1); }
                        }
                        .winner-trophy {
                            animation: pulse-glow 2s ease-in-out infinite;
                        }
                    `}</style>

                    {/* Confetti Particles for Winner */}
                    {winner === user?.id && [...Array(40)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                backgroundColor: ['#ccff00', '#00ffcc', '#ff00ff', '#ffffff'][Math.floor(Math.random() * 4)],
                                width: `${Math.random() * 8 + 4}px`,
                                height: `${Math.random() * 8 + 4}px`,
                                clipPath: ['circle(50%)', 'polygon(50% 0%, 0% 100%, 100% 100%)', 'none'][Math.floor(Math.random() * 3)]
                            }}
                        />
                    ))}

                    <div className="max-w-2xl w-full bg-[#0a0a0a]/80 border border-white/10 p-12 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]" style={{ borderRadius: "4px" }}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />

                        <div className="flex flex-col items-center">
                            <div className={`mb-12 relative ${winner === user?.id ? 'winner-trophy' : ''}`}>
                                <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative z-10">
                                    {winner === user?.id ? (
                                        <Trophy size={64} className="text-[var(--color-primary)]" />
                                    ) : (
                                        <AlertTriangle size={64} className="text-red-500" />
                                    )}
                                </div>
                                <div className={`absolute inset-0 blur-[80px] opacity-20 rounded-full ${winner === user?.id ? 'bg-[var(--color-primary)]' : 'bg-red-500'}`} />
                            </div>

                            <div className="text-[12px] font-black text-[var(--color-primary)] tracking-[1em] uppercase mb-4 opacity-70">
                                {winner === user?.id ? "Superiority Established" : "Signal Terminated"}
                            </div>

                            <h1 className="text-8xl font-black text-white tracking-tighter uppercase mb-2 leading-none">
                                {winner === user?.id ? "You Won" : "Match Over"}
                            </h1>

                            <p className="text-slate-500 text-sm font-medium mb-12 uppercase tracking-[0.2em]">
                                {winner === user?.id
                                    ? "Competitive objectives completed with high efficiency."
                                    : "Operational failure. Opponent achieved target first."}
                            </p>

                            {/* MATCH STATS */}
                            <div className="grid grid-cols-3 gap-8 w-full mb-12 p-8 bg-white/5 border border-white/5" style={{ borderRadius: "2px" }}>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] text-slate-600 font-black uppercase mb-2 tracking-widest">Time Taken</span>
                                    <span className="text-xl text-white font-mono">{formatElapsed(currentBattle?.startedAt)}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] text-slate-600 font-black uppercase mb-2 tracking-widest">Accuracy</span>
                                    <span className="text-xl text-[var(--color-primary)] font-mono">100%</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] text-slate-600 font-black uppercase mb-2 tracking-widest">Test Cases</span>
                                    <span className="text-xl text-white font-mono">{myProgress.passed}/{myProgress.total || problem.testcases?.length || 10}</span>
                                </div>
                            </div>

                            <div className="flex gap-6 w-full">
                                <button
                                    onClick={() => navigate('/battles')}
                                    className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-black transition-all"
                                >
                                    Return to Lobby
                                </button>
                                <button
                                    onClick={() => setIsFinished(false)}
                                    className="flex-2 px-12 py-5 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-[11px] hover:brightness-125 transition-all shadow-[0_0_30px_var(--color-primary)] shadow-opacity-20"
                                >
                                    Analyze Match
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BattleArena;
