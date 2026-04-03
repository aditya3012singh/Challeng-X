import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, Trophy, Layout, ChevronRight, Timer, Play, Plus } from "lucide-react";
import { ROUND_CONFIG } from "./SquidGameConfig";

const LobbyScreen = ({ onJoin, onCreate, isJoining, isCreating }) => {
    const [joinCode, setJoinCode] = useState("");
    const [tournamentName, setTournamentName] = useState("");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] text-[var(--color-text-main)] font-sans relative overflow-hidden py-20 px-6">
            {/* Elegant Background */}
            <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ 
                backgroundImage: 'radial-gradient(var(--glass-border) 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }} />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div variants={itemVariants} className="flex justify-center mb-8">
                        <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-3xl flex items-center justify-center border border-[var(--color-primary)]/20 shadow-[0_0_50px_rgba(var(--color-primary-rgb),0.1)]">
                           <Trophy className="text-[var(--color-primary)]" size={40} />
                        </div>
                    </motion.div>
                    <motion.h1 
                        variants={itemVariants}
                        className="text-7xl font-black tracking-tight uppercase mb-6 font-[family:var(--font-heading)]"
                    >
                        Squid Game <span className="text-[var(--color-primary)]">Survival</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-[var(--color-text-muted)] text-[11px] max-w-xl mx-auto uppercase tracking-[0.5em] font-bold opacity-40">
                        Competing for the Title of Ultimate Survivor
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Rules/Info Section */}
                    <div className="lg:col-span-7 space-y-6">
                        <motion.div variants={itemVariants} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-sm p-10 backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-10 border-b border-[var(--glass-border)] pb-6">
                                <Layout size={18} className="text-[var(--color-primary)]" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-text-main)]">Tournament Phases</h3>
                            </div>
                            
                            <div className="space-y-4">
                                {ROUND_CONFIG.map((config, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-[var(--color-bg-card)]/40 border border-[var(--glass-border)] rounded-sm hover:border-[var(--color-primary)]/20 transition-all group">
                                        <div className="flex items-center gap-5">
                                            <span className="text-[10px] font-black w-10 h-10 rounded-full bg-[var(--color-bg-dark)]/10 flex items-center justify-center border border-[var(--glass-border)] group-hover:bg-[var(--color-primary)] group-hover:text-black transition-all">
                                                {String(config.round).padStart(2, '0')}
                                            </span>
                                            <div>
                                                <div className="text-[11px] font-black uppercase tracking-widest">{config.difficulty} MODE</div>
                                                <div className="text-[9px] text-[var(--color-text-muted)] font-mono flex items-center gap-2 mt-1.5 opacity-60">
                                                    <Timer size={10} /> {config.time} LIMIT
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[8px] font-black text-red-500/60 uppercase tracking-widest mb-1">Eliminate</div>
                                            <div className="text-sm font-bold text-[var(--color-text-main)]">{config.eliminate}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Action Section */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Join Card */}
                        <motion.div variants={itemVariants} className="premium-card p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-primary)]/10 transition-all"></div>
                            
                            <div className="flex items-center gap-3 mb-10">
                                <Play size={18} className="text-[var(--color-primary)]" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em]">Join Arena</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-3 block px-1 opacity-60">Room Passcode</label>
                                    <input 
                                        type="text" 
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        placeholder="CODE-####"
                                        className="w-full bg-[var(--color-bg-dark)] border border-[var(--glass-border)] px-5 py-5 text-sm font-mono tracking-[0.5em] focus:border-[var(--color-primary)]/50 focus:bg-white/[0.02] outline-none rounded-sm transition-all placeholder:opacity-10 text-[var(--color-text-main)]"
                                    />
                                </div>
                                <button 
                                    onClick={() => onJoin(joinCode)}
                                    disabled={isJoining || joinCode.length < 4}
                                    className="w-full py-5 bg-[var(--color-primary)] text-black text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white disabled:opacity-60 disabled:grayscale-0 transition-all rounded-sm shadow-[0_15px_40px_rgba(var(--color-primary-rgb),0.1)] active:scale-[0.98]"
                                >
                                    {isJoining ? "Connecting..." : "Enter Session"} <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Create Card */}
                        <motion.div variants={itemVariants} className="premium-card p-10 relative overflow-hidden group">
                           <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                            <div className="flex items-center gap-3 mb-8">
                                <Plus size={18} className="text-[var(--color-text-main)] opacity-60" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-text-main)]">Host Match</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <input 
                                    type="text" 
                                    value={tournamentName}
                                    onChange={(e) => setTournamentName(e.target.value)}
                                    placeholder="ARENA NAME"
                                    className="w-full bg-transparent border-b border-[var(--glass-border)] px-2 py-4 text-xs font-black uppercase tracking-[0.4em] focus:border-[var(--color-primary)] outline-none transition-all placeholder:text-[var(--color-text-muted)] placeholder:opacity-30 text-[var(--color-text-main)]"
                                />
                                <button 
                                    onClick={() => onCreate(tournamentName)}
                                    disabled={isCreating || !tournamentName}
                                    className="w-full py-5 border border-white/10 text-[var(--color-text-main)] opacity-60 hover:bg-white hover:text-black hover:opacity-100 disabled:opacity-20 text-[9px] font-black uppercase tracking-[0.4em] transition-all rounded-sm active:scale-[0.98]"
                                >
                                    {isCreating ? "Establishing..." : "Create New Session"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Footer Tag */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none w-full max-w-lg">
                <div className="flex items-center gap-5 justify-center">
                    <div className="h-[1px] flex-1 bg-white/20" />
                    <span className="text-[8px] font-black uppercase tracking-[1em] text-white whitespace-nowrap">ChallengX Survival Arena</span>
                    <div className="h-[1px] flex-1 bg-white/20" />
                </div>
            </div>
        </div>
    );
};

export default LobbyScreen;
