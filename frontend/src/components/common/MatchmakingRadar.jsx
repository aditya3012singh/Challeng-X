import React from "react";
import { motion } from "framer-motion";

const MatchmakingRadar = () => {
  return (
    <div className="relative w-full h-64 flex items-center justify-center mb-12 overflow-hidden bg-black/20" style={{ borderRadius: "2px" }}>
      {/* Central Point */}
      <div className="absolute w-2 h-2 bg-[var(--color-primary)] rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)] z-10" />

      {/* Pulsing Concentric Circles */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute border border-[var(--color-primary)]/20 rounded-full"
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{
            width: ["0%", "100%"],
            height: ["0%", "100%"],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Rotating Scan Line */}
      <motion.div
        className="absolute w-1/2 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-primary)]/40 origin-left left-1/2"
        style={{ top: "50%" }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: `linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }} />
      
      {/* Scanning Text (Subtle) */}
      <div className="absolute bottom-4 right-4 text-[8px] font-mono text-[var(--color-primary)] opacity-30 uppercase tracking-[0.2em] font-bold">
        Scanning Frequencies...
      </div>
    </div>
  );
};

export default MatchmakingRadar;
