import { motion, AnimatePresence } from "framer-motion";
import { Users, Timer, Shield, Zap, ChevronRight, Copy, Check, Info } from "lucide-react";
import { useState } from "react";
import ShareModal from "../common/ShareModal";

const WaitingRoom = ({ tournament, onStart, isHost }) => {
    const [copied, setCopied] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const participants = tournament?.participants || [];
    const maxPlayers = tournament?.maxPlayers || 50;
    const isPastMinimum = participants.length >= 2;

    const handleCopy = () => {
        navigator.clipboard.writeText(tournament?.joinCode || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-8 overflow-hidden font-sans">
            {/* Elegant Background */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ 
                backgroundImage: 'radial-gradient(var(--glass-border) 1px, transparent 1px)', 
                backgroundSize: '30px 30px' 
            }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--color-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-5xl"
            >
                {/* Header Information */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
                    <div className="text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[var(--color-text-muted)] text-[8px] font-black uppercase tracking-widest mb-6">
                           <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" /> Finalizing Participants
                        </div>
                        <h2 className="text-6xl font-black text-[var(--color-text-main)] tracking-tight uppercase leading-none mb-4">
                            {tournament?.name}
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                                <Users size={14} className="text-[var(--color-primary)]/40" />
                                <span className="text-[11px] font-black uppercase tracking-wider">{participants.length} Joined</span>
                            </div>
                            <div className="w-[1px] h-3 bg-white/10" />
                            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                                <Timer size={14} className="text-white/20" />
                                <span className="text-[11px] font-black uppercase tracking-wider">Tournament Mode</span>
                            </div>
                        </div>
                    </div>

                    {/* Join Code Card */}
                    <div className="flex flex-col gap-4 min-w-[280px]">
                        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-6 rounded-sm shadow-2xl backdrop-blur-md">
                            <div className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.3em] mb-3 opacity-40">Session Code</div>
                            <div className="flex items-center justify-between gap-6">
                                <span className="text-3xl font-black font-mono text-[var(--color-text-main)] tracking-[0.2em]">
                                    {tournament?.joinCode}
                                </span>
                                <button 
                                    onClick={handleCopy}
                                    className="p-2.5 rounded-sm bg-black/40 border border-white/10 hover:border-[var(--color-primary)]/40 transition-all text-white/30 hover:text-[var(--color-primary)]"
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsShareModalOpen(true)}
                            className="w-full py-3 bg-white/5 border border-white/10 text-[var(--color-text-main)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-black transition-all"
                            style={{ borderRadius: "2px" }}
                        >
                            Invite Survivors
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Participant Grid */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)] opacity-50">Tournament Roster</span>
                            <span className="text-[10px] font-mono text-[var(--color-text-muted)] opacity-30">{maxPlayers} Slots Available</span>
                        </div>
                        
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 min-h-[300px]">
                            <AnimatePresence>
                                {participants.map((p, i) => (
                                    <motion.div 
                                        key={p.id || i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="relative aspect-square bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-sm flex flex-col items-center justify-center p-4 group hover:border-[var(--color-primary)]/30 transition-all shadow-sm"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-sm font-black group-hover:text-[var(--color-primary)] group-hover:border-[var(--color-primary)]/20 transition-all">
                                            {(p.user?.username || `P`).charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-tight truncate w-full text-center mt-3 group-hover:text-[var(--color-text-main)] transition-colors">
                                            {p.user?.username}
                                        </div>
                                        {String(p.userId) === String(tournament.hostId) && (
                                            <div className="absolute top-2 right-2">
                                                <Zap size={8} className="text-[var(--color-primary)]" fill="currentColor" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {Array.from({ length: Math.max(0, 16 - participants.length) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square bg-white/[0.02] border border-dashed border-white/5 rounded-sm flex items-center justify-center opacity-20">
                                       <Users size={12} className="text-white/20" />
                                    </div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Action Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-sm p-8 h-full flex flex-col backdrop-blur-md">
                            <div className="flex-1 space-y-10">
                                <div className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.3em] border-b border-white/5 pb-5">Tournament Control</div>
                                
                                {isHost ? (
                                    <div className="space-y-8">
                                        <div className="space-y-4 px-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Readiness Status</span>
                                                <span className="text-[10px] font-mono text-[var(--color-primary)]">{(participants.length / 2 * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(participants.length / 2 * 100, 100)}%` }}
                                                    className="h-full bg-[var(--color-primary)]"
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            onClick={onStart}
                                            disabled={!isPastMinimum}
                                            className="w-full py-5 bg-[var(--color-primary)] text-black text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 disabled:opacity-20 rounded-sm shadow-[0_15px_40px_rgba(var(--color-primary-rgb),0.2)]"
                                        >
                                            Start Match <ChevronRight size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                                        <div className="w-12 h-12 border-2 border-white/10 border-t-[var(--color-primary)] rounded-full animate-spin" />
                                        <div className="text-center">
                                            <div className="text-[10px] text-[var(--color-text-main)] font-black uppercase tracking-[0.4em] mb-2">Awaiting Start</div>
                                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Waiting for host command...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="pt-6 border-t border-white/5 mt-10">
                                <div className="flex items-center gap-2 text-white/10">
                                   <Info size={10} />
                                   <span className="text-[8px] font-black uppercase tracking-widest leading-tight">Secure Session Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
            <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                link={`${window.location.origin}/squid-game/join/${tournament?.joinCode}`}
                title="RECRUIT SURVIVORS"
                message={`The games are starting! Join my Squid Game tournament on ChallengX. Code: ${tournament?.joinCode}`}
            />
        </div>
    );
};

export default WaitingRoom;
