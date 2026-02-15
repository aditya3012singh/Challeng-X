import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] text-[var(--color-text-main)] overflow-hidden relative">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)] rounded-full blur-[150px] opacity-20"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-secondary)] rounded-full blur-[150px] opacity-20"></div>
                <div className="absolute top-[20%] left-[20%] w-full h-px bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.1)] to-transparent transform -rotate-45"></div>
            </div>

            <div className="relative z-10">
                {/* HERO SECTION */}
                <section className="text-center py-24 px-6">
                    <div className="inline-block mb-4 px-4 py-1 rounded-full border border-[var(--color-primary)] bg-[rgba(0,240,255,0.1)] text-[var(--color-primary)] text-sm tracking-widest uppercase animate-pulse">
                        System Online
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] mb-6 text-glow font-[family:var(--font-heading)]">
                        CODE ARENA
                    </h1>

                    <p className="text-xl md:text-2xl text-[var(--color-text-muted)] max-w-3xl mx-auto mb-8 font-light">
                        Enter the simulation. Battle in real-time. <span className="text-white font-semibold">Survive the code.</span>
                    </p>

                    <div className="flex justify-center gap-6 flex-wrap mb-12">
                        <button
                            onClick={() => navigate("/matchmaking")}
                            className="px-10 py-4 bg-[var(--color-primary)] text-black rounded-sm text-lg font-bold hover:shadow-[0_0_30px_var(--color-primary)] transition-all uppercase tracking-wider clip-path-polygon"
                            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                        >
                            Find Match
                        </button>

                        <button
                            onClick={() => navigate("/battles")}
                            className="px-10 py-4 border border-[var(--color-secondary)] text-[var(--color-secondary)] rounded-sm text-lg font-bold hover:bg-[var(--color-secondary)] hover:text-white hover:shadow-[0_0_30px_var(--color-secondary)] transition-all uppercase tracking-wider"
                            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                        >
                            Create Lobby
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[var(--color-accent)] font-mono animate-flicker">
                        <span className="w-3 h-3 rounded-full bg-[var(--color-accent)] box-glow"></span>
                        128 PLAYERS ACTIVE
                    </div>
                </section>

                {/* GAME MODES */}
                <section className="py-20 px-6">
                    <h2 className="text-4xl font-bold text-center mb-16 text-white text-glow">
                        SELECT MODE
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {[
                            {
                                title: "1v1 DUEL",
                                icon: "⚔️",
                                desc: "Head-to-head combat. One winner.",
                                color: "var(--color-primary)"
                            },
                            {
                                title: "TEAM BATTLE",
                                icon: "🛡️",
                                desc: "6v6 Strategic Warfare. Coordinate and conquer.",
                                color: "var(--color-secondary)"
                            },
                            {
                                title: "SQUID MODE",
                                icon: "🦑",
                                desc: "Mass elimination. Survive or get deleted.",
                                color: "var(--color-accent)"
                            },
                        ].map((mode, i) => (
                            <div
                                key={i}
                                className="glass-panel p-8 rounded-xl relative group overflow-hidden hover:translate-y-[-5px] transition-all duration-300"
                            >
                                <div
                                    className="absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-2"
                                    style={{ backgroundColor: mode.color }}
                                ></div>
                                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">{mode.icon}</div>
                                <h3 className="text-2xl font-bold mb-3 text-white font-[family:var(--font-heading)] border-b border-gray-800 pb-2 inline-block">
                                    {mode.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {mode.desc}
                                </p>
                                <div
                                    className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ color: mode.color }}
                                >
                                    INITIALIZE &rarr;
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LEADERBOARD PREVIEW - TERMINAL STYLE */}
                <section className="py-20 px-6 bg-[rgba(0,0,0,0.5)] border-y border-[rgba(255,255,255,0.05)]">
                    <h2 className="text-3xl font-bold text-center mb-10 text-white font-[family:var(--font-heading)]">
                        TOP OPERATORS
                    </h2>

                    <div className="max-w-2xl mx-auto bg-black rounded-lg border border-gray-800 p-6 font-mono text-sm md:text-base shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between text-gray-500 mb-4 border-b border-gray-800 pb-2">
                            <span>RANK</span>
                            <span>OPERATOR</span>
                            <span>RATING</span>
                        </div>

                        {[
                            { rank: "01", user: "codeNinja", elo: "1842", color: "#ffd700" },
                            { rank: "02", user: "byteMaster", elo: "1760", color: "#c0c0c0" },
                            { rank: "03", user: "aditya", elo: "1702", color: "#cd7f32" },
                        ].map((p, i) => (
                            <div key={i} className="flex justify-between items-center py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer group">
                                <span className="text-gray-500 group-hover:text-white">#{p.rank}</span>
                                <span className="text-[var(--color-primary)] font-bold">{p.user}</span>
                                <span className="text-[var(--color-success)]">{p.elo} <span className="text-xs text-gray-600">ELO</span></span>
                            </div>
                        ))}

                        <div className="mt-6 text-center">
                            <button className="text-xs text-gray-500 hover:text-[var(--color-primary)] transition-colors bracket-btn">
                                [ VIEW FULL RANKINGS ]
                            </button>
                        </div>
                    </div>
                </section>

                {/* PROFILE SECTION */}
                {user && (
                    <section className="py-20 px-6 text-center">
                        <h2 className="text-2xl font-bold mb-8 text-white">CURRENT SESSION</h2>
                        <div className="inline-flex glass-panel p-8 rounded-2xl items-center gap-8 text-left border-glow">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-3xl font-bold text-black border-2 border-white">
                                {user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Authenticated As</p>
                                <h3 className="text-3xl font-bold text-white mb-1 font-[family:var(--font-heading)]">{user.username}</h3>
                                <div className="flex gap-4 text-sm">
                                    <span className="text-[var(--color-success)]">● Online</span>
                                    <span className="text-gray-400">Role: <span className="text-white">{user.role}</span></span>
                                    <span className="text-gray-400">Rating: <span className="text-[var(--color-primary)]">{user.rankPoints || "N/A"}</span></span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Home;