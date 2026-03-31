import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, X, Zap, Terminal, Sparkles } from "lucide-react";

const CyberMentorModal = ({ isOpen, onClose, hint, isLoading }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="w-full max-w-lg bg-[var(--color-bg-card)] border border-[var(--color-primary)]/20 shadow-[0_0_50px_rgba(var(--color-primary-rgb),0.1)] relative overflow-hidden"
                        style={{ borderRadius: "2px" }}
                    >
                        {/* THEME ELEMENTS */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-primary)]/5 rounded-full blur-[80px]" />
                        
                        {/* HEADER */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.2)]">
                                    <Cpu className="text-[var(--color-primary)]" size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.4em] mb-1">Neural Uplink</div>
                                    <h3 className="text-xl font-black text-[var(--color-text-main)] uppercase tracking-tight">Cyber-Mentor Hint</h3>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 text-slate-600 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="p-10">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-2 border-[var(--color-primary)]/10 border-t-[var(--color-primary)] rounded-full animate-spin" />
                                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-primary)] animate-pulse" size={20} />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-black text-[var(--color-text-main)] uppercase tracking-[0.5em] mb-2">Analyzing Patterns</div>
                                        <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest whitespace-nowrap">Accessing Subroutine: LDM_OPTIMIZER_v4.2</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-sm">
                                        <Terminal size={16} className="text-[var(--color-primary)] mt-1 shrink-0" />
                                        <p className="text-[var(--color-text-main)] text-sm font-light leading-relaxed tracking-wide whitespace-pre-wrap">
                                            {hint || "No hint data received. The neural link is unstable."}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 rounded-sm">
                                        <Zap size={12} className="text-[var(--color-primary)]" />
                                        <span className="text-[9px] font-black text-[var(--color-primary)] uppercase tracking-widest">
                                            System Note: Use this logic to refactor your current implementation.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className="p-6 bg-black/40 border-t border-white/5 flex justify-end">
                            <button 
                                onClick={onClose}
                                className="px-8 py-3 bg-white/5 border border-white/10 text-[var(--color-text-main)] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
                                style={{ borderRadius: "2px" }}
                            >
                                Resume Mission
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CyberMentorModal;
