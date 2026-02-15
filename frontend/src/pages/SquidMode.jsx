import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const SquidMode = () => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState("LOBBY"); // LOBBY, ROUND_1, ELIMINATION, SURVIVED
    const [timeLeft, setTimeLeft] = useState(30);

    // Mock Players
    const [players, setPlayers] = useState(
        Array.from({ length: 48 }).map((_, i) => ({
            id: i,
            name: `Player_${i + 1}`,
            alive: true,
            progress: Math.floor(Math.random() * 100)
        }))
    );

    // Simulating the Game Loop for visual demo
    useEffect(() => {
        if (gameState === "ROUND_1") {
            const interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setGameState("ELIMINATION");
                        return 0;
                    }
                    return prev - 1;
                });

                // Randomly update progress
                setPlayers((prev) => prev.map(p => ({
                    ...p,
                    progress: p.alive ? Math.min(100, p.progress + Math.random() * 5) : p.progress
                })));

            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState]);

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] text-white overflow-hidden relative font-[family:var(--font-heading)]">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] pointer-events-none z-10"></div>

            {/* HEADER */}
            <div className="relative z-20 p-6 flex justify-between items-center bg-black/50 border-b border-gray-800">
                <h1 className="text-3xl text-[var(--color-accent)] animate-pulse tracking-[0.2em]">
                    SQUID PROTOCOL
                </h1>
                <div className="flex bg-black border border-gray-700 rounded px-4 py-2 gap-4">
                    <div>
                        <span className="text-gray-500 text-xs block">PLAYERS</span>
                        <span className="text-xl">{players.filter(p => p.alive).length}/{players.length}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 text-xs block">PRIZE POOL</span>
                        <span className="text-xl text-[var(--color-success)]">💎 4500</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-20 p-8 max-w-7xl mx-auto">

                {gameState === "LOBBY" && (
                    <div className="text-center py-20">
                        <div className="inline-block p-10 border-2 border-[var(--color-accent)] rounded-full mb-8 relative">
                            <div className="text-6xl animate-bounce">🦑</div>
                            <div className="absolute inset-0 border-4 border-[var(--color-accent)] rounded-full animate-ping opacity-20"></div>
                        </div>
                        <h2 className="text-4xl mb-4">WAITING FOR SUBJECTS...</h2>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto font-[family:var(--font-body)]">
                            456 Players required. Do not move when the light is red. Failure results in immediate termination from the server.
                        </p>
                        <button
                            onClick={() => setGameState("ROUND_1")}
                            className="neon-button px-12 py-4 text-xl font-bold bg-[var(--color-accent)] border-none text-black hover:bg-red-500"
                        >
                            I AM READY
                        </button>
                    </div>
                )}

                {gameState === "ROUND_1" && (
                    <div>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-2xl text-[var(--color-primary)] mb-2">ROUND 1: BINARY SEARCH</h2>
                                <div className="w-64 h-2 bg-gray-800 rounded overflow-hidden">
                                    <div className="h-full bg-[var(--color-primary)] transition-all duration-1000" style={{ width: `${(timeLeft / 30) * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="text-6xl font-mono text-[var(--color-accent)]">
                                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-xl h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                {players.map((player) => (
                                    <div key={player.id} className={`p-3 rounded border ${player.alive ? 'border-gray-700 bg-black/40' : 'border-red-900 bg-red-900/20 opacity-50 grayscale'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-400">#{player.id}</span>
                                            {!player.alive && <span className="text-[10px] text-red-500">ELIMINATED</span>}
                                        </div>
                                        <div className="text-center">
                                            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold mb-2 ${player.alive ? 'bg-[var(--color-success)] text-black' : 'bg-gray-800 text-gray-500'}`}>
                                                {player.id}
                                            </div>
                                            <div className="w-full bg-gray-800 h-1 rounded mt-2">
                                                <div className="h-full bg-[var(--color-success)]" style={{ width: `${player.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {gameState === "ELIMINATION" && (
                    <div className="fixed inset-0 z-50 bg-red-900/90 flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-9xl mb-4">💀</h1>
                            <h2 className="text-6xl font-black text-black bg-white px-8 py-2">ELIMINATED</h2>
                            <p className="mt-8 text-2xl text-white">YOU FAILED THE TEST</p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-8 px-8 py-3 bg-black border border-white hover:bg-white hover:text-black transition-colors"
                            >
                                RETURN TO LOBBY
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
