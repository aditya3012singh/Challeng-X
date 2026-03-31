import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProblemById } from "../../store/api/problem.thunk";
import { createBattleSelected } from "../../store/api/battle.thunk";
import { Zap, Code, Terminal, Clock, Shield, ChevronLeft, Activity, Play } from 'lucide-react';

export const ProblemDetail = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const [creatingBattle, setCreatingBattle] = useState(false);

    const {
        currentProblem = null,
        loading = false,
        error = null,
    } = useSelector((state) => state.problem);

    useEffect(() => {
        if (id) {
            dispatch(getProblemById(id));
        }
    }, [id, dispatch]);

    const handleCreateBattle = async () => {
        if (!currentProblem?.id) return;
        
        setCreatingBattle(true);
        try {
            const result = await dispatch(createBattleSelected({ problemId: currentProblem.id })).unwrap();
            if (result?.id) {
                navigate(`/battle/${result.id}/ide`);
            }
        } catch (error) {
            console.error("Battle creation error:", error);
        } finally {
            setCreatingBattle(false);
        }
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
                <div className="text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-[0.4em] font-mono">Decoding Signal...</div>
            </div>
        );
    }

    if (!currentProblem) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Navigation Header */}
            <div className="mb-10 flex items-center gap-4">
                <button 
                    onClick={() => navigate('/problems')}
                    className="p-2 bg-[var(--color-bg-card)] border border-white/10 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-primary)] transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <div className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-text-muted)] uppercase">Challenge Details</div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-[var(--color-text-main)] uppercase tracking-tight">{currentProblem.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold font-mono border ${getDifficultyStyles(currentProblem.difficulty)}`}>
                            {currentProblem.difficulty}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description Card */}
                    <div className="premium-card bg-[var(--color-bg-card)] border border-white/5 rounded-2xl p-8 overflow-hidden relative">
                        <div className="flex items-center gap-3 mb-6 text-[var(--color-primary)]">
                            <Terminal size={18} />
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Operational Objective</h2>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 leading-relaxed font-light whitespace-pre-line text-lg">
                                {currentProblem.description}
                            </p>
                        </div>
                        
                        {/* Test Cases / Examples */}
                        {currentProblem.testcases && currentProblem.testcases.length > 0 && (
                            <div className="mt-10 space-y-4">
                                <div className="flex items-center gap-2 mb-4 text-[var(--color-text-muted)]">
                                    <Code size={14} />
                                    <span className="text-[10px] uppercase font-mono tracking-widest">Protocol Evidence (Test Cases)</span>
                                </div>
                                {currentProblem.testcases.slice(0, 2).map((testcase, index) => (
                                    <div key={index} className="p-6 bg-[#111] border border-white/5 rounded-xl space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-600">
                                            <span>Batch {index + 1}</span>
                                            <span className="text-[var(--color-primary)]/50">Verified</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[9px] font-bold text-slate-700 uppercase mb-2">Input</div>
                                                <div className="bg-black/40 p-3 rounded font-mono text-xs text-[var(--color-text-muted)] border border-white/5">{testcase.input}</div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-bold text-slate-700 uppercase mb-2">Output</div>
                                                <div className="bg-black/40 p-3 rounded font-mono text-xs text-[var(--color-primary)]/80 border border-white/5">{testcase.expected || testcase.output}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Stats/Actions */}
                <div className="space-y-6">
                    {/* Battle Action */}
                    <div className="premium-card bg-[var(--color-bg-card)] border border-white/5 rounded-2xl p-6 text-center">
                        <div className="mb-6 p-4 bg-[var(--color-primary)]/5 rounded-2xl border border-[var(--color-primary)]/10">
                            <Zap size={32} className="mx-auto text-[var(--color-primary)] mb-2" />
                            <div className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest">Combat Ready</div>
                        </div>
                        <button
                            onClick={handleCreateBattle}
                            disabled={creatingBattle}
                            className="w-full py-4 bg-[var(--color-primary)] text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(204,255,0,0.1)] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {creatingBattle ? (
                                <Activity size={18} className="animate-spin" />
                            ) : (
                                <Play size={18} fill="currentColor" />
                            )}
                            Initialize Arena
                        </button>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-[var(--color-bg-card)] border border-white/5 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-[var(--color-text-muted)]" />
                                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Time Limit</span>
                            </div>
                            <span className="text-sm font-mono text-[var(--color-text-main)]">2.0s</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield size={16} className="text-[var(--color-text-muted)]" />
                                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Complexity</span>
                            </div>
                            <span className="text-sm font-mono text-[var(--color-text-main)]">Medium</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
