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
                <section className="min-h-[95vh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-primary)] opacity-[0.012] blur-[150px] rounded-full"></div>

                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
                        <div className="text-[10px] font-bold tracking-[0.8em] text-[var(--color-primary)] uppercase mb-8 pl-4">
                            Competitive Synthesis // Neural Link
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black tracking-tight leading-[0.85] mb-12 font-[family:var(--font-heading)] uppercase text-white">
                            THE NEW<br />
                            CODE<span className="text-[var(--color-primary)]">ARENA</span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-light leading-relaxed mb-16 tracking-wide">
                            Elevate your logic. Compete in high-stakes automated arenas.<br />
                            <span className="text-slate-400">Synchronized execution for the next generation of engineers.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                            <button
                                onClick={() => navigate("/matchmaking")}
                                className="px-12 py-5 bg-[var(--color-primary)] text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all transform hover:-translate-y-1 shadow-2xl active:scale-95"
                                style={{ borderRadius: "2px" }}
                            >
                                Enter Arena
                            </button>
                            <button
                                onClick={() => navigate("/battles")}
                                className="px-12 py-5 border border-white/10 hover:border-white/30 text-white font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-white/5"
                                style={{ borderRadius: "2px" }}
                            >
                                Live Feed →
                            </button>
                        </div>
                    </div>
                </section>

                {/* PROTOCOL SELECTOR */}
                <section className="py-40 px-6 max-w-7xl mx-auto border-t border-white/[0.03]">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
                        <div>
                            <div className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] uppercase mb-4">Engagement Types</div>
                            <h2 className="text-5xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">Select Protocol</h2>
                        </div>
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em] mb-1">
                            [ 03 Modules Available ]
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "1v1 Duel",
                                desc: "Pure head-to-head algorithm execution. Test your speed and precision against the world's best.",
                                label: "RANKED_MOD",
                                meta: "Low Latency"
                            },
                            {
                                title: "Team Battle",
                                desc: "Collaborative logic construction. Synchronize with your team to dismantle opponent nodes.",
                                label: "SOCIAL_LINK",
                                meta: "Multi-Node"
                            },
                            {
                                title: "Elimination",
                                desc: "The ultimate survival protocol. Last operator standing wins the entire pool.",
                                label: "SURVIVE_PROT",
                                meta: "High Stakes"
                            }
                        ].map((mode, i) => (
                            <div
                                key={i}
                                className="premium-card p-14 group cursor-pointer relative overflow-hidden"
                                style={{ borderRadius: "2px" }}
                            >
                                <div className="absolute top-0 right-0 p-8 text-[9px] font-bold text-slate-800 tracking-widest uppercase">
                                    {mode.meta}
                                </div>
                                <div className="text-[9px] font-bold text-[var(--color-primary)] tracking-[0.4em] mb-12 pl-1">
                                    0{i + 1} // {mode.label}
                                </div>
                                <h3 className="text-4xl font-black text-white mb-6 group-hover:text-[var(--color-primary)] transition-colors font-[family:var(--font-heading)] uppercase tracking-tighter">
                                    {mode.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-12 font-light tracking-wide h-20 overflow-hidden">
                                    {mode.desc}
                                </p>
                                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-700 group-hover:text-white transition-all pt-6 border-t border-white/5 inline-block">
                                    Initialize Execution →
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* GLOBAL RANKINGS TERMINAL */}
                <section className="py-40 bg-white/[0.005] border-y border-white/[0.03]">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-32 items-center">
                        <div className="relative">
                            <div className="absolute -left-20 top-0 text-[100px] font-black text-white/[0.02] -z-10 tracking-tighter leading-none select-none">
                                TOP100
                            </div>
                            <h2 className="text-6xl font-black text-white leading-[0.9] mb-10 tracking-tighter uppercase font-[family:var(--font-heading)]">
                                GLOBAL<br />
                                <span className="text-[var(--color-primary)]">CLASSIFICATION</span>
                            </h2>
                            <p className="text-slate-500 text-lg font-light leading-relaxed mb-12 tracking-wide max-w-lg">
                                Real-time hierarchy of the most efficient computational minds active within the arena. Precision is mandatory.
                            </p>
                            <div className="flex gap-20">
                                <div>
                                    <div className="text-4xl font-black text-white mb-2 tabular-nums">2.4M</div>
                                    <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest pl-1">Operations</div>
                                </div>
                                <div className="border-l border-white/10 pl-20">
                                    <div className="text-4xl font-black text-white mb-2 tabular-nums">148K</div>
                                    <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest pl-1">Operators</div>
                                </div>
                            </div>
                        </div>

                        <div className="premium-card p-1" style={{ borderRadius: "2px" }}>
                            <div className="bg-[#050505] p-10 md:p-14">
                                <div className="space-y-8">
                                    {[
                                        { rank: "01", user: "codeNinja", elo: "1,842", status: "ONLINE" },
                                        { rank: "02", user: "byteMaster", elo: "1,760", status: "AWAY" },
                                        { rank: "03", user: "aditya", elo: "1,702", status: "ONLINE" },
                                        { rank: "04", user: "logic_bomb", elo: "1,688", status: "BUSY" },
                                        { rank: "05", user: "void_walker", elo: "1,640", status: "ONLINE" },
                                    ].map((p, i) => (
                                        <div key={i} className="flex items-center justify-between group cursor-pointer py-4 border-b border-white/[0.03] hover:border-[var(--color-primary)]/40 transition-all">
                                            <div className="flex items-center gap-10">
                                                <span className="text-[10px] font-bold text-slate-700 group-hover:text-[var(--color-primary)] tabular-nums">{p.rank}</span>
                                                <div>
                                                    <span className="text-sm font-black text-slate-300 group-hover:text-white uppercase tracking-wider transition-colors">{p.user}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className={`w-1 h-1 rounded-full ${p.status === 'ONLINE' ? 'bg-[var(--color-success)]' : 'bg-slate-800'}`}></div>
                                                        <span className="text-[8px] font-bold text-slate-600 tracking-tighter uppercase">{p.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-[var(--color-primary)] tabular-nums">{p.elo}</span>
                                                <div className="text-[8px] font-bold text-slate-700 uppercase">PTS</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => navigate("/leaderboard")}
                                    className="w-full mt-14 py-5 border border-white/5 hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-[0.5em] transition-all"
                                    style={{ borderRadius: "2px" }}
                                >
                                    Access Full Terminal
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* OPERATOR STATUS CONSOLE */}
                {user && (
                    <section className="py-40 px-6 bg-gradient-to-b from-[#050505] to-black">
                        <div className="max-w-5xl mx-auto">
                            <div className="premium-card p-14 md:p-24 flex flex-col md:flex-row items-center gap-20 relative overflow-hidden" style={{ borderRadius: "2px" }}>
                                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-primary)] opacity-[0.015] blur-[120px] -mr-40 -mt-40"></div>

                                <div className="w-48 h-48 bg-white/[0.02] border border-white/10 flex items-center justify-center text-6xl font-black text-white shrink-0 relative shadow-2xl">
                                    <div className="absolute inset-2 border border-white/5"></div>
                                    {user.username.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.8em] mb-6">Operator Identity // Synchronized</div>
                                    <h3 className="text-7xl font-black text-white mb-10 tracking-tighter uppercase font-[family:var(--font-heading)]">{user.username}</h3>

                                    <div className="flex gap-20 justify-center md:justify-start border-l border-[var(--color-primary)]/20 pl-10">
                                        <div>
                                            <div className="text-[9px] text-slate-600 uppercase tracking-widest font-black mb-2">Rank Potential</div>
                                            <div className="text-3xl font-black text-white tabular-nums">{user.rankPoints || "1200"}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-slate-600 uppercase tracking-widest font-black mb-2">Clearance Level</div>
                                            <div className="text-3xl font-black text-[var(--color-primary)] italic tracking-tighter">ELITE</div>
                                        </div>
                                    </div>
                                </div>

                                <button className="px-14 py-6 bg-[var(--color-primary)] text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all shadow-2xl active:scale-95" style={{ borderRadius: "2px" }}>
                                    Full Status Check
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <footer className="py-24 border-t border-white/[0.03] text-center bg-black/40">
                <div className="text-[9px] font-bold text-slate-700 uppercase tracking-[1em] mb-4">
                    Synchronized Code Execution // Code Arena v1.2
                </div>
                <div className="text-slate-800 text-[8px] font-bold uppercase tracking-widest">
                    All Rights Reserved © 2024 CORE.SYNTHESIS
                </div>
            </footer>
        </div>
    );
};

export default Home;