import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, X, Zap, Terminal, ShieldAlert, BadgeCheck, Sparkles } from "lucide-react";

const CodeSurgeonModal = ({ isOpen, onClose, report, isLoading }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="w-full max-w-2xl bg-[#0a0a0a] border border-[var(--color-primary)]/20 shadow-[0_0_100px_rgba(var(--color-primary-rgb),0.1)] relative overflow-hidden"
                        style={{ borderRadius: "2px" }}
                    >
                        {/* MEDICAL SCANNER THEME */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(var(--color-primary-rgb),0.1)_3px,rgba(var(--color-primary-rgb),0.1)_4px)] animate-[scan_10s_linear_infinite]" />
                        </div>

                        {/* HEADER */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[var(--color-primary)]/[0.02]">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.2)]">
                                    <Activity className="text-[var(--color-primary)]" size={24} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.5em] mb-1">Post-Submission Diagnostic</div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Code Surgeon Report</h3>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 text-slate-600 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-8">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-2 border-[var(--color-primary)]/10 border-t-[var(--color-primary)] rounded-full animate-spin" />
                                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-primary)] animate-pulse" size={24} />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="text-[12px] font-black text-white uppercase tracking-[0.6em]">Analyzing Logic Flow</div>
                                        <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Identifying Algorithmic Pathologies...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4 p-8 bg-white/[0.01] border border-white/5 rounded-sm relative group">
                                        <div className="absolute top-0 left-0 w-[2px] h-full bg-[var(--color-primary)]/30" />
                                        <Terminal size={18} className="text-[var(--color-primary)] mt-1 shrink-0" />
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <p className="text-slate-300 text-base font-light leading-relaxed tracking-wide whitespace-pre-wrap font-mono">
                                                {report || "No pathologies detected. Your code is remarkably clean (or the scanner failed)."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 px-5 py-3 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 rounded-sm">
                                            <BadgeCheck size={14} className="text-[var(--color-primary)]" />
                                            <span className="text-[9px] font-black text-[var(--color-primary)] uppercase tracking-widest">
                                                Complexity: Optimized
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-sm">
                                            <Zap size={14} className="text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                Pattern: Detected
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className="p-8 bg-black/40 border-t border-white/5 flex justify-end gap-4">
                            <button 
                                onClick={onClose}
                                className="px-10 py-4 bg-[var(--color-primary)] text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white transition-all shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.2)]"
                                style={{ borderRadius: "2px" }}
                            >
                                Close Report
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CodeSurgeonModal;
