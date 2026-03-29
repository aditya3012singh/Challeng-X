import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllProblems } from "../../store/api/problem.thunk";
import { Trophy, Zap, ChevronRight, Activity, Terminal } from 'lucide-react';

export const Problem = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        problems = [],
        loading = false,
        error = null,
    } = useSelector((state) => state.problem);

    useEffect(() => {
        dispatch(getAllProblems());
    }, [dispatch]);

    const handleProblemClick = (problem) => {
        navigate(`/problem/${problem.id}`);
    };

    const getDifficultyStyles = (difficulty) => {
        switch (difficulty?.toUpperCase()) {
            case "EASY":
                return "text-green-500 bg-green-500/10 border-green-500/20";
            case "MEDIUM":
                return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case "HARD":
                return "text-red-500 bg-red-500/10 border-red-500/20";
            default:
                return "text-gray-500 bg-gray-500/10 border-gray-500/20";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                <div className="text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-[0.4em] font-mono">Initializing Problem Set...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] uppercase mb-4">Training Grounds</div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">Problem Set</h1>
                </div>
                <div className="px-6 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1">Total Signals</div>
                        <div className="text-xl font-bold font-mono text-white">{problems.length}</div>
                    </div>
                </div>
            </div>

            {/* Problems Grid / Table */}
            <div className="grid grid-cols-1 gap-4">
                {problems.length === 0 ? (
                    <div className="bg-[#0a0a0a] border border-dashed border-[#222] rounded-2xl p-20 text-center">
                        <Terminal size={40} className="mx-auto text-gray-800 mb-6" />
                        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">No challenges detected in the grid.</p>
                    </div>
                ) : (
                    problems.map((problem) => (
                        <div
                            key={problem.id}
                            onClick={() => handleProblemClick(problem)}
                            className="premium-card bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl group cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-6 flex-1">
                                <div className="w-12 h-12 bg-[#111] border border-white/5 flex items-center justify-center rounded-xl group-hover:border-[var(--color-primary)]/50 transition-colors">
                                    <Zap size={20} className="text-slate-600 group-hover:text-[var(--color-primary)] transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-[var(--color-primary)] transition-colors mb-1 uppercase tracking-tight">
                                        {problem.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5">
                                            <Trophy size={11} /> 100 PTS
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Activity size={11} /> 85% SUCCESS
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold font-mono border ${getDifficultyStyles(problem.difficulty)}`}>
                                    {problem.difficulty}
                                </span>
                                <div className="p-2 bg-white/5 rounded-lg text-slate-500 group-hover:text-white group-hover:bg-[var(--color-primary)] group-hover:text-black transition-all">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};