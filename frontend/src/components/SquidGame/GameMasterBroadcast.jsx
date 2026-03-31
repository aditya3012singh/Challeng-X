import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio } from 'lucide-react';

const GameMasterBroadcast = ({ message, type, onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onComplete) onComplete();
            }, 6000); // Show for 6 seconds
            return () => clearTimeout(timer);
        }
    }, [message, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-8 pointer-events-none"
                >
                    <div className="max-w-3xl w-full bg-black/90 border border-[var(--color-primary)]/30 backdrop-blur-xl relative overflow-hidden shadow-[0_0_50px_rgba(255,170,0,0.1)]" style={{ borderRadius: "2px" }}>
                        {/* DECORATIVE ELEMENTS */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-20" />
                        
                        <div className="p-6 flex items-center gap-6">
                            <div className="shrink-0 w-12 h-12 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full flex items-center justify-center relative">
                                <Radio size={20} className="text-[var(--color-primary)] animate-pulse" />
                                <div className="absolute inset-0 border border-[var(--color-primary)]/40 rounded-full animate-ping opacity-20" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[9px] font-black text-[var(--color-primary)] uppercase tracking-[0.4em]">Broadcast System</span>
                                    <div className="h-[1px] w-8 bg-[var(--color-primary)]/30" />
                                    <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
                                        Term: {type || "General Notification"}
                                    </span>
                                </div>
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg lg:text-xl font-black text-white tracking-tight uppercase italic font-[family:var(--font-heading)] leading-tight"
                                >
                                    "{message}"
                                </motion.p>
                            </div>

                            {/* SCANLINE EFFECT */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GameMasterBroadcast;
