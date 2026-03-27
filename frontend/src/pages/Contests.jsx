import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axios";

export default function Contests() {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const activeContests = contests.filter((c) => c.status === "ACTIVE");
    const upcomingContests = contests.filter((c) => c.status === "UPCOMING");
    const pastContests = contests.filter((c) => c.status === "FINISHED");

    const ContestCard = ({ contest }) => (
        <div key={contest.id} className="group bg-[#0a0a0a] border border-white/5 hover:border-[var(--color-primary)]/30 transition-all duration-300 p-6 relative flex flex-col" style={{ borderRadius: "2px" }}>
            {contest.status === "ACTIVE" && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-red-500 text-[9px] font-bold uppercase tracking-widest">Live Now</span>
                </div>
            )}
            {contest.status === "FINISHED" && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">Ended</span>
                </div>
            )}

            <div className="mb-6 mt-4">
                <h3 className="text-white font-black text-xl uppercase tracking-tighter truncate">
                    {contest.title}
                </h3>
                <p className="text-gray-500 text-xs mt-2 line-clamp-2">{contest.description}</p>
            </div>

            <div className="flex flex-col gap-2 mt-auto text-xs text-gray-400 font-mono tracking-tight mb-6">
                <div className="flex justify-between">
                    <span>Starts:</span>
                    <span className="text-white">{new Date(contest.startTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Ends:</span>
                    <span className="text-white">{new Date(contest.endTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-white/5">
                    <span>Participants:</span>
                    <span className="text-[var(--color-primary)] font-bold">{contest._count?.participants || 0}</span>
                </div>
            </div>

            <button
                onClick={() => navigate(`/contests/${contest.id}`)}
                className="w-full mt-auto px-5 py-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-black transition-all border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]"
                style={{ borderRadius: "2px" }}
            >
                {contest.status === "ACTIVE" ? "Enter Arena" : "View Details"}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] pt-28 px-8 pb-16">
            <div className="max-w-6xl mx-auto mb-12">
                <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-2">
                    Global Challenges
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-[family:var(--font-heading)]">
                    Contests
                </h1>
                <p className="text-slate-500 text-sm mt-2">Compete under pressure against the community.</p>
            </div>

            <div className="max-w-6xl mx-auto space-y-16">
                {loading ? (
                    <div className="text-center py-20 text-[var(--color-primary)] animate-pulse uppercase font-mono text-sm tracking-widest">Loading arenas...</div>
                ) : (
                    <>
                        {activeContests.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    Active Contests
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeContests.map((c) => <ContestCard key={c.id} contest={c} />)}
                                </div>
                            </section>
                        )}

                        {upcomingContests.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-6">Upcoming Contests</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {upcomingContests.map((c) => <ContestCard key={c.id} contest={c} />)}
                                </div>
                            </section>
                        )}

                        {pastContests.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-gray-600 uppercase tracking-widest mb-6">Past Contests</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                                    {pastContests.map((c) => <ContestCard key={c.id} contest={c} />)}
                                </div>
                            </section>
                        )}

                        {contests.length === 0 && !loading && (
                            <div className="text-center py-32 border border-white/5 bg-[#0a0a0a]" style={{ borderRadius: "2px" }}>
                                <div className="text-gray-700 text-6xl mb-6">🏆</div>
                                <h2 className="text-xl font-bold text-gray-600 uppercase tracking-wider mb-2">No Contests Available</h2>
                                <p className="text-gray-700 text-sm">Admins haven't scheduled any contests yet.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
