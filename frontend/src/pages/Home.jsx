import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Home = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] text-[var(--color-text-main)] font-[family:var(--font-body)] transition-colors duration-300">
            {/* MINIMALIST BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 grid-bg opacity-[0.03]"></div>
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--color-primary)] opacity-[0.02] blur-[120px] rounded-full"></div>
            </div>

            <div className="relative z-10">
                <div className="relative z-10">
                    {/* HERO SECTION */}
                    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
                        {/* Background Visual */}


                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
                            <div className="inline-block px-4 py-1 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] uppercase mb-8">
                                Evolution of Competitive Coding
                            </div>

                            <div className="mb-10">
                                <div className="w-24 h-24 mx-auto overflow-hidden flex items-center justify-center">
                                    <img
                                        src={logo}
                                        alt="ChallegX Logo"
                                        className="w-full h-full object-contain scale-[1.5] drop-shadow-[0_0_30px_rgba(255,170,0,0.3)]"
                                    />
                                </div>
                            </div>

                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-8 font-[family:var(--font-heading)] uppercase text-[var(--color-text-main)]">
                                THE ULTIMATE<br />
                                CHALLEG<span className="text-[var(--color-primary)]">X</span>
                            </h1>

                            <p className="max-w-2xl mx-auto text-[var(--color-text-muted)] text-lg md:text-xl font-medium leading-relaxed mb-12 tracking-tight">
                                {isAuthenticated
                                    ? "Welcome back. You're ready to play. Join a match and prove your skills in the arena."
                                    : "Master your algorithms, compete in intense real-time matches, and climb the global ranks. The next generation of competitive coding is here."}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <button
                                    onClick={() => navigate(isAuthenticated ? "/matchmaking" : "/login")}
                                    className="group relative px-10 py-5 bg-[var(--color-primary)] text-black font-black uppercase tracking-[0.1em] text-xs hover:bg-white transition-all transform hover:-translate-y-1 shadow-[0_0_30px_rgba(204,255,0,0.3)] active:scale-95"
                                    style={{ borderRadius: "4px" }}
                                >
                                    {isAuthenticated ? "Start Matching" : "Access the Arena"}
                                </button>
                                <button
                                    onClick={() => navigate(isAuthenticated ? "/battles" : "/login")}
                                    className="px-10 py-5 border border-white/10 hover:border-white/40 text-[var(--color-text-main)] font-bold uppercase tracking-[0.1em] text-xs transition-all hover:bg-white/5 backdrop-blur-sm"
                                    style={{ borderRadius: "4px" }}
                                >
                                    {isAuthenticated ? "View Matches" : "Login"}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* PROTOCOL SELECTOR */}
                    {!isAuthenticated && (
                        <section className="py-40 px-6 max-w-7xl mx-auto border-t border-white/[0.03]">
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
                                <div>
                                    <div className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] uppercase mb-4">Game Modes</div>
                                    <h2 className="text-5xl font-black text-[var(--color-text-main)] tracking-tighter uppercase font-[family:var(--font-heading)]">Choose Game Mode</h2>
                                </div>
                                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em] mb-1">
                                    [ 04 Modes Available ]
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                                {[
                                    {
                                        title: "1v1 Duel",
                                        desc: "The ultimate test of speed. Go head-to-head with another coder to solve a problem first. Winner takes the rank points.",
                                        label: "RANKED BATTLE",
                                        meta: "Fast Paced",
                                        path: "/matchmaking"
                                    },
                                    {
                                        title: "Team War",
                                        desc: "Collaborate with your squad to outscore the opposition. Strategy and coordination are key to winning team battles.",
                                        label: "TEAM PLAY",
                                        meta: "Collaborative",
                                        path: "/team-battle"
                                    },
                                    {
                                        title: "Squid Game",
                                        desc: "Survival of the smartest. A multi-round elimination tournament where only the fastest coders survive to the end.",
                                        label: "SURVIVAL MODE",
                                        meta: "High Stakes",
                                        path: "/squid-game"
                                    },
                                    {
                                        title: "Contests",
                                        desc: "Compete against hundreds of developers simultaneously in scheduled events. Climb the live global leaderboard.",
                                        label: "TOURNAMENTS",
                                        meta: "Mass Movement",
                                        path: "/contests"
                                    }
                                ].map((mode, i) => (
                                    <div
                                        key={i}
                                        onClick={() => navigate(mode.path)}
                                        className="group p-10 bg-[var(--color-bg-card)] border border-[var(--glass-border)] hover:border-[var(--color-primary)]/50 transition-all relative overflow-hidden cursor-pointer"
                                        style={{ borderRadius: "12px" }}
                                    >
                                        <div className="absolute top-0 right-0 p-6 text-[8px] font-bold text-slate-700 tracking-widest uppercase">
                                            {mode.meta}
                                        </div>
                                        <div className="text-[9px] font-bold text-[var(--color-primary)] tracking-[0.3em] mb-10 pl-1 uppercase">
                                            Mode 0{i + 1} // {mode.label}
                                        </div>
                                        <h3 className="text-3xl font-black text-[var(--color-text-main)] mb-5 group-hover:text-[var(--color-primary)] transition-colors font-[family:var(--font-heading)] uppercase tracking-tight">
                                            {mode.title}
                                        </h3>
                                        <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-10 font-medium tracking-tight h-20 overflow-hidden">
                                            {mode.desc}
                                        </p>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)] opacity-60 group-hover:opacity-100 transition-all pt-6 border-t border-white/5 inline-flex items-center gap-2">
                                            Start Playing <span className="text-lg">→</span>
                                        </div>

                                        {/* Hover Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* GLOBAL RANKINGS TERMINAL */}
                    {!isAuthenticated && (
                        <section className="py-40 bg-white/[0.005] border-y border-white/[0.03]">
                            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-32 items-center">
                                <div className="relative text-left">
                                    <div className="absolute -left-20 top-0 text-[120px] font-black text-[var(--color-text-main)]/[0.01] -z-10 tracking-tighter leading-none select-none">
                                        TOP 100
                                    </div>
                                    <h2 className="text-5xl md:text-7xl font-black text-[var(--color-text-main)] leading-[0.9] mb-8 tracking-tighter uppercase font-[family:var(--font-heading)]">
                                        GLOBAL<br />
                                        <span className="text-[var(--color-primary)]">LEADERBOARD</span>
                                    </h2>
                                    <p className="text-[var(--color-text-muted)] text-lg font-medium leading-relaxed mb-12 tracking-tight max-w-lg">
                                        See where you stand against the world's most elite coders. Every battle won puts you closer to the top.
                                    </p>
                                    <div className="flex gap-16">
                                        <div>
                                            <div className="text-5xl font-black text-[var(--color-text-main)] mb-1 tabular-nums">2.4M</div>
                                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-1">Problems Solved</div>
                                        </div>
                                        <div className="border-l border-white/10 pl-16">
                                            <div className="text-5xl font-black text-[var(--color-text-main)] mb-1 tabular-nums">148K</div>
                                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-1">Active Coders</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="premium-card p-1" style={{ borderRadius: "2px" }}>
                                    <div className="bg-[var(--color-bg-dark)] p-10 md:p-14">
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
                                                            <span className="text-sm font-black text-slate-300 group-hover:text-[var(--color-text-main)] uppercase tracking-wider transition-colors">{p.user}</span>
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
                                            View Leaderboard
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>


            </div>
        </div>
    );
};

export default Home;
