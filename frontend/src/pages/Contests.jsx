import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Users, ChevronRight, Activity, Calendar, Loader2, Shield } from "lucide-react";

export default function Contests() {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL"); // ALL, LIVE, UPCOMING, ARCHIVED

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const res = await axiosInstance.get("/contest/list");
                setContests(res.data.contests || []);
            } catch (err) {
                console.error("Failed to load contests", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContests();
    }, []);

    const ContestCard = ({ contest }) => {
        const isLive = contest.status === "ACTIVE";
        const isPast = contest.status === "FINISHED";
        
        return (
            <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="group relative bg-white/[0.03] border border-white/10 hover:border-[var(--color-primary)]/40 transition-all duration-300 overflow-hidden"
                style={{ borderRadius: "8px" }}
            >
                {/* Status Bar */}
                <div className={`h-1 w-full ${isLive ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : isPast ? 'bg-slate-700' : 'bg-emerald-500'}`} />
                
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${isLive ? 'text-red-500' : isPast ? 'text-[var(--color-text-muted)]' : 'text-emerald-500'}`}>
                            {contest.status} {isLive && "• LIVE NOW"}
                        </div>
                        <Trophy size={18} className="text-slate-700 group-hover:text-[var(--color-primary)] transition-colors" />
                    </div>

                    <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                        {contest.title}
                    </h3>
                    
                    <p className="text-[var(--color-text-muted)] text-sm mb-8 line-clamp-2">
                        {contest.description || "Join this challenge to test your skills and earn rank points."}
                    </p>

                    <div className="flex gap-6 mb-8 text-xs text-[var(--color-text-muted)]">
                        <div className="flex items-center gap-2">
                            <Users size={14} />
                            <span>{contest._count?.participants || 0} Joined</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>120 Mins</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--color-text-muted)]">Starts At</span>
                            <span className="text-[var(--color-text-main)] font-medium">{new Date(contest.startTime).toLocaleDateString()}</span>
                        </div>
                        
                        <button
                            onClick={() => navigate(`/contests/${contest.id}`)}
                            className={`w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${isLive ? 'bg-[var(--color-primary)] text-black' : 'bg-white/5 text-[var(--color-text-main)] hover:bg-white/10'}`}
                            style={{ borderRadius: "4px" }}
                        >
                            {isLive ? "Join Arena" : "View Details"}
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    const filteredContests = contests.filter(c => {
        if (filter === "ALL") return true;
        if (filter === "LIVE") return c.status === "ACTIVE";
        if (filter === "UPCOMING") return c.status === "UPCOMING";
        if (filter === "ARCHIVED") return c.status === "FINISHED";
        return true;
    });

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-8 border-b border-white/5">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text-main)] uppercase tracking-tight mb-4">
                            Contests
                        </h1>
                        <p className="text-[var(--color-text-muted)] text-sm max-w-lg">
                            Join scheduled coding challenges, compete with others, and improve your ranking.
                        </p>
                    </div>

                    <div className="flex items-center bg-white/5 p-1 rounded-lg">
                        {["ALL", "LIVE", "UPCOMING", "ARCHIVED"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${filter === f ? 'bg-[var(--color-primary)] text-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
                        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest">Loading...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredContests.length > 0 ? (
                                filteredContests.map((c) => (
                                    <ContestCard key={c.id} contest={c} />
                                ))
                            ) : (
                                <div className="col-span-full py-32 text-center border border-white/5 bg-white/[0.01] rounded-xl text-[var(--color-text-muted)]">
                                    <Shield size={48} className="mx-auto mb-6 opacity-20" />
                                    <p className="text-sm uppercase tracking-[0.2em]">No contests found</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
