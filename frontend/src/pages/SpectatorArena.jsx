import { useEffect, useState, useRef } from "react";
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

    const [p1State, setP1State] = useState({ code: "", language: "java" });
    const [p2State, setP2State] = useState({ code: "", language: "java" });

    const [p1Output, setP1Output] = useState({ output: "", status: "idle", testCaseResults: null, beatsPercentile: 0, loadingAction: null });
    const [p2Output, setP2Output] = useState({ output: "", status: "idle", testCaseResults: null, beatsPercentile: 0, loadingAction: null });
    const [cheatAlerts, setCheatAlerts] = useState([]);

    useEffect(() => {
        dispatch(clearCurrentBattle());
        dispatch(getBattle({ battleId }));
    }, [battleId, dispatch]);

    useEffect(() => {
        const socket = getSocket();

        if (battleId) {
            socket.emit("join_spectator", { battleId });
        }

        const onInitialState = (data) => {
            if (!currentBattle) return;

            const { codeState = {}, outputState = {} } = data;
            const { player1Id, player2Id } = currentBattle;

            if (player1Id && codeState[player1Id]) {
                setP1State(JSON.parse(codeState[player1Id]));
            }
            if (player2Id && codeState[player2Id]) {
                setP2State(JSON.parse(codeState[player2Id]));
            }

            if (player1Id && outputState[player1Id]) {
                setP1Output(JSON.parse(outputState[player1Id]));
            }
            if (player2Id && outputState[player2Id]) {
                setP2Output(JSON.parse(outputState[player2Id]));
            }
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

        return () => {
            socket.off("spectator_initial_state", onInitialState);
            socket.off("spectator_code_update", onCodeUpdate);
            socket.off("spectator_output_update", onOutputUpdate);
            socket.off("anti_cheat_alert", onAntiCheatAlert);
            socket.off("battle_end", onBattleFinished);
        };
    }, [battleId, currentBattle, dispatch]);

    if (!currentBattle) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#050505]">
                <div className="text-[var(--color-primary)] animate-pulse tracking-widest font-mono text-xs uppercase">
                    Tuning into broadcast...
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#050505] overflow-hidden">
            {/* Top Banner */}
            <div className="h-12 border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-black z-50">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-red-500 font-bold uppercase tracking-widest text-xs">Live Spectator</span>
                </div>
                <div className="text-xs font-mono text-gray-500">
                    Battle Code: <span className="text-white font-bold">{currentBattle.battleCode}</span>
                </div>
                <button
                    onClick={() => navigate("/")}
                    className="text-xs text-gray-400 hover:text-white uppercase tracking-widest transition-colors"
                >
                    [ Leave ]
                </button>
            </div>

            {/* Main Dual Pane View */}
            <div className="flex-1 flex overflow-hidden">

                {/* PLAYER 1 */}
                <div className="w-1/2 flex flex-col border-r border-[#1a1a1a]">
                    <div className="h-10 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-between px-4 shrink-0">
                        <span className="text-[var(--color-primary)] font-bold text-xs uppercase tracking-wider">
                            P1: {currentBattle.player1?.username}
                        </span>
                        <div className="flex items-center gap-3">
                            {p1Output.loadingAction && (
                                <span className="text-yellow-500 text-[9px] uppercase tracking-widest animate-pulse font-bold">{p1Output.loadingAction}ING...</span>
                            )}
                            <span className="text-gray-600 text-[10px] uppercase font-mono">
                                Attempts: {currentBattle.attemptsPlayer1}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 bg-[#080808] flex flex-col">
                        <div className="flex-1 min-h-0">
                            <CodeEditor
                                language={LANGUAGES[p1State.language]?.monaco || "java"}
                                value={p1State.code || "// Waiting for code stream..."}
                                readOnly={true}
                            />
                        </div>
                        <div className="h-48 border-t border-[#1a1a1a] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10 transition-all duration-300">
                            <OutputPanel
                                output={p1Output.output}
                                status={p1Output.status}
                                testCaseResults={p1Output.testCaseResults}
                                problem={currentBattle?.problem ? { ...currentBattle.problem, beatsPercentile: p1Output.beatsPercentile } : null}
                            />
                        </div>
                    </div>
                </div>

                {/* PLAYER 2 */}
                <div className="w-1/2 flex flex-col">
                    <div className="h-10 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-between px-4 shrink-0">
                        <span className="text-blue-500 font-bold text-xs uppercase tracking-wider">
                            P2: {currentBattle.player2?.username || "Awaiting..."}
                        </span>
                        <div className="flex items-center gap-3">
                            {p2Output.loadingAction && (
                                <span className="text-yellow-500 text-[9px] uppercase tracking-widest animate-pulse font-bold">{p2Output.loadingAction}ING...</span>
                            )}
                            <span className="text-gray-600 text-[10px] uppercase font-mono">
                                Attempts: {currentBattle.attemptsPlayer2}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 bg-[#080808] flex flex-col">
                        {currentBattle.player2Id ? (
                            <>
                                <div className="flex-1 min-h-0">
                                    <CodeEditor
                                        language={LANGUAGES[p2State.language]?.monaco || "java"}
                                        value={p2State.code || "// Waiting for code stream..."}
                                        readOnly={true}
                                    />
                                </div>
                                <div className="h-48 border-t border-[#1a1a1a] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10 transition-all duration-300">
                                    <OutputPanel
                                        output={p2Output.output}
                                        status={p2Output.status}
                                        testCaseResults={p2Output.testCaseResults}
                                        problem={currentBattle?.problem ? { ...currentBattle.problem, beatsPercentile: p2Output.beatsPercentile } : null}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="text-gray-600 text-xs tracking-widest uppercase font-mono">Waiting for Challenger...</div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Absolute center problem overlay (Optional: minimal view) */}
            <div className="absolute top-30 left-1/2 -translate-x-1/2 bg-black border border-[#222] px-6 py-2 shadow-2xl z-40 rounded flex flex-col items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Problem</span>
                <span className="text-sm font-bold text-white uppercase">{currentBattle.problem?.title}</span>
                {currentBattle.status === "FINISHED" && (
                    <div className="mt-2 text-xs font-black text-[var(--color-primary)] uppercase tracking-widest animate-pulse">
                        {currentBattle.winner ? `${currentBattle.winner.username} Wins` : "Draw"}
                    </div>
                )}
            </div>

            {/* Anti-Cheat Alert Feed */}
            {cheatAlerts.length > 0 && (
                <div className="absolute bottom-4 right-4 z-50 w-80 max-h-60 overflow-y-auto flex flex-col gap-1.5" style={{ scrollbarWidth: "none" }}>
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
                            <span className="text-white font-black">{alert.username}</span>
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

        </div>
    );
}
