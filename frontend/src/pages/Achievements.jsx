import React from "react";
import { useSelector } from "react-redux";
import { 
    Trophy, Award, Zap, Star, Shield, 
    Target, Flame, CheckCircle2, Lock, 
    ChevronRight, Cpu, Globe, Rocket, Terminal
} from 'lucide-react';
import { motion } from 'framer-motion';

const Achievements = () => {
    const { user } = useSelector((state) => state.auth);
    const achievements = user?.achievements || [];
    const cyberCores = user?.cyberCores || 0;
    const streak = user?.dailyLoginStreak || 0;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] text-slate-300 py-24 px-6 font-mono selection:bg-[var(--color-primary)] selection:text-black">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-[800px] h-[800px] bg-[var(--color-primary)] opacity-[0.02] blur-[150px] rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500 opacity-[0.01] blur-[150px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* HEADER */}
                <header className="mb-20">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                        <div>
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[10px] font-black tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4"
                            >
                                Progression System v4.0.2
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl lg:text-8xl font-black text-[var(--color-text-main)] tracking-tighter uppercase leading-none"
                            >
                                Achievement <span className="text-transparent border-t border-b border-white/20 px-2">Center</span>
                            </motion.h1>
                        </div>

                        <div className="flex gap-6 lg:gap-12 p-8 bg-white/[0.02] border border-white/5 rounded-sm backdrop-blur-md">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Cyber-Cores</span>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[var(--color-primary)]/10 rounded-full border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                                        <Cpu size={16} className="text-[var(--color-primary)]" />
                                    </div>
                                    <span className="text-3xl font-black text-[var(--color-text-main)] font-mono">{cyberCores}</span>
                                </div>
                            </div>
                            <div className="w-[1px] bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Active Streak</span>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/10 rounded-full border border-orange-500/20 shadow-[0_0_15px_rgba(255,165,0,0.1)]">
                                        <Flame size={16} className="text-orange-500" />
                                    </div>
                                    <span className="text-3xl font-black text-[var(--color-text-main)] font-mono">{streak}d</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* OVERVIEW STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: "Badges Earned", value: achievements.length, icon: Award, color: "text-blue-500" },
                        { label: "Total Milestones", value: "12/48", icon: Target, color: "text-[var(--color-primary)]" },
                        { label: "Global Rank", value: `#${user?.rankPoints > 0 ? '1.4k' : '---'}`, icon: Globe, color: "text-purple-500" },
                        { label: "Completion", value: `${Math.round((achievements.length / 48) * 100)}%`, icon: Zap, color: "text-emerald-500" }
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: i * 0.1 }}
                            className="p-8 bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all"
                            style={{ borderRadius: "2px" }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-2 bg-white/5 rounded-sm ${stat.color}`}>
                                    <stat.icon size={18} />
                                </div>
                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Node {i + 1}</div>
                            </div>
                            <div className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{stat.label}</div>
                            <div className="text-2xl font-black text-[var(--color-text-main)] tracking-tighter">{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* LEFT: UNLOCKED BADGES */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <Award size={20} className="text-[var(--color-primary)]" />
                                <h2 className="text-xl font-black text-[var(--color-text-main)] uppercase tracking-[0.2em]">Digitally Hardened Badges</h2>
                                <div className="flex-1 h-[1px] bg-white/5" />
                            </div>

                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid sm:grid-cols-2 gap-4"
                            >
                                {achievements.length > 0 ? achievements.map((ach, i) => (
                                    <motion.div 
                                        key={ach.id}
                                        variants={itemVariants}
                                        className="p-6 bg-white/[0.03] border border-white/10 border-l-2 border-l-[var(--color-primary)] flex items-center gap-6 group hover:bg-white/[0.05] transition-all"
                                        style={{ borderRadius: "2px" }}
                                    >
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-black/40 border border-white/10 flex items-center justify-center rotate-45 group-hover:rotate-0 group-hover:border-[var(--color-primary)]/40 transition-all duration-500" style={{ borderRadius: "4px" }}>
                                                <div className="-rotate-45 group-hover:rotate-0 transition-all duration-500">
                                                    <Trophy size={28} className="text-[var(--color-primary)]" />
                                                </div>
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-[var(--color-text-main)] uppercase tracking-wider mb-1">{ach.badge?.name || "REDACTED BADGE"}</h3>
                                            <p className="text-[10px] text-[var(--color-text-muted)] font-medium leading-relaxed">{ach.badge?.description || "Badge data encrypted or unavailable."}</p>
                                            <div className="text-[8px] font-black text-[var(--color-primary)] uppercase tracking-widest mt-3">Unlocked {ach.unlockedAt ? new Date(ach.unlockedAt).toLocaleDateString() : "DATE UNKNOWN"}</div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-2 p-12 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-40">
                                        <Lock size={32} className="text-slate-700 mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">No high-level clearances detected</p>
                                        <p className="text-[9px] mt-2 italic text-slate-600">Complete battles to unlock core achievements</p>
                                    </div>
                                )}
                            </motion.div>
                        </section>

                        {/* UPCOMING MILESTONES */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <Target size={20} className="text-blue-500" />
                                <h2 className="text-xl font-black text-[var(--color-text-main)] uppercase tracking-[0.2em]">Priority Objectives</h2>
                                <div className="flex-1 h-[1px] bg-white/5" />
                            </div>

                            <div className="space-y-4">
                                {[
                                    { title: "Binary Master", desc: "Win 50 matches using C++", progress: 64, total: 50, current: 32 },
                                    { title: "Speed Demon", desc: "Solve a Medium problem in < 5 mins", progress: 80, total: 5, current: 4 },
                                    { title: "Grand Architect", desc: "Reach 2000 ELO Rating", progress: 45, total: 2000, current: 900 }
                                ].map((target, i) => (
                                    <div key={i} className="p-6 bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all" style={{ borderRadius: "2px" }}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xs font-black text-[var(--color-text-main)] uppercase tracking-widest mb-1">{target.title}</h3>
                                                <p className="text-[10px] text-[var(--color-text-muted)] font-light">{target.desc}</p>
                                            </div>
                                            <span className="text-[10px] font-mono font-black text-[var(--color-text-muted)]">{target.progress}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 overflow-hidden" style={{ borderRadius: "1px" }}>
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${target.progress}%` }}
                                                className="h-full bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT: LEGEND & RARITY */}
                    <div className="space-y-8">
                        <div className="p-8 bg-black/40 border border-white/5 relative overflow-hidden" style={{ borderRadius: "2px" }}>
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Shield size={80} />
                            </div>
                            <h3 className="text-[10px] font-black text-[var(--color-text-main)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full" /> System Rarity
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { rank: "S-Tier", rarity: "Mythic", color: "bg-red-500", count: 2 },
                                    { rank: "A-Tier", rarity: "Legendary", color: "bg-orange-500", count: 5 },
                                    { rank: "B-Tier", rarity: "Rare", color: "bg-blue-500", count: 12 },
                                    { rank: "C-Tier", rarity: "Common", color: "bg-slate-500", count: 29 }
                                ].map((tier, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-1 h-4 ${tier.color}`} />
                                            <div>
                                                <div className="text-[10px] font-black text-[var(--color-text-main)] uppercase mb-0.5">{tier.rank}</div>
                                                <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{tier.rarity}</div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-700">x{tier.count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 border border-white/5 bg-white/[0.01]" style={{ borderRadius: "2px" }}>
                            <h3 className="text-[10px] font-black text-[var(--color-text-main)] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                <Terminal size={14} className="text-slate-600" /> Recent Activity
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { icon: Zap, text: "Gained +10 Cyber-Cores", time: "2h ago" },
                                    { icon: Award, text: "Unlocked 'First Blood' Badge", time: "5h ago" },
                                    { icon: Flame, text: "Login Streak increased to 3d", time: "12h ago" }
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-4">
                                        <log.icon size={12} className="text-slate-600 mt-1" />
                                        <div>
                                            <div className="text-[10px] text-slate-300 font-medium">{log.text}</div>
                                            <div className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-1">{log.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full py-5 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)] hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-3 active:scale-95">
                            Show All Achievements <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Achievements;
