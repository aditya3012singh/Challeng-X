import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../lib/axios";
import { getSocket } from "../../lib/socket";

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
            // Optimistically reload
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to register");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[var(--color-primary)] font-mono tracking-widest uppercase">Loading Contest Details...</div>;
    if (!contest) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-mono tracking-widest uppercase">Contest Not Found</div>;

    const isRegistered = leaderboard.some(p => p.userId === user?.id);

    return (
        <div className="min-h-screen bg-[#050505] pt-28 px-8 pb-16">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <button onClick={() => navigate("/contests")} className="text-gray-500 text-xs hover:text-white uppercase tracking-widest font-mono mb-4 flex items-center gap-2 transition-colors">
                            ← Back to Contests
                        </button>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-[family:var(--font-heading)]">
                            {contest.title}
                        </h1>
                    </div>
                    
                    <div className="flex flex-col text-right font-mono text-xs uppercase tracking-widest text-gray-500">
                        <span className={`font-bold text-lg ${contest.status === 'ACTIVE' ? 'text-red-500 animate-pulse' : 'text-white'}`}>{contest.status}</span>
                        <span className="mt-1">Starts: <span className="text-white">{new Date(contest.startTime).toLocaleString()}</span></span>
                        <span>Ends: <span className="text-white">{new Date(contest.endTime).toLocaleString()}</span></span>
                    </div>
                </div>

                {/* Registration Banner */}
                {contest.status === "UPCOMING" && !isRegistered && (
                    <div className="p-6 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 mb-8 flex justify-between items-center" style={{ borderRadius: "2px" }}>
                        <div>
                            <h3 className="text-[var(--color-primary)] font-bold uppercase tracking-widest text-sm mb-1">Registration Open</h3>
                            <p className="text-gray-400 text-xs font-mono">Join early to secure your spot on the leaderboard.</p>
                        </div>
                        <button 
                            onClick={handleRegister} 
                            disabled={submitting}
                            className="px-8 py-3 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                            style={{ borderRadius: "2px" }}
                        >
                            {submitting ? "Registering..." : "Register Now"}
                        </button>
                    </div>
                )}
                
                {isRegistered && contest.status === "UPCOMING" && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 mb-8 text-green-400 font-mono text-xs uppercase tracking-widest text-center" style={{ borderRadius: "2px" }}>
                        ✅ You are registered. The problems will unlock when the contest starts.
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-8 border-b border-white/10 mb-8 mt-12">
                    {['overview', 'problems', 'leaderboard'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all 
                                ${activeTab === tab ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-600 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Contents */}
                <div className="min-h-[400px]">
                    {activeTab === "overview" && (
                        <div className="p-8 bg-[#0a0a0a] border border-white/5" style={{ borderRadius: "2px" }}>
                            <h2 className="text-white font-bold uppercase tracking-wider mb-4">Description</h2>
                            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{contest.description}</p>
                            
                            <hr className="border-white/5 my-8" />
                            
                            <h2 className="text-white font-bold uppercase tracking-wider mb-4">Rules & Scoring</h2>
                            <ul className="list-disc list-inside text-gray-400 text-sm leading-relaxed space-y-2">
                                <li>The contest strictly runs between the indicated start and end times.</li>
                                <li>You must register to appear on the leaderboard.</li>
                                <li>Solutions are graded against hidden test cases.</li>
                                <li>A 10-minute penalty is added for every failed submission on a problem you eventually solve.</li>
                            </ul>
                        </div>
                    )}

                    {activeTab === "problems" && (
                        <div>
                            {contest.status === "UPCOMING" && user?.role !== "ADMIN" ? (
                                <div className="text-center py-20 border border-white/5 border-dashed">
                                    <p className="text-gray-600 tracking-widest uppercase text-xs">Problems are heavily encrypted until the contest begins.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {problems.map((cp, idx) => (
                                        <div key={cp.id} className="flex items-center justify-between p-6 bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all group" style={{ borderRadius: "2px" }}>
                                            <div className="flex items-center gap-6">
                                                <div className="text-2xl font-black text-gray-700 w-8">{String.fromCharCode(65 + idx)}</div>
                                                <div>
                                                    <h3 className="text-white font-bold uppercase tracking-wide group-hover:text-[var(--color-primary)] transition-colors">{cp.problem.title}</h3>
                                                    <div className="flex gap-4 mt-2 font-mono text-[9px] uppercase tracking-widest text-gray-500">
                                                        <span className={cp.problem.difficulty === "HARD" ? "text-red-400" : cp.problem.difficulty === "MEDIUM" ? "text-yellow-400" : "text-green-400"}>{cp.problem.difficulty}</span>
                                                        <span>{cp.points} Points</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {contest.status === "ACTIVE" && isRegistered && (
                                                <button 
                                                    onClick={() => navigate(`/contest/${contest.id}/arena/${cp.problem.id}`)}
                                                    className="px-6 py-2 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-[10px] uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-black font-bold transition-all"
                                                >
                                                    Solve
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {problems.length === 0 && <p className="text-gray-600 text-center py-10 font-mono text-xs uppercase">No problems assigned yet.</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "leaderboard" && (
                        <div className="bg-[#0a0a0a] border border-white/5 overflow-hidden" style={{ borderRadius: "2px" }}>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.01]">
                                        <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Rank</th>
                                        <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Player</th>
                                        <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 text-center">Score</th>
                                        <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 text-right">Penalty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-20 text-gray-600 text-xs font-mono uppercase tracking-widest">No participants scored yet.</td></tr>
                                    ) : (
                                        leaderboard.map((participant, index) => (
                                            <tr key={participant.id} className={`border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors ${participant.userId === user?.id ? 'bg-[var(--color-primary)]/5' : ''}`}>
                                                <td className="py-6 px-8 text-lg font-black font-mono tracking-tighter text-slate-400">{index + 1}</td>
                                                <td className="py-6 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                                                            {participant.user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-white font-bold tracking-tight">{participant.user.username} {participant.userId === user?.id && <span className="text-[var(--color-primary)] text-[9px] ml-2">(YOU)</span>}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-8 text-center text-emerald-500 font-bold font-mono tracking-widest">
                                                    {participant.score}
                                                </td>
                                                <td className="py-6 px-8 text-right text-red-400 font-mono tracking-widest">
                                                    +{Math.floor(participant.penaltyMs / 60000)}m
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
