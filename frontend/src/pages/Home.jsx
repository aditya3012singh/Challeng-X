import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-[var(--color-text-main)] font-[family:var(--font-body)]">
            {/* MINIMALIST BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 grid-bg opacity-[0.03]"></div>
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--color-primary)] opacity-[0.02] blur-[120px] rounded-full"></div>
            </div>

            <div className="relative z-10">
                {/* HERO SECTION */}
                <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="text-[10px] font-bold tracking-[0.5em] text-[var(--color-primary)] uppercase mb-6">
                            Next-Gen Competitive Programming
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black tracking-tight leading-[0.9] mb-8">
                            THE NEW<br />
                            <span className="text-white">CODE</span>
                            <span className="text-[var(--color-primary)]">ARENA</span>
                        </h1>

                        <p className="max-w-xl mx-auto text-slate-500 text-lg md:text-xl font-light leading-relaxed mb-12">
                            Elevate your logic. Compete in high-stakes arenas.<br />
                            Synchronized execution for the modern developer.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => navigate("/matchmaking")}
                                className="px-10 py-4 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all transform hover:-translate-y-1 shadow-lg"
                                style={{ borderRadius: "2px" }}
                            >
                                Enter Arena
                            </button>
                            <button
                                onClick={() => navigate("/battles")}
                                className="px-10 py-4 border border-white/10 hover:border-white/20 text-white font-bold uppercase tracking-widest text-xs transition-all"
                                style={{ borderRadius: "2px" }}
                            >
                                View Live Batlles
                            </button>
                        </div>
                    </div>
                </section>

                {/* FEATURE MODES */}
                <section className="py-32 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl font-bold text-white mb-4">Select Protocol</h2>
                        <div className="w-12 h-1 bg-[var(--color-primary)] mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "1v1 Duel",
                                desc: "Pure head-to-head algorithm execution. Test your speed and precision against the world's best.",
                                label: "RANKED"
                            },
                            {
                                title: "Team Battle",
                                desc: "Collaborative logic construction. Synchronize with your team to dismantle opponent nodes.",
                                label: "SOCIAL"
                            },
                            {
                                title: "Elimination",
                                desc: "The ultimate survival protocol. Last operator standing wins the entire pool.",
                                label: "HC_MODE"
                            }
                        ].map((mode, i) => (
                            <div
                                key={i}
                                className="premium-card p-12 group cursor-pointer"
                                style={{ borderRadius: "2px" }}
                            >
                                <div className="text-[9px] font-bold text-[var(--color-primary)] tracking-[0.3em] mb-10 opacity-50 group-hover:opacity-100 transition-opacity">
                                    0{i + 1} // {mode.label}
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-[var(--color-primary)] transition-colors">
                                    {mode.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-10 font-light">
                                    {mode.desc}
                                </p>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white transition-all">
                                    Initialize Protocol →
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LEADERBOARD / TERMINAL */}
                <section className="py-40 bg-white/[0.01] border-y border-white/[0.03]">
                    <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
                        <div>
                            <h2 className="text-5xl font-black text-white leading-none mb-8">
                                GLOBAL<br />
                                <span className="text-[var(--color-primary)]">RANKINGS</span>
                            </h2>
                            <p className="text-slate-500 text-lg font-light leading-relaxed mb-10">
                                Real-time classification of the world's most efficient computational minds.
                            </p>
                            <div className="flex gap-16">
                                <div>
                                    <div className="text-4xl font-bold text-white mb-1">2.4M</div>
                                    <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Calculations</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-white mb-1">148K</div>
                                    <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Operators</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#080808] border border-white/[0.05] p-1 shadow-2xl">
                            <div className="bg-[#0a0a0a] p-8 md:p-12">
                                <div className="space-y-6">
                                    {[
                                        { rank: "01", user: "codeNinja", elo: "1,842" },
                                        { rank: "02", user: "byteMaster", elo: "1,760" },
                                        { rank: "03", user: "aditya", elo: "1,702" },
                                        { rank: "04", user: "logic_bomb", elo: "1,688" },
                                        { rank: "05", user: "void_walker", elo: "1,640" },
                                    ].map((p, i) => (
                                        <div key={i} className="flex items-center justify-between group cursor-pointer py-2 border-b border-white/[0.02] hover:border-[var(--color-primary)]/20 transition-all">
                                            <div className="flex items-center gap-8">
                                                <span className="text-[10px] font-bold text-slate-600 group-hover:text-[var(--color-primary)]">{p.rank}</span>
                                                <span className="text-sm font-bold text-slate-300 group-hover:text-white uppercase tracking-widest transition-colors">{p.user}</span>
                                            </div>
                                            <span className="text-sm font-bold text-[var(--color-primary)] tabular-nums">{p.elo}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-12 py-4 border border-white/5 hover:bg-white hover:text-black text-[10px] font-bold uppercase tracking-[0.4em] transition-all">
                                    Access Full Terminal
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* USER PROFILE CONSOLE */}
                {user && (
                    <section className="py-40 px-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white/[0.02] border border-white/[0.05] p-12 md:p-20 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)] opacity-[0.03] blur-[100px] -mr-32 -mt-32"></div>

                                <div className="w-40 h-40 bg-white/5 border border-white/10 flex items-center justify-center text-5xl font-black text-white shrink-0">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.6em] mb-4">Operator Data // Sync</div>
                                    <h3 className="text-6xl font-black text-white mb-8 tracking-tighter uppercase">{user.username}</h3>

                                    <div className="flex gap-12 justify-center md:justify-start border-l border-[var(--color-primary)]/20 pl-8">
                                        <div>
                                            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Rank Points</div>
                                            <div className="text-2xl font-bold text-white tabular-nums">{user.rankPoints || "1200"}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Authority</div>
                                            <div className="text-2xl font-bold text-white italic">OPERATOR</div>
                                        </div>
                                    </div>
                                </div>

                                <button className="px-12 py-5 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl">
                                    Global Profile
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <footer className="py-20 border-t border-white/[0.03] text-center">
                <div className="text-[9px] font-bold text-slate-700 uppercase tracking-[1em]">
                    Synchronized Code Execution // Code Arena v1.2
                </div>
            </footer>
        </div>
    );
};

export default Home;