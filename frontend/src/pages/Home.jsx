import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.png";
import axios from "../../lib/axios";
import { getSocket } from "../../lib/socket";
import { 
  Users, 
  Swords, 
  CheckCircle, 
  Globe, 
  ChevronRight, 
  Terminal, 
  Zap, 
  Trophy, 
  Target, 
  Eye, 
  Skull, 
  Radio, 
  Sparkles, 
  MessageCircle,
  LogIn
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalStats } from "../hooks/useGlobalStats";

const Home = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const { data: stats = { onlineUsersCount: 0, totalInQueue: 0, activeBattles: 0, totalSolved: 0 }, isLoading } = useGlobalStats();
    const [showStatsPanel, setShowStatsPanel] = useState(false);
    const statsPanelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (statsPanelRef.current && !statsPanelRef.current.contains(event.target)) {
                setShowStatsPanel(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Format stats values nicely (e.g. 8200000 -> 8.2M)
    const formatCompilations = (val) => {
        if (!val) return "8.2M";
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toString();
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-neutral-50 font-[family:var(--font-body)] transition-colors duration-300 relative overflow-x-hidden">
            {/* AMBIENT BACKGROUND SYSTEM */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                    alt="Dark code editor"
                    className="object-cover opacity-[0.04] absolute inset-0 w-full h-full"
                    src="https://images.unsplash.com/photo-1518773553398-650c184e0bb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                />
                <div className="bg-[radial-gradient(circle_at_30%_20%,rgba(18,18,18,0.7),transparent_60%)] absolute inset-0" />
                <div className="bg-gradient-to-br from-[#09090b]/80 via-transparent to-[#09090b]/90 absolute inset-0" />
                <div className="bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] absolute inset-0" />
            </div>

            {/* FLOATING DECORATIVE CODE BLOCKS (Responsive & Blurred) */}
            <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block overflow-hidden">
                {/* Code Block 1 - Left Top */}
                <div className="backdrop-blur-md shadow-2xl rotate-[-6deg] rounded-sm bg-[#18181b]/60 border border-white/5 absolute left-10 top-32 p-4 max-w-[240px]">
                    <pre className="leading-relaxed font-mono text-neutral-400 text-[10px] leading-4">
                        <code>{`function challenge() {
  const arena = new Battle();
  return arena.compile();
}`}</code>
                    </pre>
                </div>

                {/* Code Block 2 - Right Top */}
                <div className="backdrop-blur-md shadow-2xl rotate-[4deg] rounded-sm bg-[#18181b]/50 border border-white/5 absolute right-12 top-44 p-4 max-w-[220px]">
                    <pre className="leading-relaxed font-mono text-neutral-400 text-[10px] leading-4">
                        <code>{`> deploy --arena
[ok] tests passed
[ok] rank +42`}</code>
                    </pre>
                </div>

                {/* Code Block 3 - Left Bottom */}
                <div className="backdrop-blur-md shadow-2xl rotate-[3deg] rounded-sm bg-[#18181b]/55 border border-white/5 absolute left-16 bottom-48 p-4 max-w-[250px]">
                    <pre className="leading-relaxed font-mono text-neutral-400 text-[10px] leading-4">
                        <code>{`const winner = players
  .sort(byScore)[0];`}</code>
                    </pre>
                </div>

                {/* Code Block 4 - Right Bottom */}
                <div className="backdrop-blur-md shadow-2xl rotate-[-3deg] rounded-sm bg-[#18181b]/40 border border-white/5 absolute right-16 bottom-36 p-4 max-w-[230px]">
                    <pre className="leading-relaxed font-mono text-neutral-400 text-[10px] leading-4">
                        <code>{`// Anti-Cheat active
// Tab focus monitored
monitorFocusEvents();`}</code>
                    </pre>
                </div>
            </div>

            {/* CORE CONTENT */}
            <div className="relative z-10">
                
                {/* HERO PANEL */}
                <section className="relative text-center flex px-4 sm:px-12 pt-32 sm:pt-40 pb-8 flex-col items-center">
                    <div className="relative flex flex-col items-center gap-6 max-w-4xl mx-auto">
                        <div className="inline-flex rounded-full bg-[#18181b] text-neutral-400 text-xs border border-white/5 px-3 py-1 items-center gap-2">
                            <span className="size-2 bg-emerald-500 animate-pulse rounded-full" />
                            Live matchmaking now open
                        </div>
                        <h1 className="[font-family:var(--font-heading)] max-w-3xl font-bold text-5xl sm:text-6xl md:text-7xl leading-tight tracking-tight uppercase text-white">
                            REAL-TIME CODING BATTLES
                        </h1>
                        <p className="max-w-2xl leading-relaxed text-neutral-400 text-sm sm:text-base md:text-lg font-medium leading-relaxed mb-4">
                            Enter the developer arena. Face real opponents in head-to-head
                            coding duels, climb the ranks, and prove your skills in
                            real-time compiled combat.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                            <button
                                onClick={() => navigate(isAuthenticated ? "/matchmaking" : "/login")}
                                className="w-full sm:w-auto font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm leading-5 px-8 py-3.5 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xl"
                            >
                                <Swords className="size-4" />
                                {isAuthenticated ? "Start Matching" : "Access the Arena"}
                            </button>
                            <button
                                onClick={() => navigate(isAuthenticated ? "/battles" : "/login")}
                                className="w-full sm:w-auto font-semibold rounded-xl bg-transparent text-neutral-50 text-sm leading-5 border border-white/10 hover:border-white/20 hover:bg-white/5 px-8 py-3.5 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                            >
                                <Target className="size-4" />
                                {isAuthenticated ? "Explore Battles" : "Login"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* STATS SECTION */}
                <section className="px-6 sm:px-12 pb-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="backdrop-blur rounded-xl bg-[#18181b]/80 border border-white/5 p-6 flex flex-col gap-2">
                            <div className="text-neutral-400 flex items-center gap-2">
                                <Zap className="size-4 text-emerald-500" />
                                <span className="uppercase text-[10px] font-bold tracking-widest">
                                    Active Battles
                                </span>
                            </div>
                            <span className="[font-family:var(--font-heading)] font-black text-4xl leading-10 text-white">
                                {stats.activeBattles || "1,284"}
                            </span>
                        </div>
                        <div className="backdrop-blur rounded-xl bg-[#18181b]/80 border border-white/5 p-6 flex flex-col gap-2">
                            <div className="text-neutral-400 flex items-center gap-2">
                                <Users className="size-4 text-emerald-500" />
                                <span className="uppercase text-[10px] font-bold tracking-widest">
                                    Players Online
                                </span>
                            </div>
                            <span className="[font-family:var(--font-heading)] font-black text-4xl leading-10 text-white">
                                {stats.onlineUsersCount || "42,910"}
                            </span>
                        </div>
                        <div className="backdrop-blur rounded-xl bg-[#18181b]/80 border border-white/5 p-6 flex flex-col gap-2">
                            <div className="text-neutral-400 flex items-center gap-2">
                                <Terminal className="size-4 text-neutral-500" />
                                <span className="uppercase text-[10px] font-bold tracking-widest">
                                    Total Solved
                                </span>
                            </div>
                            <span className="[font-family:var(--font-heading)] font-black text-4xl leading-10 text-white">
                                {formatCompilations(stats.totalSolved)}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ROADMAP SECTION */}
                {!isAuthenticated && (
                    <section className="px-6 sm:px-12 pb-20 pt-20 max-w-7xl mx-auto border-t border-white/5">
                        <div className="flex mb-10 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="[font-family:var(--font-heading)] font-bold text-2xl tracking-tight text-white">
                                    Battle Modes Roadmap
                                </h2>
                                <span className="px-2 py-0.5 rounded bg-neutral-900 border border-white/5 text-[10px] font-bold text-neutral-400">
                                    5 modes
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hidden sm:inline">Active Protocol</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="group rounded-xl bg-[#18181b] border border-white/5 p-6 flex flex-col gap-4 hover:border-white/15 transition-all">
                                <div className="size-10 rounded-lg bg-neutral-900 flex justify-center items-center">
                                    <Swords className="size-5 text-emerald-500" />
                                </div>
                                <div>
                                    <span className="[font-family:var(--font-heading)] font-semibold text-base text-white block mb-2">
                                        1v1 Battles
                                    </span>
                                    <p className="leading-relaxed text-neutral-400 text-xs">
                                        Duel a single opponent in a timed, real-time coding showdown with live testcase score comparing.
                                    </p>
                                </div>
                            </div>
                            <div className="group rounded-xl bg-[#18181b] border border-white/5 p-6 flex flex-col gap-4 hover:border-white/15 transition-all">
                                <div className="size-10 rounded-lg bg-neutral-900 flex justify-center items-center">
                                    <Users className="size-5 text-emerald-500" />
                                </div>
                                <div>
                                    <span className="[font-family:var(--font-heading)] font-semibold text-base text-white block mb-2">
                                        Team Battles
                                    </span>
                                    <p className="leading-relaxed text-neutral-400 text-xs">
                                        Squad up and compete in cooperative multi-player rounds against rival developer teams.
                                    </p>
                                </div>
                            </div>
                            <div className="group rounded-xl bg-[#18181b] border border-white/5 p-6 flex flex-col gap-4 hover:border-white/15 transition-all">
                                <div className="size-10 rounded-lg bg-neutral-900 flex justify-center items-center">
                                    <Eye className="size-5 text-white" />
                                </div>
                                <div>
                                    <span className="[font-family:var(--font-heading)] font-semibold text-base text-white block mb-2">
                                        Spectating
                                    </span>
                                    <p className="leading-relaxed text-neutral-400 text-xs">
                                        Watch top battles unfold live with keystroke-level code updates and Gemini commentary.
                                    </p>
                                </div>
                            </div>
                            <div className="group rounded-xl bg-[#18181b] border border-white/5 p-6 flex flex-col gap-4 hover:border-white/15 transition-all">
                                <div className="size-10 rounded-lg bg-neutral-900 flex justify-center items-center">
                                    <Skull className="size-5 text-neutral-500" />
                                </div>
                                <div>
                                    <span className="[font-family:var(--font-heading)] font-semibold text-base text-white block mb-2">
                                        Squid Game Mode
                                    </span>
                                    <p className="leading-relaxed text-neutral-400 text-xs">
                                        Survive brutal elimination rounds where the slowest coder is knocked out round after round.
                                    </p>
                                </div>
                            </div>
                            <div className="group rounded-xl bg-[#18181b] border border-white/5 p-6 flex flex-col gap-4 hover:border-white/15 transition-all">
                                <div className="size-10 rounded-lg bg-neutral-900 flex justify-center items-center">
                                    <Radio className="size-5 text-emerald-500" />
                                </div>
                                <div>
                                    <span className="[font-family:var(--font-heading)] font-semibold text-base text-white block mb-2">
                                        Live Contests
                                    </span>
                                    <p className="leading-relaxed text-neutral-400 text-xs">
                                        Join scheduled global tournaments with real-time scoreboards and algorithmic rankings.
                                    </p>
                                </div>
                            </div>
                            <div className="text-center rounded-xl bg-[#18181b]/20 border border-white/5 border-dashed flex p-6 flex-col justify-center items-center gap-4">
                                <Sparkles className="size-6 text-neutral-600" />
                                <p className="text-neutral-500 text-xs font-semibold uppercase tracking-widest">
                                    More modes coming soon
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* GLOBAL RANKINGS TERMINAL */}
                {!isAuthenticated && (
                    <section className="py-28 bg-[#18181b]/10 border-t border-white/5 relative z-10">
                        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                            <div className="text-left">
                                <div className="inline-block px-3 py-1 rounded-md border border-white/5 bg-[#18181b] text-[8px] font-bold tracking-[0.4em] text-neutral-500 uppercase mb-6">
                                    Global Standings
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] mb-8 tracking-tighter uppercase font-[family:var(--font-heading)]">
                                    THE LEADER<br />
                                    <span className="text-neutral-500">BOARD</span>
                                </h2>
                                <p className="text-neutral-400 text-sm font-medium leading-relaxed mb-12 tracking-tight max-w-lg">
                                    Track progress, view active Elo ratings, and monitor combat history of the top developers on the platform.
                                </p>
                                <div className="flex gap-12">
                                    <div>
                                        <div className="text-4xl font-black text-white mb-1 tabular-nums">2.4M</div>
                                        <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Solutions Compiled</div>
                                    </div>
                                    <div className="border-l border-white/10 pl-12">
                                        <div className="text-4xl font-black text-white mb-1 tabular-nums">148K</div>
                                        <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Total Registrations</div>
                                    </div>
                                </div>
                            </div>

                            {/* Stylized Leaderboard Card */}
                            <div className="rounded-2xl border border-white/5 bg-[#18181b] p-8 shadow-2xl">
                                <div className="space-y-6">
                                    {[
                                        { rank: "01", user: "codeNinja", elo: "1,842", status: "ONLINE" },
                                        { rank: "02", user: "byteMaster", elo: "1,760", status: "AWAY" },
                                        { rank: "03", user: "aditya", elo: "1,702", status: "ONLINE" },
                                        { rank: "04", user: "logic_bomb", elo: "1,688", status: "BUSY" },
                                        { rank: "05", user: "void_walker", elo: "1,640", status: "ONLINE" },
                                    ].map((p, i) => (
                                        <div key={i} className="flex items-center justify-between group cursor-pointer py-3.5 border-b border-white/5 hover:border-white/20 transition-all">
                                            <div className="flex items-center gap-6">
                                                <span className="text-xs font-bold text-neutral-500 group-hover:text-white tabular-nums">{p.rank}</span>
                                                <div className="text-left">
                                                    <span className="text-sm font-black text-neutral-300 group-hover:text-white uppercase tracking-wider transition-colors">{p.user}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-700'}`}></div>
                                                        <span className="text-[8px] font-bold text-neutral-500 tracking-tighter uppercase">{p.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-white tabular-nums">{p.elo}</span>
                                                <div className="text-[8px] font-bold text-neutral-500 uppercase">Elo Rating</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => navigate("/leaderboard")}
                                    className="w-full mt-10 py-4 border border-white/5 hover:bg-[#27272a] text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-lg active:scale-[0.98]"
                                >
                                    View Full Standings
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* FOOTER */}
                {!isAuthenticated && (
                    <footer className="border-t border-white/5 bg-[#09090b] px-6 sm:px-12 py-16 relative z-10">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
                            <div className="flex flex-col gap-3">
                                <span className="[font-family:var(--font-heading)] font-semibold text-sm leading-5 mb-1 text-white uppercase tracking-wider">
                                    Product
                                </span>
                                <Link to="/battles" className="text-neutral-400 hover:text-white transition-colors text-sm">Battles</Link>
                                <Link to="/leaderboard" className="text-neutral-400 hover:text-white transition-colors text-sm">Leaderboard</Link>
                                <Link to="/contests" className="text-neutral-400 hover:text-white transition-colors text-sm">Tournaments</Link>
                            </div>
                            <div className="flex flex-col gap-3">
                                <span className="[font-family:var(--font-heading)] font-semibold text-sm leading-5 mb-1 text-white uppercase tracking-wider">
                                    Social
                                </span>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                                    {/* GitHub SVG */}
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.73.084-.73 1.207.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                    </svg>
                                    GitHub
                                </a>
                                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                                    <MessageCircle className="size-4 text-[#5865F2]" />
                                    Discord
                                </a>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-white text-black font-black flex items-center justify-center text-sm" style={{ borderRadius: "2px" }}>
                                        X
                                    </div>
                                    <span className="[font-family:var(--font-heading)] font-semibold text-sm leading-5 text-white uppercase">
                                        ChallengX
                                    </span>
                                </div>
                                <p className="leading-relaxed text-neutral-500 text-xs">
                                    The real-time developer arena for competitive coding.
                                </p>
                                <span className="text-neutral-600 text-xs mt-2">
                                    © 2026 ChallengX. All rights reserved.
                                </span>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default Home;
