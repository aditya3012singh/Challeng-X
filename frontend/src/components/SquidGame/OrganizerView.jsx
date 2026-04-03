import { useState } from "react";
import CodeEditor from "../CodeEditor";
import { LANGUAGES } from "./SquidGameConfig";
import { motion, AnimatePresence } from "framer-motion";
import ShareModal from "../common/ShareModal";
import { 
    Activity, Shield, Users, Timer, 
    X, Eye, Zap, 
    Layout, BarChart3, Code2, Play
} from "lucide-react";

const OrganizerView = ({ tournament, roundInfo, timeLeft, leaderboard, playerStreams, onEndRound, onDisqualify }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
    };

    const roundNum = tournament?.currentRound || roundInfo?.roundNumber || 1;
    const currentRoundData = tournament?.roundProblems?.find(r => r.roundNumber === roundNum);
    const problem = currentRoundData?.problem || roundInfo?.problem;

    const selectedPlayer = tournament?.participants?.find(p => p.userId === selectedPlayerId);
    const selectedStream = playerStreams[selectedPlayerId];

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--color-bg-dark)] flex flex-col overflow-hidden font-sans">
            {/* Clean Header */}
            <header className="h-20 bg-[var(--color-bg-card)] border-b border-[var(--glass-border)] px-8 flex items-center justify-between z-20">
                <div className="flex items-center gap-10">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1 opacity-40">
                            <Shield size={12} className="text-[var(--color-primary)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Host Dashboard</span>
                        </div>
                        <h1 className="text-xl font-black text-[var(--color-text-main)] truncate max-w-[300px] tracking-tight">
                            {tournament?.name}
                        </h1>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <div className={`flex items-center gap-3 px-6 py-2 rounded-sm border border-[var(--glass-border)] bg-black/20 ${timeLeft < 60 ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                        <Timer size={16} className={timeLeft < 60 ? "text-red-500 animate-pulse" : "text-white/20"} />
                        <span className={`text-3xl font-mono font-black tabular-nums tracking-tighter ${timeLeft < 60 ? 'text-red-500' : 'text-[var(--color-text-main)]'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <div className="w-32 h-1 bg-[var(--glass-border)] rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: "100%" }}
                            animate={{ width: `${(timeLeft / 600) * 100}%` }}
                            className={`h-full ${timeLeft < 60 ? 'bg-red-500' : 'bg-[var(--color-primary)]'}`}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Participants</span>
                        <span className="text-xs font-black text-[var(--color-text-main)]">
                           {tournament?.participants?.filter(p => p.status === "ACTIVE").length} ACTIVE / {tournament?.participants?.length} TOTAL
                        </span>
                    </div>
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="px-4 py-3 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                        Share
                    </button>
                    <button
                        onClick={onEndRound}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-2"
                    >
                        <Zap size={14} fill="currentColor" /> Finish Round
                    </button>
                </div>
            </header>

            <div className="flex-1 flex min-h-0">
                {/* Left: Participant Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-black/10">
                    <div className="flex items-center justify-between mb-8 opacity-30">
                        <div className="flex items-center gap-2">
                            <Users size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Player Status Monitor</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                        {tournament?.participants?.map((p, i) => {
                            const lbEntry = Array.isArray(leaderboard) ? leaderboard.find(l => l.userId === p.userId) : null;
                            const isSelected = selectedPlayerId === p.userId;
                            const isEliminated = p.status !== "ACTIVE";
                            
                            return (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => setSelectedPlayerId(p.userId)}
                                    className={`relative p-4 border rounded-sm transition-all cursor-pointer ${
                                        isEliminated 
                                        ? 'border-red-900/10 bg-red-900/[0.02] opacity-40' 
                                        : isSelected 
                                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                                          : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[9px] font-bold text-white/10">#{String(i + 1).padStart(2, '0')}</span>
                                        {!isEliminated && playerStreams[p.userId] && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
                                        )}
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <div className={`text-xs font-black uppercase truncate ${isEliminated ? 'text-red-900/50 line-through' : 'text-white/80'}`}>
                                            {p.user?.username}
                                        </div>
                                        <div className="text-[10px] font-mono text-white/20">
                                            {lbEntry?.score || 0} PTS
                                        </div>
                                    </div>

                                    {!isEliminated && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDisqualify(p.userId); }}
                                            className="absolute top-1 right-1 p-1 text-red-500/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X size={10} />
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Code Monitor */}
                <div className="w-[45%] border-l border-[var(--glass-border)] flex flex-col bg-[#0a0a0a]">
                    {selectedPlayer ? (
                        <div className="flex-1 flex flex-col">
                            <div className="p-6 border-b border-[var(--glass-border)] flex justify-between items-center bg-black/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-sm font-black">
                                        {selectedPlayer.user?.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Monitoring Subject</div>
                                        <div className="text-sm font-black text-white/80 uppercase">{selectedPlayer.user?.username}</div>
                                    </div>
                                </div>
                                {playerStreams[selectedPlayerId] && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Live Link</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 overflow-hidden">
                                {selectedStream ? (
                                    <CodeEditor
                                        language={LANGUAGES[selectedStream.language]?.monaco || "java"}
                                        value={selectedStream.code}
                                        readOnly={true}
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                                        <Code2 size={40} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">No Stream Data Available</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 opacity-20 text-center space-y-4">
                            <Eye size={48} />
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-widest">Select a Player</p>
                                <p className="text-[10px] font-mono leading-relaxed max-w-[200px]">Choose a subject from the grid to observe their code stream in real-time.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="h-10 bg-[var(--color-bg-card)] border-t border-[var(--glass-border)] px-8 flex items-center justify-between opacity-30">
                <div className="flex items-center gap-3">
                    <BarChart3 size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Tournament Monitor System</span>
                </div>
                <div className="text-[9px] font-mono">
                    ChallengX Host Control v1.0
                </div>
            </footer>
            {/* SHARE MODAL */}
            <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                link={`${window.location.origin}/squid-game/join/${tournament?.joinCode}`}
                title="RECRUIT SURVIVORS"
                message={`The games are starting! Help me host this Squid Game tournament on ChallengX. Code: ${tournament?.joinCode}`}
            />
        </div>
    );
};

export default OrganizerView;
