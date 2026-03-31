import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../lib/axios";
import { getSocket } from "../../lib/socket";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronLeft, Calendar, Clock, Users, Trophy, 
    Target, Activity, Shield, Check, AlertCircle, Loader2 
} from "lucide-react";

export default function ContestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    
    const [contest, setContest] = useState(null);
    const [problems, setProblems] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState("overview"); // overview, problems, leaderboard
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await axiosInstance.get(`/contest/${id}`);
                const c = res.data.contest;
                setContest(c);

                if (c.status !== "UPCOMING" || (user && user.role === "ADMIN")) {
                    const [probRes, leadRes] = await Promise.all([
                        axiosInstance.get(`/contest/${id}/problems`),
                        axiosInstance.get(`/contest/${id}/leaderboard`)
                    ]);
                    setProblems(probRes.data.problems || []);
                    setLeaderboard(leadRes.data.leaderboard || []);
                    if (c.status === "ACTIVE") setActiveTab("problems");
                }
            } catch (err) {
                console.error("Failed to load contest detail", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id, user]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        
        socket.emit("join_room", `contest-${id}`);

        const reloadLeaderboard = async () => {
            try {
                const leadRes = await axiosInstance.get(`/contest/${id}/leaderboard`);
                setLeaderboard(leadRes.data.leaderboard || []);
            } catch (err) { console.error(err); }
        };

        const onSubmission = (data) => {
            if (data.contestId === id && data.type === 'SUBMIT') {
                reloadLeaderboard();
            }
        };

        const onContestStarted = (data) => {
            if (data.contestId === id) window.location.reload();
        };

        const onContestEnded = (data) => {
            if (data.contestId === id) window.location.reload();
        };

        socket.on("submission_result", onSubmission);
        socket.on("contest_started", onContestStarted);
        socket.on("contest_ended", onContestEnded);

        return () => {
            socket.emit("leave_room", `contest-${id}`);
            socket.off("submission_result", onSubmission);
            socket.off("contest_started", onContestStarted);
            socket.off("contest_ended", onContestEnded);
        };
    }, [id]);

    const handleRegister = async () => {
        setSubmitting(true);
        try {
            await axiosInstance.post(`/contest/${id}/register`);
            toast.success("Deployment Successful! You are now synchronized with the contest.");
            setShowRegisterModal(false);
            // Optimistically reload contest data to show problems if ACTIVE
            const res = await axiosInstance.get(`/contest/${id}`);
            setContest(res.data.contest);
            const [probRes, leadRes] = await Promise.all([
                axiosInstance.get(`/contest/${id}/problems`),
                axiosInstance.get(`/contest/${id}/leaderboard`)
            ]);
            setProblems(probRes.data.problems || []);
            setLeaderboard(leadRes.data.leaderboard || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to register");
            setShowRegisterModal(false);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] flex flex-col items-center justify-center gap-6">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
            <div className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.6em] animate-pulse">Establishing Secure Uplink...</div>
        </div>
    );

    if (!contest) return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] flex flex-col items-center justify-center text-red-500 font-mono tracking-widest uppercase gap-4">
            <AlertCircle size={48} />
            Sector Not Found
        </div>
    );

    const isRegistered = leaderboard.some(p => p.userId === user?.id);

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] pt-32 px-6 md:px-12 pb-24 h-screen overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16 pb-16 border-b border-white/5">
                    <div className="flex-1">
                        <motion.button 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => navigate("/contests")} 
                            className="text-[var(--color-text-muted)] text-[10px] hover:text-[var(--color-primary)] uppercase tracking-[0.3em] font-black mb-10 flex items-center gap-2 group transition-all"
                        >
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Sector Archives
                        </motion.button>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] border ${contest.status === 'ACTIVE' ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-[var(--color-text-muted)]'}`} style={{ borderRadius: "1px" }}>
                                    {contest.status} Protocol
                                </span>
                                <div className="h-px w-12 bg-white/10" />
                                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-mono">ID: {id.slice(0, 8)}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-[var(--color-text-main)] uppercase tracking-tighter leading-[0.9]">
                                {contest.title}
                            </h1>
                        </motion.div>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-end gap-6 bg-white/[0.02] border border-white/5 p-8 backdrop-blur-sm self-stretch justify-center"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="space-y-4 text-right">
                            <div className="space-y-1">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Sync Commencement</span>
                                <div className="flex items-center justify-end gap-3 text-sm font-black text-[var(--color-text-main)] font-mono">
                                    <Calendar size={14} className="text-[var(--color-text-muted)]" />
                                    {new Date(contest.startTime).toLocaleDateString()} @ {new Date(contest.startTime).toLocaleTimeString()}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Sync Termination</span>
                                <div className="flex items-center justify-end gap-3 text-sm font-black text-[var(--color-text-main)] font-mono">
                                    <Clock size={14} className="text-[var(--color-text-muted)]" />
                                    {new Date(contest.endTime).toLocaleDateString()} @ {new Date(contest.endTime).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/5 w-full flex justify-end gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Units</span>
                                <span className="text-sm font-black text-[var(--color-primary)] font-mono">{contest._count?.participants || 0}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Registration Modal Overlay */}
                {contest.status === "UPCOMING" && !isRegistered && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative p-10 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 mb-16 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 group"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-primary)] shadow-[0_0_20px_var(--color-primary)] opacity-50" />
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-primary)]/10 blur-[100px]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 text-[var(--color-primary)] font-black uppercase tracking-[0.4em] mb-4">
                                <Activity size={18} />
                                Neural Sync Required
                            </div>
                            <h3 className="text-3xl font-black text-[var(--color-text-main)] uppercase tracking-tighter mb-2">Initialize Deployment</h3>
                            <p className="text-[var(--color-text-muted)] text-xs font-mono max-w-lg leading-relaxed uppercase">Secure your position in the challenge matrix. All protocols will be synchronized upon deployment commencement.</p>
                        </div>
                        
                        <button 
                            onClick={() => setShowRegisterModal(true)}
                            className="relative z-10 px-12 py-5 bg-[var(--color-primary)] text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)]"
                            style={{ borderRadius: "2px" }}
                        >
                            Establish Uplink
                        </button>
                    </motion.div>
                )}
                
                {isRegistered && contest.status === "UPCOMING" && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 bg-emerald-500/10 border border-emerald-500/20 mb-16 flex items-center gap-4 text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] justify-center"
                    >
                        <Check size={18} />
                        Uplink Synchronized. Stand by for Mission Objectives.
                    </motion.div>
                )}

                {/* Content Tabs */}
                {/* Tab Window */}
                <div className="flex gap-12 border-b border-white/5 mb-16">
                    {[
                        { id: 'overview', label: 'Briefing', icon: <Target size={14} /> },
                        // Hide Objectives tab if upcoming and user is not admin
                        ...((contest.status !== 'UPCOMING' || user?.role === 'ADMIN') ? [{ id: 'problems', label: 'Objectives', icon: <Shield size={14} /> }] : []),
                        { id: 'leaderboard', label: 'Rankings', icon: <Trophy size={14} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative
                                ${activeTab === tab.id ? 'text-[var(--color-primary)]' : 'text-slate-600 hover:text-[var(--color-text-main)]'}`}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"
                                />
                            )}
                        </button>
                    ))}
                </div>
                <div className="min-h-[600px] mb-20 relative">
                    <AnimatePresence mode="wait">
                        {activeTab === "overview" && (
                            <motion.div 
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-12"
                            >
                                <div className="grid md:grid-cols-3 gap-12">
                                    <div className="md:col-span-2 space-y-8">
                                        <div className="space-y-4">
                                            <h2 className="text-[10px] font-black text-[var(--color-text-main)] uppercase tracking-[0.3em] flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 bg-[var(--color-primary)]" />
                                                Mission Parameter Details
                                            </h2>
                                            <p className="text-[var(--color-text-muted)] text-sm leading-[1.8] font-mono whitespace-pre-wrap bg-white/[0.01] border border-white/5 p-8">
                                                {contest.description || "No briefing assets available for this sector."}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-8">
                                        <div className="p-8 bg-white/[0.02] border border-white/5 space-y-6">
                                            <h2 className="text-[10px] font-black text-[var(--color-text-main)] uppercase tracking-[0.3em]">Engagement Rules</h2>
                                            <ul className="space-y-4">
                                                {[
                                                    "Fixed temporal window for submission sync.",
                                                    "Hidden test criteria for final validation.",
                                                    "Penalty accumulation for invalid transmissions.",
                                                    "Global sector-wide leaderboard broadcast."
                                                ].map((rule, i) => (
                                                    <li key={i} className="flex gap-3 text-[10px] font-mono text-[var(--color-text-muted)] leading-relaxed uppercase">
                                                        <span className="text-[var(--color-primary)]">0{i+1}</span>
                                                        {rule}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "problems" && (
                            <motion.div 
                                key="problems"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {contest.status === "UPCOMING" && user?.role !== "ADMIN" ? (
                                    <div className="flex flex-col items-center justify-center py-40 border border-white/5 border-dashed">
                                        <Shield size={48} className="text-slate-800 mb-6" />
                                        <p className="text-slate-600 tracking-[0.4em] uppercase text-[10px] font-black">Objectives are Encrypted</p>
                                        <p className="text-slate-700 text-[9px] font-mono mt-2 uppercase tracking-widest">Protocol status: Awaiting synchronization commencement</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {problems.map((cp, idx) => (
                                            <motion.div 
                                                whileHover={{ x: 10 }}
                                                key={cp.id} 
                                                className="group flex items-center justify-between p-8 bg-[var(--color-bg-card)] border border-white/5 hover:border-[var(--color-primary)]/30 transition-all"
                                                style={{ borderRadius: "2px" }}
                                            >
                                                <div className="flex items-center gap-10">
                                                    <div className="text-5xl font-black text-[var(--color-text-main)]/5 font-mono w-16 group-hover:text-[var(--color-primary)]/10 transition-colors">{String.fromCharCode(65 + idx)}</div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-[var(--color-text-main)] uppercase tracking-tighter group-hover:text-[var(--color-primary)] transition-colors mb-2">{cp.problem.title}</h3>
                                                        <div className="flex gap-6 font-mono text-[9px] uppercase tracking-[0.2em]">
                                                            <span className={cp.problem.difficulty === "HARD" ? "text-red-500" : cp.problem.difficulty === "MEDIUM" ? "text-yellow-500" : "text-emerald-500"}>
                                                                {cp.problem.difficulty} PRIORITY
                                                            </span>
                                                            <span className="text-slate-600">{cp.points} POINTS AVAILABLE</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {contest.status === "ACTIVE" && isRegistered && (
                                                    <button 
                                                        onClick={() => navigate(`/contest/${contest.id}/arena/${cp.problem.id}`)}
                                                        className="px-10 py-3 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-[10px] uppercase tracking-[0.3em] hover:bg-[var(--color-primary)] hover:text-black font-black transition-all"
                                                        style={{ borderRadius: "2px" }}
                                                    >
                                                        Initialize Sync
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "leaderboard" && (
                            <motion.div 
                                key="leaderboard"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-[var(--color-bg-card)] border border-white/5"
                                style={{ borderRadius: "2px" }}
                            >
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.01]">
                                            <th className="py-8 px-10 text-[9px] font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)]">Rank</th>
                                            <th className="py-8 px-10 text-[9px] font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)]">Practitioner</th>
                                            <th className="py-8 px-10 text-[9px] font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)] text-center">Efficiency</th>
                                            <th className="py-8 px-10 text-[9px] font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)] text-right">Penalty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-mono">
                                        {leaderboard.length === 0 ? (
                                            <tr><td colSpan="4" className="text-center py-40 text-slate-700 text-[10px] uppercase tracking-[0.4em] font-black">No Scoring Data Synthesized</td></tr>
                                        ) : (
                                            leaderboard.map((participant, index) => (
                                                <tr key={participant.id} className={`border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors ${participant.userId === user?.id ? 'bg-[var(--color-primary)]/5' : ''}`}>
                                                    <td className="py-8 px-10">
                                                        <span className={`text-xl font-black ${index < 3 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                                                            {String(index + 1).padStart(2, '0')}
                                                        </span>
                                                    </td>
                                                    <td className="py-8 px-10">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-black text-[var(--color-text-main)]">
                                                                {participant.user.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-[var(--color-text-main)] hover:text-[var(--color-primary)] transition-colors cursor-pointer">{participant.user.username}</span>
                                                                {participant.userId === user?.id && <span className="text-[var(--color-primary)] text-[8px] font-black uppercase tracking-widest mt-1">Identified (YOU)</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-8 px-10 text-center">
                                                        <span className="text-emerald-400 font-black tracking-widest text-lg">{participant.score}</span>
                                                    </td>
                                                    <td className="py-8 px-10 text-right">
                                                        <span className="text-red-500/60 font-black tracking-widest text-sm">+{Math.floor(participant.penaltyMs / 60000)}M</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            <AnimatePresence>
                {showRegisterModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRegisterModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-[var(--color-bg-card)] border border-white/10 p-10 shadow-[0_0_100px_rgba(0,0,0,1)]"
                            style={{ borderRadius: "2px" }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent" />
                            
                            <h2 className="text-2xl font-black text-[var(--color-text-main)] uppercase tracking-tighter mb-4 flex items-center gap-3">
                                <Shield className="text-[var(--color-primary)]" />
                                Protocol Confirmation
                            </h2>
                            <p className="text-[var(--color-text-muted)] text-sm font-mono leading-relaxed mb-10 uppercase">
                                You are about to synchronize with the {contest.title} challenge matrix. This action will commit your unit to the sector leaderboard. Do you wish to proceed?
                            </p>
                            
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowRegisterModal(false)}
                                    className="flex-1 py-4 border border-white/10 text-[var(--color-text-muted)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/5 hover:text-[var(--color-text-main)] transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleRegister}
                                    disabled={submitting}
                                    className="flex-1 py-4 bg-[var(--color-primary)] text-black font-black text-[10px] uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.2)] flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={14} /> : "Initiate Sync"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
