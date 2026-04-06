import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../../lib/socket";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";
import { BattleProblem } from "../components/BattleProblem";
import { getBattle } from "../../store/api/battle.thunk";
import { clearCurrentBattle } from "../../store/slices/battle.slice";

const LANGUAGES = {
    java: { monaco: "java" },
    cpp: { monaco: "cpp" },
    javascript: { monaco: "javascript" },
    python: { monaco: "python" },
};

export default function SpectatorArena() {
    const { battleId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentBattle } = useSelector((state) => state.battle);

    const [isMobile, setIsMobile] = useState(false);
    const [activePlayer, setActivePlayer] = useState("p1");
    const [mobileDetailTab, setMobileDetailTab] = useState("code");
    const [p1State, setP1State] = useState({ code: "", language: "java" });
    const [p2State, setP2State] = useState({ code: "", language: "java" });

    const [p1Output, setP1Output] = useState({ output: "", status: "idle", testCaseResults: null, beatsPercentile: 0, loadingAction: null });
    const [p2Output, setP2Output] = useState({ output: "", status: "idle", testCaseResults: null, beatsPercentile: 0, loadingAction: null });
    const [cheatAlerts, setCheatAlerts] = useState([]);
    const [aiCommentary, setAiCommentary] = useState(null);
    const initialStateRef = useRef(null);

    const applyInitialState = useCallback((codeState, outputState) => {
        if (!currentBattle) return;
        const { player1Id, player2Id } = currentBattle;

        if (player1Id && codeState[player1Id]) {
            const data = typeof codeState[player1Id] === 'string' ? JSON.parse(codeState[player1Id]) : codeState[player1Id];
            setP1State(data);
        }
        if (player2Id && codeState[player2Id]) {
            const data = typeof codeState[player2Id] === 'string' ? JSON.parse(codeState[player2Id]) : codeState[player2Id];
            setP2State(data);
        }

        if (player1Id && outputState[player1Id]) {
            const data = typeof outputState[player1Id] === 'string' ? JSON.parse(outputState[player1Id]) : outputState[player1Id];
            setP1Output(data);
        }
        if (player2Id && outputState[player2Id]) {
            const data = typeof outputState[player2Id] === 'string' ? JSON.parse(outputState[player2Id]) : outputState[player2Id];
            setP2Output(data);
        }
    }, [currentBattle]);

    // Initial Fetch
    useEffect(() => {
        dispatch(clearCurrentBattle());
        dispatch(getBattle({ battleId }));
    }, [battleId, dispatch]);

    // Apply initial state when battle data finally loads
    useEffect(() => {
        if (currentBattle && initialStateRef.current) {
            const { codeState, outputState } = initialStateRef.current;
            applyInitialState(codeState, outputState);
            // Clear the ref so we don't re-apply it and overwrite new real-time updates
            initialStateRef.current = null;
        }
    }, [currentBattle, applyInitialState]);

    useEffect(() => {
        const updateMobile = () => setIsMobile(window.innerWidth < 1024);
        updateMobile();
        window.addEventListener("resize", updateMobile);
        return () => window.removeEventListener("resize", updateMobile);
    }, []);

    useEffect(() => {
        const socket = getSocket();

        if (battleId) {
            socket.emit("join_spectator", { battleId });
        }

        const onInitialState = (data) => {
            const { codeState = {}, outputState = {} } = data;
            
            if (!currentBattle) {
                // Store for later if battle data hasn't arrived
                initialStateRef.current = { codeState, outputState };
                return;
            }
            
            applyInitialState(codeState, outputState);
        };

        const onCodeUpdate = (data) => {
            const { userId, code, language } = data;
            if (!currentBattle) return;

            if (userId === currentBattle.player1Id) {
                setP1State({ code, language });
            } else if (userId === currentBattle.player2Id) {
                setP2State({ code, language });
            }
        };

        const onOutputUpdate = (data) => {
            const { userId, output, status, testCaseResults, beatsPercentile, loadingAction } = data;
            if (!currentBattle) return;

            const outputData = { output, status, testCaseResults, beatsPercentile, loadingAction };

            if (userId === currentBattle.player1Id) {
                setP1Output(outputData);
            } else if (userId === currentBattle.player2Id) {
                setP2Output(outputData);
            }
        };

        const onBattleFinished = () => {
            // Refresh battle to see winner
            setTimeout(() => {
                dispatch(getBattle({ battleId }));
            }, 500);
        };

        const onAntiCheatAlert = (data) => {
            setCheatAlerts(prev => [data, ...prev].slice(0, 20)); // Keep last 20 alerts
        };

        socket.on("spectator_initial_state", onInitialState);
        socket.on("spectator_code_update", onCodeUpdate);
        socket.on("spectator_output_update", onOutputUpdate);
        socket.on("anti_cheat_alert", onAntiCheatAlert);
        socket.on("battle_end", onBattleFinished);
        socket.on("battle_commentary", (data) => {
            console.log("🎙️ Live AI Commentary:", data.commentary);
            setAiCommentary(data.commentary);
        });

        return () => {
            socket.off("spectator_initial_state", onInitialState);
            socket.off("spectator_code_update", onCodeUpdate);
            socket.off("spectator_output_update", onOutputUpdate);
            socket.off("anti_cheat_alert", onAntiCheatAlert);
            socket.off("battle_end", onBattleFinished);
        };
    }, [battleId, currentBattle, dispatch, applyInitialState]);

    const renderPlayerPanel = (playerKey, detailTab = "code") => {
        const isP1 = playerKey === "p1";
        const player = isP1 ? currentBattle.player1 : currentBattle.player2;
        const codeState = isP1 ? p1State : p2State;
        const outputState = isP1 ? p1Output : p2Output;
        const attempts = isP1 ? currentBattle.attemptsPlayer1 : currentBattle.attemptsPlayer2;
        const name = player?.username || (isP1 ? "Player 1" : "Player 2");
        const accentClass = isP1 ? "text-[var(--color-primary)]" : "text-blue-500";
        const playerAlertList = cheatAlerts.filter((alert) => !alert.userId || alert.userId === (isP1 ? currentBattle.player1Id : currentBattle.player2Id));

        const renderAlertItems = () => {
            if (playerAlertList.length === 0) {
                return (
                    <div className="flex-1 min-h-55 flex items-center justify-center px-6 text-center text-slate-400 text-xs uppercase tracking-[0.24em]">
                        No switch or paste events for {name} yet.
                    </div>
                );
            }

            return (
                <div className="flex-1 min-h-55 overflow-y-auto px-3 py-2 space-y-2">
                    {playerAlertList.map((alert, i) => (
                        <div key={`${alert.timestamp || i}-${i}`} className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-200">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-slate-100">{alert.username}</span>
                                <span className="text-[9px] uppercase tracking-[0.3em] text-slate-500">
                                    {alert.type === "PASTE" ? "Paste" : "Switch"}
                                </span>
                            </div>
                            <div className="mt-1 text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                                {alert.type === "PASTE" ? "Code paste detected" : "Tab switch detected"}
                            </div>
                        </div>
                    ))}
                </div>
            );
        };

        return (
            <div className={`${isMobile ? 'w-full h-full' : 'w-1/2'} flex flex-col ${!isMobile && isP1 ? 'border-r border-[#1a1a1a]' : ''}`}>
                <div className="h-10 bg-[var(--color-bg-card)] border-b border-[#1a1a1a] flex items-center justify-between px-4 shrink-0">
                    <span className={`${accentClass} font-bold text-xs uppercase tracking-wider`}>
                        {isP1 ? "P1:" : "P2:"} {name}
                    </span>
                    <div className="flex items-center gap-3">
                        {outputState.loadingAction && (
                            <span className="text-yellow-500 text-[9px] uppercase tracking-widest animate-pulse font-bold">
                                {outputState.loadingAction}ING...
                            </span>
                        )}
                        <span className="text-gray-600 text-[10px] uppercase font-mono">
                            Attempts: {attempts}
                        </span>
                    </div>
                </div>
                <div className="flex-1 min-h-0 bg-[var(--color-bg-card)] flex flex-col">
                    {player || isP1 ? (
                        <>
                            {detailTab === "code" && (
                                <div className="flex-1 min-h-55">
                                    <CodeEditor
                                        language={LANGUAGES[codeState.language]?.monaco || "java"}
                                        value={codeState.code || "// Waiting for code stream..."}
                                        readOnly={true}
                                    />
                                </div>
                            )}
                            {detailTab === "output" && (
                                <div className="flex-1 min-h-55">
                                    <OutputPanel
                                        output={outputState.output}
                                        status={outputState.status}
                                        testCaseResults={outputState.testCaseResults}
                                        problem={currentBattle?.problem ? { ...currentBattle.problem, beatsPercentile: outputState.beatsPercentile } : null}
                                    />
                                </div>
                            )}
                            {detailTab === "events" && renderAlertItems()}
                            {!isMobile && (
                                <div className="h-48 border-t border-[#1a1a1a] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10 transition-all duration-300">
                                    <OutputPanel
                                        output={outputState.output}
                                        status={outputState.status}
                                        testCaseResults={outputState.testCaseResults}
                                        problem={currentBattle?.problem ? { ...currentBattle.problem, beatsPercentile: outputState.beatsPercentile } : null}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center px-6">
                            <div className="text-gray-600 text-xs tracking-widest uppercase font-mono text-center">
                                Waiting for Challenger to join this match.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!currentBattle) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--color-bg-dark)]">
                <div className="text-[var(--color-primary)] animate-pulse tracking-widest font-mono text-xs uppercase">
                    Connecting to live match...
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[var(--color-bg-dark)] overflow-hidden">
            {/* Top Banner */}
            <div className="h-12 border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-black z-50">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-red-500 font-bold uppercase tracking-widest text-xs">Watching Live</span>
                </div>
                <div className="text-xs font-mono text-gray-500">
                    Battle Code: <span className="text-[var(--color-text-main)] font-bold">{currentBattle.battleCode}</span>
                </div>
                <button
                    onClick={() => navigate("/")}
                    className="text-xs text-gray-400 hover:text-[var(--color-text-main)] uppercase tracking-widest transition-colors"
                >
                    Leave
                </button>
            </div>

            {/* Main Dual Pane View */}
            <div className={`flex-1 flex overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
                {isMobile ? (
                    <div className="flex flex-col min-h-0 h-full">
                        <div className="flex items-center gap-2 px-2 py-1 border-b border-[#2e2e2e] bg-black">
                            <button
                                type="button"
                                onClick={() => setActivePlayer("p1")}
                                className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all ${activePlayer === "p1" ? "bg-white/10 text-white" : "bg-black text-slate-500 hover:text-slate-200"}`}
                            >
                                <span className="block">P1</span>
                                <span className="truncate text-[10px] font-medium text-slate-400">{currentBattle.player1?.username || "Player 1"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivePlayer("p2")}
                                className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all ${activePlayer === "p2" ? "bg-white/10 text-white" : "bg-black text-slate-500 hover:text-slate-200"}`}
                            >
                                <span className="block">P2</span>
                                <span className="truncate text-[10px] font-medium text-slate-400">{currentBattle.player2?.username || "Awaiting"}</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-2 border-b border-[#2e2e2e] bg-black text-[10px] uppercase tracking-[0.25em] text-slate-400">
                            <button
                                type="button"
                                onClick={() => setMobileDetailTab("code")}
                                className={`flex-1 rounded-lg px-2 py-1 transition-all ${mobileDetailTab === "code" ? "bg-white/10 text-white" : "bg-black text-slate-500 hover:text-slate-200"}`}
                            >
                                Code
                            </button>
                            <button
                                type="button"
                                onClick={() => setMobileDetailTab("output")}
                                className={`flex-1 rounded-lg px-2 py-1 transition-all ${mobileDetailTab === "output" ? "bg-white/10 text-white" : "bg-black text-slate-500 hover:text-slate-200"}`}
                            >
                                Console
                            </button>
                            <button
                                type="button"
                                onClick={() => setMobileDetailTab("events")}
                                className={`flex-1 rounded-lg px-2 py-1 transition-all ${mobileDetailTab === "events" ? "bg-white/10 text-white" : "bg-black text-slate-500 hover:text-slate-200"}`}
                            >
                                Switch/Paste
                            </button>
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                            {renderPlayerPanel(activePlayer, mobileDetailTab)}
                        </div>
                    </div>
                ) : (
                    <>
                        {renderPlayerPanel("p1")}
                        {renderPlayerPanel("p2")}
                    </>
                )}
            </div>

            <div className={`border-b border-white/10 bg-[var(--color-bg-card)] ${isMobile ? 'px-4 py-3' : 'px-6 py-3'} flex flex-col items-center text-center`}>
                <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest mb-1">Problem</div>
                <div className="text-sm sm:text-base font-bold text-[var(--color-text-main)] uppercase truncate w-full">
                    {currentBattle.problem?.title}
                </div>
                {currentBattle.status === "FINISHED" && (
                    <div className="mt-2 text-xs font-black text-[var(--color-primary)] uppercase tracking-widest animate-pulse">
                        {currentBattle.winner ? `${currentBattle.winner.username} Wins` : "Draw"}
                    </div>
                )}
            </div>

            {/* Anti-Cheat Alert Feed */}
            {!isMobile && cheatAlerts.length > 0 && (
                <div className={`absolute bottom-4 ${isMobile ? 'left-2 right-2 w-auto' : 'right-4 w-80'} z-50 max-h-60 overflow-y-auto flex flex-col gap-1.5`} style={{ scrollbarWidth: "none" }}>
                    {cheatAlerts.map((alert, i) => (
                        <div
                            key={`${alert.timestamp}-${i}`}
                            className={`px-4 py-2.5 border text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md ${alert.type === "PASTE"
                                    ? "bg-red-950/90 border-red-500/50 text-red-400"
                                    : "bg-yellow-950/90 border-yellow-500/50 text-yellow-400"
                                }`}
                            style={{ borderRadius: "2px", animation: "fadeIn 0.3s ease-in" }}
                        >
                            <span>{alert.type === "PASTE" ? "📋" : "👁️"}</span>
                            <span className="text-[var(--color-text-main)] font-black">{alert.username}</span>
                            <span>
                                {alert.type === "PASTE"
                                    ? `pasted ${alert.charCount} chars`
                                    : "switched tabs"}
                            </span>
                            <span className="ml-auto text-[8px] opacity-60">#{alert.flagCount}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* AI Live Commentary Feed */}
            {aiCommentary && (
                <div className={`absolute bottom-4 ${isMobile ? 'left-2 right-2 w-auto' : 'left-1/2 -translate-x-1/2 w-full max-w-xl'} px-4 py-4 bg-black/90 border border-[var(--color-primary)]/20 backdrop-blur-xl shadow-[0_0_40px_rgba(255,170,0,0.1)] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700`} style={{ borderRadius: "2px" }}>
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-center">
                        <span className="text-[10px] animate-pulse">🎙️</span>
                    </div>
                    <div className="flex-1">
                        <div className="text-[7px] font-black text-[var(--color-primary)] uppercase tracking-[0.3em] mb-1">Live AI Analysis</div>
                        <p className="text-[11px] font-bold text-white uppercase italic tracking-tight leading-snug">
                            {aiCommentary}
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}
