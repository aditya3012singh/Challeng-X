import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Editor from "@monaco-editor/react";
import {
    Zap, Terminal, Clock, Shield, ChevronLeft,
    Activity, Play, Send, X, Trophy, AlertTriangle,
    Monitor, Cpu, Globe, Rocket, Power, Target, Check, ShieldAlert, Code, Sparkles,
    ChevronUp, ChevronDown, ChevronRight, MousePointer2, Loader2, Users
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
            toast.success("Neural Link Synchronized. Hint Decrypted.", { icon: '💡' });
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
            navigate('/battles');
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
        editor.focus();
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
                    <div className="text-[var(--color-primary)] text-xs font-black uppercase tracking-[0.5em] font-mono animate-pulse">Initializing Arena...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[var(--color-bg-dark)] text-slate-300 flex flex-col overflow-hidden font-mono selection:bg-[var(--color-primary)] selection:text-black">

            {/* MATCH HEADER */}
            <header className="h-14 border-b border-white/5 bg-[var(--color-bg-card)] flex items-center justify-between px-3 sm:px-6 shrink-0 relative z-40">
                <div className="flex items-center gap-3 sm:gap-6">
                    <button onClick={() => navigate('/')} className="hover:text-[var(--color-primary)] transition-colors p-1">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-ping hidden xs:block" />
                        <h1 className="text-xs sm:text-sm font-black tracking-tighter uppercase text-[var(--color-text-main)] flex items-center gap-2 sm:gap-3">
                            <span className="hidden sm:inline">Battle Code:</span>
                            <span className="text-[var(--color-primary)] font-mono">{currentBattle?.battleCode || "......"}</span>
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[9px] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] flex items-center gap-2"
                                style={{ borderRadius: "2px" }}
                                title="Share Battle"
                            >
                                <Send size={10} /> <span className="hidden sm:inline">Share</span>
                            </button>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 border border-white/10" style={{ borderRadius: "2px" }}>
                    <div className="w-1.5 h-1.5 bg-white animate-pulse rounded-full" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-white">{formatTime(timeLeft)}</span>
                </div>

                <div className="h-4 w-[1px] bg-white/10 mx-2" />

                <button
                    onClick={handleForfeit}
                    className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 bg-red-600 hover:bg-red-500 border border-white/20 text-white transition-all group shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                    style={{ borderRadius: "2px" }}
                    title="Terminate Match"
                >
                    <Power size={14} className="group-hover:rotate-90 transition-transform text-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Abandon</span>
                </button>
            </header>

            {/* MAIN ARENA CONTENT */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* MOBILE TABS - PREMIUM SEGMENTED CONTROL */}
                <div className="flex lg:hidden bg-[var(--color-bg-card)] border-b border-white/10 shrink-0 h-12 px-2 items-center">
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
                                className={`flex-1 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-colors relative z-10 ${mobileTab === tab.id ? "text-[var(--color-text-main)]" : "text-[var(--color-text-muted)] hover:text-slate-300"}`}
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
                    className={`min-h-0 border-r border-white/5 bg-[var(--color-bg-card)] relative group/sidebar lg:shrink-0
                        ${mobileTab === "problem" || mobileTab === "console" ? "flex-1 flex flex-col" : "hidden lg:flex lg:flex-col lg:flex-none"}`} style={{ width: isMobile ? '100%' : `${sidebarWidth}px` }}
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
                            (!opponent || currentBattle?.status === "WAITING" || currentBattle?.status === "COUNTDOWN") ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-8 animate-in fade-in zoom-in duration-700">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-2 border-dashed border-[var(--color-primary)]/20 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                                            <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full absolute -top-1 left-1/2 -translate-x-1/2" />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Users size={32} className="text-slate-700 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="space-y-4 max-w-xs">
                                        <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--color-text-main)]">Signal Blocked</h3>
                                        <p className="text-[10px] text-[var(--color-text-muted)] font-mono italic leading-relaxed">
                                            Mission objectives are encrypted. The data stream will initialize once an opponent synchronizes with this sector.
                                        </p>
                                        <div className="pt-4">
                                            <div className="text-[8px] font-bold text-[var(--color-primary)] uppercase tracking-widest mb-2 opacity-50">Awaiting Target Acquisition...</div>
                                            <div className="h-1 w-full bg-white/5 overflow-hidden">
                                                <div className="h-full bg-[var(--color-primary)]/30 w-1/3 animate-[shimmer_2s_infinite]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 lg:space-y-12">
                                    <section>
                                        <div className="flex items-center justify-between mb-4 lg:mb-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] font-black uppercase tracking-widest self-start">
                                                    {problem?.difficulty || "MISSION DATA"}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {problem?.tags?.map((tag, idx) => (
                                                        <span key={idx} className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                                            #{tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* <button 
                                                onClick={fetchAIHint}
                                                disabled={isAILoading}
                                                className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[var(--color-text-main)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-black transition-all"
                                                style={{ borderRadius: "2px" }}
                                            >
                                                <Sparkles size={10} /> {isAILoading ? "Connecting..." : "Personalized Hint (-15)"}
                                            </button> */}
                                        </div>
                                        <h2 className="text-xl lg:text-2xl font-black text-[var(--color-text-main)] mb-4 lg:mb-6 tracking-tight uppercase leading-tight">{problem?.title}</h2>
                                        <div className="prose prose-invert prose-sm max-w-none text-[var(--color-text-muted)] font-light leading-relaxed mb-8 lg:mb-12">
                                            {problem?.description}
                                        </div>
                                    </section>

                                    {/* HINTS SECTION */}
                                    <section>
                                        <h3 className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.3em] mb-4 lg:mb-6 flex items-center gap-3">
                                            <div className="w-4 h-[1px] bg-[var(--color-primary)]/30" /> Mission Intel (Hints)
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[0, 1, 2].map((idx) => {
                                                const isUnlocked = problem?.hints?.[idx] !== null && problem?.hints?.[idx] !== undefined;
                                                return (
                                                    <div key={idx} className={`p-4 border transition-all ${isUnlocked ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-60'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol Hint {idx + 1}</div>
                                                            {!isUnlocked && (
                                                                <button
                                                                    onClick={() => handleUnlockHint(idx)}
                                                                    disabled={isUnlockingHint}
                                                                    className="px-2 py-1 bg-[var(--color-primary)] text-black text-[8px] font-black uppercase tracking-tighter hover:bg-white transition-all"
                                                                >
                                                                    Unlock (-5)
                                                                </button>
                                                            )}
                                                        </div>
                                                        {isUnlocked ? (
                                                            <p className="text-[11px] text-slate-300 font-light italic">"{problem.hints[idx]}"</p>
                                                        ) : (
                                                            <div className="h-4 bg-white/5 animate-pulse w-full rounded-sm" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {problem?.testcases?.some(tc => tc.isSample) && (
                                        <section>
                                            <h3 className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.3em] mb-4 lg:mb-6 flex items-center gap-3">
                                                <div className="w-4 h-[1px] bg-[var(--color-primary)]/30" /> Sample Test Cases
                                            </h3>
                                            <div className="space-y-4">
                                                {problem.testcases.filter(tc => tc.isSample).map((tc, i) => (
                                                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-sm">
                                                        <div className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-3">Example {i + 1}</div>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div>
                                                                <div className="text-[8px] font-black text-slate-700 uppercase mb-2">Input</div>
                                                                <pre className="p-3 bg-black/40 text-[11px] text-[var(--color-text-main)] font-mono overflow-x-auto border border-white/5">{tc.input}</pre>
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

                                    {problem?.constraints && (
                                        <section>
                                            <h3 className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.3em] mb-4 lg:mb-6 flex items-center gap-3">
                                                <div className="w-4 h-[1px] bg-[var(--color-primary)]/30" /> System Constraints
                                            </h3>
                                            <ul className="space-y-3">
                                                {(typeof problem.constraints === 'string' ? problem.constraints.split('\n') : problem.constraints).map((c, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-[11px] lg:text-xs text-[var(--color-text-muted)] italic">
                                                        <div className="mt-1.5 w-1 h-1 bg-[var(--color-primary)] rounded-full shadow-[0_0_5px_var(--color-primary)]" />
                                                        {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}
                                </div>
                            )
                        ) : (
                            renderConsole()
                        )}
                    </div>

                    {/* ACTIONS POD - Desktop Only here, mobile shows it inside editor tab */}
                    {!isMobile && (
                        <div className="p-6 bg-[var(--color-bg-card)] border-t border-white/5 grid grid-cols-2 gap-4 shrink-0">
                            <button
                                onClick={() => handleRun("RUN")}
                                disabled={status === "running"}
                                className="py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:border-white hover:text-[var(--color-text-main)] transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {runningAction === "RUN" ? <Loader2 size={12} className="animate-spin text-[var(--color-primary)]" /> : <Play size={12} fill="currentColor" />} Run Test
                            </button>
                            <button
                                onClick={() => handleRun("SUBMIT")}
                                disabled={status === "running" || (isCreator && currentBattle?.status !== "ONGOING")}
                                className="py-3 bg-[var(--color-primary)] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.1)] flex items-center justify-center gap-2"
                            >
                                {runningAction === "SUBMIT" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} fill="currentColor" />} Submit Data
                            </button>
                        </div>
                    )}
                </div>
                {/* CENTER AREA - Editor */}
                <div className={`flex-1 min-h-0 flex flex-col bg-[var(--color-bg-dark)] min-w-0 lg:min-w-[400px] ${mobileTab === "editor" ? "flex" : "hidden lg:flex"}`}>
                    {(!opponent || currentBattle?.status === "WAITING" || currentBattle?.status === "COUNTDOWN") ? (
                        <div className="flex-1 flex items-center justify-center bg-[var(--color-bg-dark)] text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest animate-pulse">
                            <Rocket size={16} className="mr-3" /> Waiting for transmission start...
                        </div>
                    ) : (
                        <>
                            {/* EDITOR TOOLBAR */}
                            <div className="h-10 lg:h-12 border-b border-white/5 bg-[var(--color-bg-card)] flex items-center justify-between px-4 lg:px-6 shrink-0">
                                <div className="flex items-center gap-4 lg:gap-6">
                                    <div className="flex items-center gap-2 border-r border-white/10 pr-4 lg:pr-6">
                                        <Globe size={14} className="text-[var(--color-text-muted)]" />
                                        <select
                                            value={language}
                                            onChange={handleLanguageChange}
                                            className="bg-transparent text-[9px] lg:text-[10px] font-black text-[var(--color-text-main)] outline-none uppercase tracking-widest cursor-pointer hover:text-[var(--color-primary)] transition-colors"
                                        >
                                            {Object.keys(LANGUAGES).map(lang => (
                                                <option key={lang} value={lang} className="bg-[var(--color-bg-card)]">{lang}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {isMobile && (
                                    <button
                                        onClick={() => setShowMobileTools(!showMobileTools)}
                                        className={`p-2 rounded-sm border transition-all ${showMobileTools ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]/40 text-[var(--color-primary)]' : 'bg-white/5 border-white/10 text-[var(--color-text-muted)]'}`}
                                    >
                                        <MousePointer2 size={14} />
                                    </button>
                                )}
                            </div>

                            {/* MONACO EDITOR CONTAINER */}
                            <div className="flex-1 relative">
                                <Editor
                                    height="100%"
                                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
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
                                        cursorStyle: "line",
                                        cursorWidth: 2,
                                        cursorBlinking: 'blink',
                                        selectionHighlight: false,
                                        renderLineHighlight: "none",
                                        lineNumbersMinChars: isMobile ? 2 : 3,
                                        scrollbar: {
                                            vertical: "auto",
                                            horizontal: "auto",
                                            verticalScrollbarSize: 8,
                                            horizontalScrollbarSize: 8,
                                        },
                                        quickSuggestions: !isMobile,
                                        hover: { enabled: !isMobile },
                                        occurrenceHighlight: false,
                                        matchBrackets: 'always',
                                    }}
                                />

                                {/* MOBILE D-PAD */}
                                {isMobile && showMobileTools && (
                                    <div className="absolute bottom-6 right-6 z-50 flex flex-col items-center gap-2 bg-[var(--color-bg-card)]/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] scale-90 sm:scale-100">
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
                                <div className="sticky bottom-0 left-0 right-0 p-4 bg-[var(--color-bg-card)] border-t border-white/5 grid grid-cols-2 gap-4 shrink-0 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                                    <button
                                        onClick={() => handleRun("RUN")}
                                        disabled={status === "running"}
                                        className="py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] flex items-center justify-center gap-2 active:scale-95 transition-all"
                                    >
                                        {runningAction === "RUN" ? <Loader2 size={12} className="animate-spin text-[var(--color-primary)]" /> : <Play size={12} fill="currentColor" />} Run
                                    </button>
                                    <button
                                        onClick={() => handleRun("SUBMIT")}
                                        disabled={status === "running" || (isCreator && currentBattle?.status !== "ONGOING")}
                                        className="py-3 bg-[var(--color-primary)] text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,170,0,0.2)]"
                                    >
                                        {runningAction === "SUBMIT" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} fill="currentColor" />} Submit
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* RIGHT SIDEBAR - Opponent Progress (Desktop: Resizable, Mobile: Tabbed) */}
                <aside
                    className={`min-h-0 border-l border-white/5 bg-[var(--color-bg-card)] lg:shrink-0 relative group/match
                        ${mobileTab === "status" ? "flex-1 flex flex-col w-full" : "hidden lg:flex lg:flex-col lg:flex-none"}`} style={{ width: isMobile ? '100%' : `${rightSidebarWidth}px` }}
                >
                    {/* Resize Handle - Desktop Only */}
                    {!isMobile && (
                        <div
                            onMouseDown={startResizingRight}
                            className={`absolute -left-1 top-0 bottom-0 w-2 cursor-col-resize z-50 transition-colors ${isResizingRight ? 'bg-[var(--color-primary)]' : 'hover:bg-[var(--color-primary)]/30'}`}
                        />
                    )}
                    <div className="p-6 border-b border-white/5 bg-[var(--color-bg-card)]">
                        <div className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.3em] mb-8">Match Status</div>

                        <div className="space-y-8">
                            {/* LOCAL PROGRESS */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-[var(--color-text-main)] uppercase tracking-wider">{user?.username || "Guest Player"}</span>
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
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${opponent?.username === "CHALLENGX_GHOST" ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}>
                                                {opponent?.username || "GUEST_USER"}
                                            </span>
                                            {opponent?.username === "CHALLENGX_GHOST" && (
                                                <span className="px-1.5 py-0.5 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[7px] font-black text-[var(--color-primary)] uppercase tracking-widest rounded-sm">
                                                    GHOST
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className={`w-1 h-1 rounded-full ${opponentStatus === 'submitting' ? 'bg-[var(--color-primary)] animate-ping' : 'bg-slate-600'}`} />
                                            <span className="text-[8px] uppercase font-bold text-slate-600">{opponentStatus === 'submitting' ? 'Transmitting Data...' : 'Idle'}</span>
                                        </div>
                                    </div>
                                    <span className="text-[var(--color-text-muted)] font-mono text-xs">{opponentProgress.passed}/{opponentProgress.total || 0}</span>
                                </div>

                                {opponentAlert && (
                                    <div className="p-3 bg-red-600 border border-white/10 text-white text-[8px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                                        <ShieldAlert size={12} />
                                        {opponentAlert.message}
                                    </div>
                                ) || (
                                        <div className="h-1.5 w-full bg-white/5 border border-white/5 overflow-hidden" style={{ borderRadius: "1px" }}>
                                            <div
                                                className={`h-full transition-all duration-500 ${opponent?.username === "CHALLENGX_GHOST" ? "bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]" : "bg-white/20"}`}
                                                style={{ width: `${(opponentProgress.passed / (opponentProgress.total || 1)) * 100}%` }}
                                            />
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.3em]">Anti-Cheat Stream</div>
                            {opponentViolations.length > 0 && (
                                <div className="px-2 py-0.5 bg-red-600 border border-white/10 text-[8px] font-black text-white uppercase tracking-widest rounded-sm shadow-[0_0_10px_rgba(255,0,0,0.2)]">
                                    {opponentViolations.length} {opponentViolations.length === 1 ? 'Violation' : 'Violations'}
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            {opponentViolations.length > 0 ? (
                                opponentViolations.map((v, index) => (
                                    <div key={index} className="p-3 bg-red-900/10 border-l-2 border-red-600 animate-in slide-in-from-right duration-300">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                                                {v.username}: {v.message}
                                            </div>
                                            <div className="text-[8px] text-red-400/50 font-mono">{v.timestamp}</div>
                                        </div>
                                        <div className="text-[8px] text-red-400 italic">
                                            {v.duration !== null ? `Away for ${v.duration} seconds.` : "Currently out of focus..."}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-24 border-2 border-dashed border-white/5 flex items-center justify-center p-4 text-center">
                                    <span className="text-[8px] uppercase font-bold text-slate-700 tracking-widest leading-relaxed">No violations detected in current stream</span>
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

                    <div className="max-w-lg w-full bg-[var(--color-bg-card)] border border-white/10 p-6 sm:p-10 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]" style={{ borderRadius: "2px" }}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />

                        <div className="flex flex-col items-center">
                            <div className={`mb-6 relative ${winner === user?.id ? 'winner-trophy' : ''}`}>
                                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative z-10">
                                    {winner === user?.id ? (
                                        <Trophy size={40} className="text-[var(--color-primary)]" />
                                    ) : (
                                        <AlertTriangle size={40} className="text-red-500" />
                                    )}
                                </div>
                                <div className={`absolute inset-0 blur-[60px] opacity-20 rounded-full ${winner === user?.id ? 'bg-[var(--color-primary)]' : 'bg-red-600'}`} />
                            </div>

                            <div className="text-[10px] font-black text-[var(--color-primary)] tracking-[0.6em] uppercase mb-2 opacity-70 text-center">
                                {winner === user?.id ? "Superiority Established" : "Signal Terminated"}
                            </div>

                            <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-text-main)] tracking-tighter uppercase mb-2 leading-none text-center">
                                {winner === user?.id ? "You Won" : "Match Over"}
                            </h1>

                            <p className="text-[var(--color-text-muted)] text-[10px] font-medium mb-8 uppercase tracking-[0.2em] text-center">
                                {winner === user?.id
                                    ? "Competitive objectives completed with high efficiency."
                                    : "Operational failure. Opponent achieved target first."}
                            </p>

                            {/* MATCH STATS */}
                            <div className="grid grid-cols-3 gap-4 w-full mb-8 p-4 sm:p-6 bg-white/[0.02] border border-white/5" style={{ borderRadius: "2px" }}>
                                <div className="flex flex-col items-center">
                                    <span className="text-[8px] text-slate-600 font-black uppercase mb-1 tracking-widest">Time</span>
                                    <span className="text-lg text-[var(--color-text-main)] font-mono">{formatElapsed(currentBattle?.startedAt)}</span>
                                </div>
                                <div className="flex flex-col items-center border-x border-white/5 px-4">
                                    <span className="text-[8px] text-slate-600 font-black uppercase mb-1 tracking-widest">Accuracy</span>
                                    <span className="text-lg text-[var(--color-primary)] font-mono">100%</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[8px] text-slate-600 font-black uppercase mb-1 tracking-widest">Logic</span>
                                    <span className="text-lg text-[var(--color-text-main)] font-mono">{myProgress.passed}/{myProgress.total || problem.testcases?.length || 10}</span>
                                </div>
                            </div>

                            {/* CODE SURGEON DIAGNOSTICS */}
                            {/* <div className="w-full mb-8">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="h-[1px] flex-1 bg-white/5" />
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
                                                        <Activity size={10} className="text-slate-500" />
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Diagnostic Stream</span>
                                                    </div>
                                                    <div className="h-[1px] flex-1 bg-white/5" />
                                                </div>

                                                {isSurgeonLoading ? (
                                                    <div className="py-6 flex flex-col items-center gap-3">
                                                        <Loader2 size={16} className="animate-spin text-slate-700" />
                                                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Analyzing Logic...</span>
                                                    </div>
                                                ) : surgeonReport ? (
                                                    <div className="p-5 bg-white/[0.01] border border-white/5 relative group overflow-hidden" style={{ borderRadius: "2px" }}>
                                                        <div className="absolute top-0 left-0 w-0.5 h-full bg-[var(--color-primary)]/20" />
                                                        <p className="text-[11px] text-[var(--color-text-muted)] font-light leading-relaxed tracking-wide italic font-mono">
                                                            "{surgeonReport}"
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-2">
                                                        <button 
                                                            onClick={() => setIsSurgeonOpen(true)}
                                                            className="text-[9px] font-black text-[var(--color-primary)] uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto decoration-[var(--color-primary)]/30 underline-offset-4 hover:underline"
                                                        >
                                                            <Sparkles size={10} /> Reveal Diagnostic Report
                                                        </button>
                                                    </div>
                                                )}
                                            </div> */}

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                                <button
                                    onClick={() => navigate('/battles')}
                                    className="w-full sm:flex-1 py-4 bg-white/5 border border-white/5 text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[9px] hover:bg-white hover:text-black transition-all"
                                >
                                    Exit Arena
                                </button>
                                {/* {!surgeonReport && (
                                    <button
                                        onClick={fetchAISurgeonReport}
                                        disabled={isSurgeonLoading}
                                        className="w-full sm:flex-2 px-8 py-4 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-[9px] hover:brightness-125 transition-all shadow-[0_0_20px_var(--color-primary)] shadow-opacity-10 flex items-center justify-center gap-2"
                                    >
                                        {isSurgeonLoading ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />} Process Diagnostic
                                    </button>
                                )} */}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMATION MODAL */}
            <AnimatePresence>
                {showForfeitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-md bg-[var(--color-bg-card)] border border-white/10 p-10 shadow-2xl relative overflow-hidden"
                            style={{ borderRadius: "2px" }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />

                            <div className="flex items-center gap-4 text-red-500 mb-6">
                                <AlertTriangle size={24} />
                                <div className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Termination</div>
                            </div>

                            <h3 className="text-2xl font-black text-[var(--color-text-main)] uppercase tracking-tight mb-4 leading-tight">Abort Match?</h3>
                            <p className="text-[var(--color-text-muted)] text-xs font-mono leading-relaxed mb-10">
                                This action will result in an immediate forfeit. Your performance metrics will be recorded as a failure for this sector.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowForfeitModal(false)}
                                    className="flex-1 py-4 border border-white/5 text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] hover:text-[var(--color-text-main)] hover:bg-white/5 transition-all"
                                    style={{ borderRadius: "2px" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmForfeit}
                                    disabled={isAborting}
                                    className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(255,0,0,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ borderRadius: "2px" }}
                                >
                                    {isAborting ? <Loader2 size={14} className="animate-spin" /> : null}
                                    {isAborting ? "Aborting..." : "Confirm Abandon"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ANTI-CHEAT VIOLATION OVERLAY */}
            <AnimatePresence>
                {isTabSwitched && !isFinished && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8"
                    >
                        <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none" />
                        <div className="max-w-md w-full bg-[var(--color-bg-card)] border border-red-600/20 p-12 text-center relative overflow-hidden" style={{ borderRadius: "2px" }}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(255,0,0,0.5)]" />

                            <div className="flex flex-col items-center gap-6 mb-8">
                                <div className="w-20 h-20 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center animate-bounce">
                                    <ShieldAlert size={40} className="text-red-500" />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.6em]">Violation Detected</div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Stay in Arena</h2>
                                </div>
                            </div>

                            <p className="text-[var(--color-text-muted)] text-xs font-mono mb-10 leading-relaxed uppercase tracking-widest">
                                External signal interference detected. Re-synchronize with the arena immediately to prevent data termination.
                            </p>

                            <div className="relative">
                                <div className="text-7xl font-black text-red-600 font-mono mb-4 tabular-nums shadow-red-600/20 drop-shadow-2xl">
                                    VIOLATION
                                </div>
                                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">Testing Phase: Forfeit Disabled</div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 italic text-[10px] text-[var(--color-primary)] uppercase font-black tracking-widest">
                                AUTOMATIC PENALTY INACTIVE
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
