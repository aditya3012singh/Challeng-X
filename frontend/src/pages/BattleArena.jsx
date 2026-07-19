import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Editor from "@monaco-editor/react";
import {
    Zap, Terminal, Clock, Shield, ChevronLeft,
    Activity, Play, Send, X, Trophy, AlertTriangle,
    Monitor, Cpu, Globe, Rocket, Power, Target, Check, ShieldAlert, Code, Sparkles,
    ChevronUp, ChevronDown, ChevronRight, MousePointer2, Loader2, Users, Swords
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useTheme } from "../context/ThemeContext";
import { getSocket } from "../../lib/socket";
import { getBattle, submitBattleCode, forfeitBattle } from "../../store/api/battle.thunk";
import { clearCurrentBattle } from "../../store/slices/battle.slice";
import { resetMatchmaking } from "../../store/slices/matchmaking.slice";
import { playSound } from "../utils/audio";
import { toast } from "react-hot-toast";
import ShareModal from "../components/common/ShareModal";
import CyberMentorModal from "../components/common/CyberMentorModal";
import CodeSurgeonModal from "../components/common/CodeSurgeonModal";
import axios from "../../lib/axios";

const LANGUAGES = {
    java: { monaco: "java", defaultCode: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello World!");\n    }\n}` },
    cpp: { monaco: "cpp", defaultCode: `#include <iostream>\n\nint main() {\n    // Your code here\n    std::cout << "Hello World!" << std::endl;\n    return 0;\n}` },
    python: { monaco: "python", defaultCode: `# Your code here\nprint("Hello World!")` },
    javascript: { monaco: "javascript", defaultCode: `// Your code here\nconsole.log("Hello World!");` }
};

const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

const BattleArena = () => {
    const { battleId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { currentBattle, loading, error } = useSelector((state) => state.battle);
    const { problem, player1, player2 } = currentBattle || {};
    const isCreator = user && player1?.id === user?.id;
    const opponent = isCreator ? player2 : player1;
    const { theme } = useTheme();

    // Editor State
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("java");

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
    const [opponentViolations, setOpponentViolations] = useState([]);

    const [testResults, setTestResults] = useState([]); // Array of { input, expected, actual, passed, error }
    const [pendingSubmissionId, setPendingSubmissionId] = useState(null);

    // Multi-panel focus
    const [activeTab, setActiveTab] = useState("description"); // description, console
    const [sidebarWidth, setSidebarWidth] = useState(400); // px
    const [isResizing, setIsResizing] = useState(false);
    const [rightSidebarWidth, setRightSidebarWidth] = useState(350); // px
    const [isResizingRight, setIsResizingRight] = useState(false);

    // Timer state
    // Timer state
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
    const [timerActive, setTimerActive] = useState(false);

    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [mobileTab, setMobileTab] = useState("problem"); // problem, editor, console, status
    const [showMobileTools, setShowMobileTools] = useState(false);
    const [runningAction, setRunningAction] = useState(null); // "RUN" or "SUBMIT"
    const [showForfeitModal, setShowForfeitModal] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isCyberMentorOpen, setIsCyberMentorOpen] = useState(false);
    const [aiHint, setAiHint] = useState("");
    const [isAILoading, setIsAILoading] = useState(false);
    const [surgeonReport, setSurgeonReport] = useState("");
    const [isSurgeonLoading, setIsSurgeonLoading] = useState(false);
    const [unlockedHints, setUnlockedHints] = useState([]);
    const [isUnlockingHint, setIsUnlockingHint] = useState(false);
    const [isSurgeonOpen, setIsSurgeonOpen] = useState(false);
    const [isAborting, setIsAborting] = useState(false);

    // Anti-Cheat Phase 2
    const [isTabSwitched, setIsTabSwitched] = useState(false);
    const [tabSwitchTimer, setTabSwitchTimer] = useState(5);
    const tabSwitchIntervalRef = useRef(null);

    const socket = getSocket();
    const editorRef = useRef(null);
    const terminalEndRef = useRef(null);
    const hiddenStartTimeRef = useRef(null);

    // Initial Fetch
    const hasFetchedRef = useRef(false);
    useEffect(() => {
        if (!battleId || hasFetchedRef.current === battleId) return;

        const joinRoom = () => {
            console.log("🔌 [Socket] Emitting join_battle for", battleId);
            socket.emit("join_battle", {
                battleId,
                isCreator: user && player1?.id === user?.id
            });
        };

        hasFetchedRef.current = battleId;
        dispatch(getBattle({ battleId }));
        dispatch(resetMatchmaking());

        // Initial join
        joinRoom();

        // Re-join on reconnection
        socket.on("connect", joinRoom);

        return () => {
            socket.off("connect", joinRoom);
            dispatch(clearCurrentBattle());
        };
    }, [battleId, dispatch]); // socket removed from deps to prevent re-runs
    useEffect(() => {
        if (currentBattle) {
            if (currentBattle.status === "FINISHED") {
                setIsFinished(true);
                setWinner(currentBattle.winnerId);
                setStatus("finished");
                setTimerActive(false);
            } else if (currentBattle.startedAt && currentBattle.status === "ONGOING") {
                const start = new Date(currentBattle.startedAt).getTime();
                const now = new Date().getTime();
                const elapsed = Math.floor((now - start) / 1000);
                const remaining = Math.max(0, 1800 - elapsed);
                setTimeLeft(remaining);
                setTimerActive(true);
            }
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

    const fetchAIHint = async () => {
        if (!problem?.id) return;
        setIsAILoading(true);
        setIsCyberMentorOpen(true);
        try {
            const response = await axios.post(`/ai/hint`, {
                problemId: problem.id,
                currentCode: code,
                language: language
            });
            setAiHint(response.data.hint);
        } catch (error) {
            console.error("AI Hint Error:", error);
            toast.error("AI Link Failed: Check connection");
            setAiHint("The neural connection was lost. Please try again later.");
        } finally {
            setIsAILoading(false);
        }
    };

    const fetchAISurgeonReport = async () => {
        if (!problem?.id) return;
        setIsSurgeonLoading(true);
        try {
            const response = await axios.post(`/ai/review`, {
                problemId: problem.id,
                finalCode: code,
                language: language,
                result: winner === user?.id ? "Victory" : "Defeat"
            });
            setSurgeonReport(response.data.report);
        } catch (error) {
            console.error("AI Surgeon Error:", error);
            setSurgeonReport("Diagnostic scan failed. The neural link is unstable.");
        } finally {
            setIsSurgeonLoading(false);
        }
    };

    const handleUnlockHint = async (index) => {
        if (unlockedHints.includes(index)) return;
        setIsUnlockingHint(true);
        try {
            const response = await axios.post(`/problem/${problem.id}/hints/unlock`, {
                hintIndex: index,
                battleId: battleId
            });
            setUnlockedHints(prev => [...prev, index]);
            // Refresh problem to get the actual hint text
            dispatch(getBattle({ battleId }));
            toast.success("Hint unlocked successfully!", { icon: '💡' });
        } catch (error) {
            console.error("Hint Unlock Error:", error);
            toast.error(error.response?.data?.message || "Connection Failed: Check Cores");
        } finally {
            setIsUnlockingHint(false);
        }
    };

    // Resize logic
    const startResizing = useCallback((e) => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
        setIsResizingRight(false);
    }, []);

    const resize = useCallback((e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 200 && newWidth < window.innerWidth * 0.45) {
                setSidebarWidth(newWidth);
            }
        }
        if (isResizingRight) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 200 && newWidth < window.innerWidth * 0.45) {
                setRightSidebarWidth(newWidth);
            }
        }
    }, [isResizing, isResizingRight]);

    const startResizingRight = useCallback((e) => {
        setIsResizingRight(true);
    }, []);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle Forfeit
    const handleForfeit = () => {
        setShowForfeitModal(true);
    };

    const confirmForfeit = async () => {
        setIsAborting(true);
        try {
            await dispatch(forfeitBattle({ battleId })).unwrap();
            toast.success("Match exited successfully", {
                position: 'top-right',
                icon: '🛡️',
                style: { borderRadius: '2px', background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }
            });
            setShowForfeitModal(false);
            navigate('/');
        } catch (err) {
            console.error(err);
            toast.error("Signal Termination Failed");
            setShowForfeitModal(false);
        } finally {
            setIsAborting(false);
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
        // Removed editor.focus() to prevent triggering virtual keyboard on mobile
    };

    // Handle Socket Events
    useEffect(() => {
        if (!socket) return;

        const handleEvent = (event, data) => {
            console.log(`📥 [SocketEvent] ${event}:`, data);

            if (event === "submission_progress") {
                const myEffectiveId = user?.id || GUEST_USER_ID;
                const isMe = data.userId === myEffectiveId;
                if (isMe) {
                    setMyProgress({ passed: data.passed, total: data.total });
                } else if (data.userId === opponent?.id) {
                    setOpponentProgress({ passed: data.passed, total: data.total });
                }
            }

            if (event === "submission_result") {
                const myEffectiveId = user?.id || GUEST_USER_ID;
                const isMe = data.userId === myEffectiveId;
                if (isMe) {
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
                        /* 
                        if (data.aiFeedback) {
                            setSurgeonReport(data.aiFeedback);
                            setIsSurgeonOpen(true);
                        }
                        */
                    } else {
                        setMessage(`Submission Failed: ${data.errorMessage || "Error encountered"}`);
                    }
                    setRunningAction(null);

                    // SYNC TO SPECTATORS: Push output results to anyone watching
                    socket.emit("spectator_output_sync", {
                        battleId,
                        userId: user?.id || GUEST_USER_ID,
                        output: data.output || (data.status === "PASSED" ? "All tests passed." : data.errorMessage),
                        status: data.status,
                        testCaseResults: data.testCaseResults,
                        beatsPercentile: data.beatsPercentile,
                        loadingAction: null
                    });
                } else if (data.userId === opponent?.id) {
                    setOpponentStatus("idle");
                    setOpponentProgress({ passed: data.passedTests || 0, total: data.totalTests || 100 });

                    if (isMobile && data.status === "PASSED") {
                        toast.success(`${opponent?.username || 'Opponent'} passed all test cases!`, {
                            icon: '🚀',
                            position: 'top-right',
                            style: { borderRadius: '2px', background: '#1a1a1a', color: '#ccff00', border: '1px solid rgba(204,255,0,0.2)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }
                        });
                    }
                }
            }

            if (event === "attempts_updated") {
                const myEffectiveId = user?.id || GUEST_USER_ID;
                if (data.userId !== myEffectiveId && data.userId === opponent?.id) {
                    setOpponentStatus("submitting");
                    setTimeout(() => setOpponentStatus("idle"), 5000);
                }
            }

            if (event === "opponent_submitted") {
                if (data.userId === opponent?.id) {
                    setOpponentStatus("submitting");
                    if (isMobile) {
                        toast(`${opponent?.username || 'Opponent'} is transmitting data...`, {
                            icon: '📡',
                            position: 'top-right',
                            style: { borderRadius: '2px', background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }
                        });
                    }
                    setTimeout(() => setOpponentStatus("idle"), 5000); // Fallback
                }
            }

            if (event === "opponent_cheat_flag") {
                const isMe = (user && data.userId === user.id) || (!user && data.userId === GUEST_USER_ID);
                if (isMe) return; // Only notify about opponent actions
                console.log("🛡️ [ANTI-CHEAT] SIGNAL RECEIVED:", data);

                const violationId = data.violationId || `${data.userId}-${Date.now()}`;

                // If it's a TAB_SWITCH END, update duration
                if (data.type === "TAB_SWITCH" && data.status === "END") {
                    console.log("🛡️ [ANTI-CHEAT] UPDATING DURATION:", data.duration);
                    setOpponentViolations(prev => {
                        const lastIdx = [...prev].reverse().findIndex(v => v.username === data.username && v.type === "TAB_SWITCH");
                        if (lastIdx !== -1) {
                            const idx = prev.length - 1 - lastIdx;
                            const updated = [...prev];
                            updated[idx] = { ...updated[idx], duration: data.duration };
                            return updated;
                        }
                        return prev;
                    });
                } else {
                    // It's a START or a regular flag (like CODE_PASTE)
                    const newViolation = {
                        id: violationId,
                        username: data.username || "Unknown",
                        type: data.type,
                        message: data.type === "TAB_SWITCH" ? "Tab Switch" : "Code Paste",
                        timestamp: new Date(data.timestamp || Date.now()).toLocaleTimeString(),
                        duration: data.duration || null
                    };

                    console.log("🛡️ [ANTI-CHEAT] ADDING NEW VIOLATION:", newViolation);
                    setOpponentViolations(prev => [...prev, newViolation]);

                    setOpponentAlert({
                        type: data.type,
                        message: data.type === "CODE_PASTE"
                            ? `${data.username || 'Opponent'} pasted ${data.charCount || 'significant'} characters!`
                            : `${data.username || 'Opponent'} engaged in ${data.type}`
                    });

                    if (isMobile) {
                        const alertMsg = data.type === "TAB_SWITCH"
                            ? `Security Alert: ${data.username || 'Opponent'} switched tab!`
                            : `Security Alert: ${data.username || 'Opponent'} pasted ${data.charCount || 'some'} characters!`;

                        toast.error(alertMsg, {
                            icon: '🛡️',
                            position: 'top-right',
                            style: { borderRadius: '2px', background: '#1a1a1a', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }
                        });
                    }
                    setTimeout(() => setOpponentAlert(null), 8000);
                }
            }

            if (event === "battle_joined" || event === "battle_countdown" || event === "battle_start") {
                if (battleId) {
                    dispatch(getBattle({ battleId }));
                    if (event === "battle_joined") {
                        toast.success("Opponent joined the arena!");
                    }
                }
            }

            if (event === "battle_end") {
                setIsFinished(true);
                setWinner(data.winnerId);
                setStatus("finished");

                // Victory Sound Synthesis
                if (data.winnerId === user?.id) {
                    try {
                        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        const playNote = (freq, startTime, duration) => {
                            const osc = audioCtx.createOscillator();
                            const gain = audioCtx.createGain();
                            osc.type = "triangle";
                            osc.frequency.setValueAtTime(freq, startTime);
                            gain.gain.setValueAtTime(0.1, startTime);
                            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                            osc.connect(gain);
                            gain.connect(audioCtx.destination);
                            osc.start(startTime);
                            osc.stop(startTime + duration);
                        };
                        const now = audioCtx.currentTime;
                        playNote(261.63, now, 0.4); // C4
                        playNote(329.63, now + 0.1, 0.4); // E4
                        playNote(392.00, now + 0.2, 0.4); // G4
                        playNote(523.25, now + 0.3, 0.6); // C5
                    } catch (e) {
                        console.error("Audio Synthesis Error:", e);
                    }
                }
            }
        };

        socket.onAny(handleEvent);
        return () => socket.offAny(handleEvent);
    }, [socket, user, opponent]);

    // Client-side Anti-Cheat Detection
    useEffect(() => {
        if (!socket || !battleId || currentBattle?.status !== "ONGOING") return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                hiddenStartTimeRef.current = Date.now();
                setIsTabSwitched(true);
                setTabSwitchTimer(5);

                socket.emit("anti_cheat_flag", {
                    battleId,
                    userId: user?.id || 'guest',
                    username: user?.username || 'Guest',
                    type: "TAB_SWITCH",
                    status: "START",
                    timestamp: new Date().toISOString()
                });
            } else {
                setIsTabSwitched(false);
                if (tabSwitchIntervalRef.current) {
                    clearInterval(tabSwitchIntervalRef.current);
                }

                if (hiddenStartTimeRef.current) {
                    const durationInMs = Date.now() - hiddenStartTimeRef.current;
                    const duration = Math.floor(durationInMs / 1000);
                    socket.emit("anti_cheat_flag", {
                        battleId,
                        userId: user?.id || GUEST_USER_ID,
                        username: user?.username || 'Guest',
                        type: "TAB_SWITCH",
                        status: "END",
                        duration: duration,
                        timestamp: new Date().toISOString()
                    });
                    hiddenStartTimeRef.current = null;
                }
            }
        };

        const handleGlobalPaste = (e) => {
            const pastedText = e.clipboardData?.getData('text') || "";
            console.log("📋 [ANTI-CHEAT] Paste event detected. Length:", pastedText.length);
            if (pastedText.length > 5) { // Lowered threshold for more reliable detection
                console.log("🚨 [ANTI-CHEAT] Significant paste flagged!");
                socket.emit("anti_cheat_flag", {
                    battleId,
                    userId: user?.id || GUEST_USER_ID,
                    username: user?.username || 'Guest',
                    type: "CODE_PASTE",
                    status: "START",
                    charCount: pastedText.length,
                    timestamp: new Date().toISOString()
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('paste', handleGlobalPaste, true); // Use capture phase to bypass editor stopPropagation
        console.log("🔒 [ANTI-CHEAT] Paste listener attached to window");

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('paste', handleGlobalPaste, true);
        };
    }, [socket, battleId, user, currentBattle?.status]);

    // Sync Finished Status from Initial Load
    useEffect(() => {
        if (currentBattle?.status === "FINISHED") {
            setIsFinished(true);
            setWinner(currentBattle.winnerId);
            setStatus("finished");
        }
    }, [currentBattle]);

    // Anti-Cheat Timer & Navigation Guard
    useEffect(() => {
        let interval;
        if (isTabSwitched && !isFinished) {
            interval = setInterval(() => {
                setTabSwitchTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        // confirmForfeit(); // DISABLED FOR TESTING PHASE
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            tabSwitchIntervalRef.current = interval;
        }

        const handlePopState = (e) => {
            if (!isFinished) {
                const stay = window.confirm("You are in an active match. Leaving will result in a loss. Stay on page?");
                if (!stay) {
                    confirmForfeit();
                } else {
                    window.history.pushState(null, null, window.location.pathname);
                }
            }
        };

        window.addEventListener("popstate", handlePopState);
        // Push state to enable popstate detection
        window.history.pushState(null, null, window.location.pathname);

        return () => {
            if (interval) clearInterval(interval);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isTabSwitched, isFinished]);

    // Set Initial Language/Code with Persistence
    const [hasInitializedCode, setHasInitializedCode] = useState(false);
    useEffect(() => {
        if (currentBattle?.problem && !hasInitializedCode) {
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
            setHasInitializedCode(true);
        }
    }, [currentBattle, battleId]);

    // Persist code on change
    useEffect(() => {
        if (battleId && code && hasInitializedCode) {
            localStorage.setItem(`battle_code_${battleId}`, code);
        }
    }, [code, battleId, hasInitializedCode]);

    useEffect(() => {
        if (battleId && language && hasInitializedCode) {
            localStorage.setItem(`battle_lang_${battleId}`, language);
        }
    }, [language, battleId, hasInitializedCode]);

    // SYNC TO SPECTATORS: Initial emission when code is loaded
    useEffect(() => {
        if (!socket || !battleId || !hasInitializedCode) return;
        // Guests only emit if they are actually in the battle (handled by backend room participation)
        // userId: user?.id || 'guest'

        socket.emit("spectator_code_sync", {
            battleId,
            userId: user?.id || GUEST_USER_ID,
            code,
            language
        });
    }, [hasInitializedCode, socket, battleId, user]); // Run when initialization finishes

    // SYNC TO SPECTATORS: Debounced real-time code streaming during typing
    useEffect(() => {
        if (!socket || !battleId || !hasInitializedCode) return;

        const timer = setTimeout(() => {
            socket.emit("spectator_code_sync", {
                battleId,
                userId: user?.id || 'guest',
                code,
                language
            });
        }, 1000); // 1s debounce to avoid overwhelming the socket

        return () => clearTimeout(timer);
    }, [code, language]); // Only run when code or language actually change

    const handleRun = async (type = "RUN") => {
        if (status === "running") return;

        // AUTH GUARD FOR SUBMISSION
        if (type === "SUBMIT" && !isAuthenticated) {
            toast.error("Authentication required for submission. Redirecting to login...", {
                icon: '🔒',
                style: { borderRadius: '2px', background: '#1a1a1a', color: '#fff' }
            });
            // Save code already happens on change, but let's be sure
            localStorage.setItem(`battle_code_${battleId}`, code);
            localStorage.setItem(`battle_lang_${battleId}`, language);

            navigate(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

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
                Waiting for results...
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
                            <div key={i} className={`p-4 border ${res.passed ? 'border-green-500/20 bg-green-500/5' : 'border-red-600/20 bg-red-600/5'}`} style={{ borderRadius: "2px" }}>
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
                                                <span className="text-[var(--color-text-muted)] w-20">Input:</span>
                                                <span className="text-[var(--color-text-main)] font-mono">{res.input}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-[var(--color-text-muted)] w-20">Expected:</span>
                                                <span className="text-green-400 font-mono">{res.expected}</span>
                                            </div>
                                            {!res.passed && (
                                                <div className="flex gap-2">
                                                    <span className="text-[var(--color-text-muted)] w-20">Actual:</span>
                                                    <span className="text-red-400 break-all">{res.actual || (res.error ? "Error" : "N/A")}</span>
                                                </div>
                                            )}
                                            {res.error && (
                                                <div className="mt-2 pt-2 border-t border-red-500/10 text-red-500 text-[10px] italic">
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

    const copySpectateLink = () => {
        const link = `${window.location.origin}/spectate/${battleId}`;
        navigator.clipboard.writeText(link);
        // We could add a toast here, but simple alert or temporary text change is fine
        setMessage("Spectate link copied!");
        setTimeout(() => setMessage(status === "result" ? "Submission Successful!" : ""), 3000);
    };

    if ((loading && !currentBattle) || !currentBattle || !problem) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--color-bg-dark)]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Cpu size={24} className="text-[var(--color-primary)] animate-pulse" />
                        </div>
                    </div>
                    <div className="text-[var(--color-primary)] text-xs font-black uppercase tracking-[0.5em] font-mono animate-pulse">Loading Arena...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-neutral-50 flex p-6 sm:p-8 flex-col gap-6 overflow-y-auto selection:bg-white selection:text-black">
            
            {/* AMBIENT BACKGROUND SYSTEM */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                    alt="Dark code editor"
                    className="object-cover opacity-[0.02] absolute inset-0 w-full h-full"
                    src="https://images.unsplash.com/photo-1518773553398-650c184e0bb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                />
                <div className="bg-[radial-gradient(circle_at_30%_20%,rgba(18,18,18,0.7),transparent_60%)] absolute inset-0" />
                <div className="bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:40px_40px] absolute inset-0" />
            </div>

            {/* HEADER BAR */}
            <div className="relative z-10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] rounded-xl bg-zinc-900 border border-zinc-800 flex px-6 py-4 justify-between items-center select-none">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="rounded-xl bg-zinc-950 border border-zinc-800 flex justify-center items-center w-11 h-11 cursor-pointer hover:bg-zinc-900 text-emerald-500 hover:text-white transition-all">
                        <Swords className="size-5" />
                    </button>
                    <div className="space-y-1 text-left">
                        <div className="font-[family:var(--font-heading)] font-semibold text-xl leading-7 tracking-tight">
                            ChallengX Combat IDE Arena
                        </div>
                        <div className="text-zinc-400 text-xs leading-4">
                            Room code: <span className="font-mono text-white select-all">{currentBattle?.battleCode}</span> · Matte Black Developer Arena
                        </div>
                    </div>
                </div>
                <div className="font-medium text-zinc-400 text-xs leading-4 flex items-center gap-3">
                    <button
                        onClick={handleForfeit}
                        className="rounded-full bg-red-950 hover:bg-red-900 text-red-500 border border-red-900/40 px-3 py-1 cursor-pointer transition-all active:scale-95 text-[10px] font-bold uppercase tracking-wider"
                    >
                        Abandon
                    </button>
                    <div className="rounded-full bg-zinc-950 border border-zinc-800 px-3 py-1 animate-pulse font-mono text-[10px] uppercase font-bold tracking-wider">
                        Time Left: {formatTime(timeLeft)}
                    </div>
                    <div className="rounded-full bg-zinc-950 text-emerald-500 border border-zinc-800 px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                        Live Match
                    </div>
                </div>
            </div>

            {/* THREE-COLUMN ARENA GRID */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_300px] flex-1 gap-6">
                
                {/* Column 1: Tabs & Problem details (280px) */}
                <div className="shadow-[0_10px_30px_rgba(0,0,0,0.28)] rounded-xl bg-zinc-900 border border-zinc-800 flex p-6 flex-col gap-6 text-left">
                    <div className="grid grid-cols-3 rounded-lg bg-zinc-950 p-1 gap-1 w-full h-auto select-none">
                        <button
                            onClick={() => setActiveTab("description")}
                            className={`border-transparent rounded-lg text-[10px] sm:text-xs leading-4 p-2 cursor-pointer transition-all ${
                                activeTab === "description"
                                    ? "bg-zinc-900 text-white font-bold border border-zinc-800"
                                    : "text-zinc-400 hover:text-white bg-transparent"
                            }`}
                        >
                            Problem
                        </button>
                        <button
                            onClick={() => setActiveTab("console")}
                            className={`border-transparent rounded-lg text-[10px] sm:text-xs leading-4 p-2 cursor-pointer transition-all ${
                                activeTab === "console"
                                    ? "bg-zinc-900 text-white font-bold border border-zinc-800"
                                    : "text-zinc-400 hover:text-white bg-transparent"
                            }`}
                        >
                            Console
                        </button>
                        <button
                            onClick={() => setActiveTab("leaderboard")}
                            className={`border-transparent rounded-lg text-[10px] sm:text-xs leading-4 p-2 cursor-pointer transition-all ${
                                activeTab === "leaderboard"
                                    ? "bg-zinc-900 text-white font-bold border border-zinc-800"
                                    : "text-zinc-400 hover:text-white bg-transparent"
                            }`}
                        >
                            Standing
                        </button>
                    </div>

                    {activeTab === "description" && (
                        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
                            {(currentBattle?.status === "WAITING" || !currentBattle?.player2Id) ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-zinc-950/80 rounded-xl border border-zinc-800/80 my-auto min-h-[350px]">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
                                        <Users size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm font-bold uppercase tracking-widest text-white font-[family:var(--font-heading)]">
                                            Awaiting Opponent
                                        </div>
                                        <p className="text-xs text-zinc-400 max-w-xs leading-relaxed font-light">
                                            The problem details will be revealed once your opponent joins the arena.
                                        </p>
                                    </div>
                                    {currentBattle?.battleCode && (
                                        <div className="w-full space-y-3 pt-2 max-w-xs">
                                            <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-semibold">
                                                Battle Sync Code
                                            </div>
                                            <div className="flex items-center justify-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                                                <span className="font-mono text-2xl font-black tracking-widest text-emerald-400">
                                                    {currentBattle.battleCode}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(currentBattle.battleCode);
                                                        toast.success("Battle code copied!");
                                                    }}
                                                    className="px-3 py-1.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                                                >
                                                    Copy Code
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 select-none">
                                        <span className="rounded-full bg-emerald-500/10 text-emerald-500 border border-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                            {problem?.difficulty || "HARD"}
                                        </span>
                                        <div className="rounded-full bg-zinc-950 text-zinc-400 text-[10px] border border-zinc-800 px-3 py-1 font-bold uppercase tracking-wider">
                                            Time Limit: 2s
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="font-[family:var(--font-heading)] font-semibold text-lg leading-7 text-white uppercase tracking-tight">
                                            {problem?.title || "Problem Description"}
                                        </div>
                                        <div className="text-zinc-300 text-xs sm:text-sm leading-6 font-light">
                                            {problem?.description}
                                        </div>
                                    </div>

                                    {problem?.testcases?.some(tc => tc.isSample) && (
                                        <div className="space-y-4">
                                            {problem.testcases.filter(tc => tc.isSample).map((tc, i) => (
                                                <div key={i} className="space-y-3">
                                                    <div className="font-[family:var(--font-heading)] font-semibold text-zinc-200 text-xs leading-5 uppercase tracking-wider">
                                                        Sample Input {i + 1}
                                                    </div>
                                                    <pre className="font-mono rounded-xl bg-zinc-950 text-zinc-300 text-[11px] leading-6 border border-zinc-800 p-4 overflow-x-auto">
                                                        {tc.input}
                                                    </pre>
                                                    <div className="font-[family:var(--font-heading)] font-semibold text-zinc-200 text-xs leading-5 uppercase tracking-wider">
                                                        Sample Output {i + 1}
                                                    </div>
                                                    <pre className="font-mono rounded-xl bg-zinc-950 text-emerald-500 text-[11px] leading-6 border border-zinc-800 p-4 overflow-x-auto">
                                                        {tc.output}
                                                    </pre>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === "console" && (
                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                            {renderConsole()}
                        </div>
                    )}

                    {activeTab === "leaderboard" && (
                        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar text-xs">
                            <div className="space-y-4">
                                <div className="font-[family:var(--font-heading)] font-semibold text-sm leading-5 uppercase tracking-wider text-neutral-400">Live Standing</div>
                                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center">
                                    <span className="text-white font-bold">{opponent?.username || "Player A"}</span>
                                    <span className="font-mono text-emerald-500">{myProgress.passed}/{myProgress.total || problem?.testcases?.length || 10}</span>
                                </div>
                                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center">
                                    <span className="text-zinc-400">{opponent?.username || "Player B"}</span>
                                    <span className="font-mono text-amber-500">{opponentProgress.passed}/{opponentProgress.total || problem?.testcases?.length || 10}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Column 2: Code Editor panel (flex-1) */}
                <div className="shadow-[0_10px_30px_rgba(0,0,0,0.28)] rounded-xl bg-zinc-900 border border-zinc-800 flex p-6 flex-col gap-4">
                    {/* Control Deck Header */}
                    <div className="rounded-xl bg-zinc-950 border border-zinc-800 flex px-4 py-3 justify-between items-center gap-3 select-none">
                        <div className="flex items-center gap-3">
                            <div className="space-y-0.5 text-left">
                                <div className="font-[family:var(--font-heading)] font-semibold text-sm leading-5 text-white">
                                    Editor Control Deck
                                </div>
                                <div className="text-zinc-400 text-xs leading-4">
                                    Monaco-style Combat coding
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={language}
                                onChange={handleLanguageChange}
                                className="rounded-lg bg-zinc-900 text-neutral-50 text-xs leading-4 border border-zinc-800 px-3 py-1.5 outline-none cursor-pointer focus:border-white/10"
                            >
                                {Object.keys(LANGUAGES).map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setCode(LANGUAGES[language].defaultCode)}
                                className="bg-transparent hover:bg-white/5 rounded-lg text-neutral-50 text-xs leading-4 border border-zinc-800 px-4 py-1.5 cursor-pointer transition-all active:scale-95"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor Wrapper */}
                    <div className="min-h-[500px] rounded-xl bg-zinc-950 border border-zinc-800 flex flex-1 overflow-hidden relative">
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
                                fontSize: 13,
                                fontFamily: "Fira Code, monospace",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 16 },
                                renderLineHighlight: "none"
                            }}
                        />
                    </div>

                    {/* Console HUD Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 rounded-xl bg-zinc-950 border border-zinc-800 p-3 gap-3 text-left">
                        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
                            <div className="font-semibold text-zinc-400 text-xs leading-4 mb-2 select-none uppercase tracking-wider">
                                Custom Input
                            </div>
                            <input
                                type="text"
                                placeholder="Paste test case"
                                className="font-mono bg-zinc-950 text-neutral-50 text-xs border border-zinc-800 rounded-lg w-full px-3 py-2 outline-none focus:border-white/20"
                            />
                        </div>
                        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
                            <div className="font-semibold text-zinc-400 text-xs leading-4 mb-2 select-none uppercase tracking-wider">
                                Test Output
                            </div>
                            <div className="font-mono rounded-md bg-zinc-950 text-emerald-500 text-xs border border-zinc-800 p-3 select-all">
                                {status === "running" ? "COMPILING..." : (testResults.length > 0 ? "PASSED · " + myProgress.passed + "/" + myProgress.total + " cases matched" : "IDLE")}
                            </div>
                        </div>
                        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
                            <div className="font-semibold text-zinc-400 text-xs leading-4 mb-2 select-none uppercase tracking-wider">
                                Console Logs
                            </div>
                            <div className="font-mono rounded-md bg-zinc-950 text-zinc-300 text-[10px] border border-zinc-800 p-3">
                                {message || "[arena] ready for compile"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Combat stats, Anti-Cheat, Spectators (300px) */}
                <div className="shadow-[0_10px_30px_rgba(0,0,0,0.28)] rounded-xl bg-zinc-900 border border-zinc-800 flex p-6 flex-col gap-6 text-left">
                    
                    {/* Combat Progress Tracker */}
                    <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                        <div className="flex mb-4 justify-between items-center select-none">
                            <div>
                                <div className="font-[family:var(--font-heading)] font-semibold text-sm leading-5">
                                    Combat Tracker
                                </div>
                                <div className="text-zinc-400 text-xs leading-4">
                                    Real-time case compilation
                                </div>
                            </div>
                            <span className="rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold border border-zinc-800 px-2 py-0.5 uppercase tracking-wider animate-pulse">
                                Live
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-xs leading-4 flex justify-between items-center">
                                    <span className="text-white font-bold">{user?.username || "Player Alpha"}</span>
                                    <span className="text-emerald-500 font-mono font-bold">{myProgress.passed}/{myProgress.total || problem?.testcases?.length || 10} passed</span>
                                </div>
                                <div className="rounded-full bg-zinc-800 h-2 overflow-hidden">
                                    <div 
                                        className="rounded-full bg-emerald-500 h-full transition-all duration-500" 
                                        style={{ width: `${(myProgress.passed / (myProgress.total || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-xs leading-4 flex justify-between items-center">
                                    <span className="text-zinc-400 font-bold">{opponent?.username || "Player Omega"}</span>
                                    <span className="text-amber-500 font-mono font-bold">{opponentProgress.passed}/{opponentProgress.total || problem?.testcases?.length || 10} passed</span>
                                </div>
                                <div className="rounded-full bg-zinc-800 h-2 overflow-hidden">
                                    <div 
                                        className="rounded-full bg-amber-500 h-full transition-all duration-500" 
                                        style={{ width: `${(opponentProgress.passed / (opponentProgress.total || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Anti-Cheat violation details */}
                    <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                        <div className="flex mb-4 justify-between items-center select-none">
                            <div>
                                <div className="font-[family:var(--font-heading)] font-semibold text-sm leading-5">
                                    Anti-Cheat Panel
                                </div>
                                <div className="text-zinc-400 text-xs leading-4">
                                    Integrity monitor active
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                        <div className="space-y-3 text-xs leading-4">
                            <div className="font-mono rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 p-3 select-all">
                                focus.log: editor security stream connected
                            </div>
                            <div className="space-y-2">
                                <div className="font-semibold text-zinc-400 select-none uppercase tracking-wider text-[10px]">Violations</div>
                                <div className="space-y-2">
                                    <div className="rounded-lg bg-zinc-900 border border-zinc-800 flex p-2.5 items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={opponentViolations.some(v => v.type === "CODE_PASTE")} 
                                            disabled 
                                            className="accent-emerald-500 rounded border-zinc-800 bg-zinc-950 text-emerald-500 w-4 h-4 cursor-not-allowed" 
                                        />
                                        <span className="text-zinc-300">Suspicious paste detected</span>
                                    </div>
                                    <div className="rounded-lg bg-zinc-900 border border-zinc-800 flex p-2.5 items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={opponentViolations.some(v => v.type === "TAB_SWITCH")} 
                                            disabled 
                                            className="accent-emerald-500 rounded border-zinc-800 bg-zinc-950 text-emerald-500 w-4 h-4 cursor-not-allowed" 
                                        />
                                        <span className={opponentViolations.some(v => v.type === "TAB_SWITCH") ? "text-red-500 animate-pulse font-bold" : "text-zinc-300"}>Tab switch during compile</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Spectator widgets */}
                    <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 flex-1">
                        <div className="mb-4 select-none">
                            <div className="font-[family:var(--font-heading)] font-semibold text-sm leading-5">
                                Spectators
                            </div>
                            <div className="text-zinc-400 text-xs leading-4">
                                Active battle spectators
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="rounded-full bg-zinc-900 border border-zinc-800 w-8 h-8 flex items-center justify-center text-zinc-600 text-[10px] select-none font-bold">
                                    S{i+1}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

            {/* FOOTER ACTION BUTTONS */}
            <div className="relative z-10 rounded-xl bg-zinc-900 border border-zinc-800 flex px-6 py-4 justify-between items-center select-none mt-2">
                <div className="text-zinc-400 text-sm leading-5">
                    Ready to execute the combat solution
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleRun("RUN")}
                        disabled={status === "running" || isFinished || currentBattle?.status === "FINISHED"}
                        className="bg-transparent hover:bg-white/5 cursor-pointer rounded-lg text-neutral-50 text-xs leading-4 border border-zinc-800 px-5 py-2.5 h-10 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {runningAction === "RUN" ? <Loader2 size={12} className="animate-spin text-emerald-500" /> : <Play size={12} fill="currentColor" />} Run Code
                    </button>
                    <button
                        onClick={() => handleRun("SUBMIT")}
                        disabled={status === "running" || isFinished || currentBattle?.status === "FINISHED" || (isCreator && currentBattle?.status !== "ONGOING")}
                        className="rounded-lg bg-neutral-50 hover:bg-neutral-200 cursor-pointer text-zinc-950 px-5 py-2.5 h-10 font-bold transition-all flex items-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {runningAction === "SUBMIT" ? <Loader2 size={12} className="animate-spin text-black" /> : <Send size={12} fill="currentColor" />} Submit Solution
                    </button>
                </div>
            </div>

            {/* RESULTS FINISH MODAL */}
            {isFinished && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
                    <div className="max-w-lg w-full bg-zinc-900 border border-white/10 p-6 sm:p-10 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]" style={{ borderRadius: "2px" }}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 relative">
                                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative z-10">
                                    {winner === user?.id ? (
                                        <Trophy size={40} className="text-emerald-500 animate-bounce" />
                                    ) : (
                                        <AlertTriangle size={40} className="text-red-500 animate-pulse" />
                                    )}
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 font-[family:var(--font-heading)]">
                                {winner === user?.id ? "VICTORY ACHIEVED" : "SIGNAL ABORTED"}
                            </h2>
                            <p className="text-neutral-400 text-xs font-medium mb-8 uppercase tracking-[0.2em]">
                                {winner === user?.id ? "You solved the problem before your opponent." : "You were unable to complete the challenge in time."}
                            </p>
                            <div className="grid grid-cols-3 gap-4 w-full mb-8 p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-lg select-none">
                                <div className="flex flex-col items-center">
                                    <span className="text-[8px] text-neutral-500 font-bold uppercase mb-1 tracking-widest">Time</span>
                                    <span className="text-base text-white font-mono">{formatElapsed(currentBattle?.startedAt)}</span>
                                </div>
                                <div className="flex flex-col items-center border-x border-white/5 px-4">
                                    <span className="text-[8px] text-neutral-500 font-bold uppercase mb-1 tracking-widest">Accuracy</span>
                                    <span className="text-base text-emerald-500 font-mono">100%</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[8px] text-neutral-500 font-bold uppercase mb-1 tracking-widest">Logic</span>
                                    <span className="text-base text-white font-mono">{myProgress.passed}/{myProgress.total || problem?.testcases?.length || 10}</span>
                                </div>
                            </div>
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] cursor-pointer transition-all"
                                >
                                    Exit Battle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMATION FORFEIT MODAL */}
            <AnimatePresence>
                {showForfeitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-md bg-zinc-900 border border-white/10 p-10 shadow-2xl relative overflow-hidden"
                            style={{ borderRadius: "2px" }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
                            <div className="flex items-center gap-4 text-red-500 mb-6 select-none">
                                <AlertTriangle size={24} />
                                <div className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Termination</div>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 leading-tight">Abort Match?</h3>
                            <p className="text-neutral-400 text-xs font-mono leading-relaxed mb-10">
                                This action will result in an immediate forfeit. Your performance metrics will be recorded as a failure for this sector.
                             </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowForfeitModal(false)}
                                    className="flex-1 py-4 border border-white/5 text-neutral-400 font-bold uppercase tracking-widest text-[10px] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmForfeit}
                                    disabled={isAborting}
                                    className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isAborting ? <Loader2 size={14} className="animate-spin" /> : null}
                                    {isAborting ? "Aborting..." : "Confirm Forfeit"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TAB SWITCH SECURITY OVERLAY */}
            <AnimatePresence>
                {isTabSwitched && !isFinished && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8"
                    >
                        <div className="max-w-md w-full bg-zinc-900 border border-red-600/20 p-12 text-center relative overflow-hidden" style={{ borderRadius: "2px" }}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(255,0,0,0.5)]" />
                            <div className="flex flex-col items-center gap-6 mb-8">
                                <div className="w-20 h-20 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center animate-bounce">
                                    <ShieldAlert size={40} className="text-red-500" />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.6em]">Tab Switch Detected</div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Stay in Arena</h2>
                                </div>
                            </div>
                            <p className="text-neutral-400 text-xs font-mono mb-10 leading-relaxed uppercase tracking-widest">
                                Please stay on this tab to avoid forfeiting the match. Return to the battle to stay in the match.
                            </p>
                            <div className="relative">
                                <div className="text-5xl font-black text-red-600 font-mono mb-4">VIOLATION</div>
                                <div className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.3em]">Testing Phase: Forfeit Disabled</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SHARE MODAL */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                link={(!opponent && currentBattle?.status !== "FINISHED")
                    ? `${window.location.origin}/battle/${battleId}/ide`
                    : `${window.location.origin}/spectate/${battleId}`}
                title={(!opponent && currentBattle?.status !== "FINISHED") ? "INVITE CHALLENGER" : "SHARE BATTLE STREAM"}
                message={(!opponent && currentBattle?.status !== "FINISHED")
                    ? `Join me in a code battle on ChallengX! Code: ${currentBattle?.battleCode}`
                    : `Check out this live battle on ChallengX! Code: ${currentBattle?.battleCode}`}
            />

            {/* CYBER MENTOR MODAL */}
            <CyberMentorModal
                isOpen={isCyberMentorOpen}
                onClose={() => setIsCyberMentorOpen(false)}
                hint={aiHint}
                isLoading={isAILoading}
            />

            {/* CODE SURGEON MODAL */}
            <CodeSurgeonModal
                isOpen={isSurgeonOpen}
                onClose={() => setIsSurgeonOpen(false)}
                report={surgeonReport}
                isLoading={isSurgeonLoading}
            />
        </div>
    );
};

export default BattleArena;
