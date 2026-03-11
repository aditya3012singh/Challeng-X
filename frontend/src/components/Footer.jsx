import React from 'react';
import { Linkedin, Github, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full py-8 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(5,5,5,0.8)] backdrop-blur-md mt-auto">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 group cursor-default">
                    <span className="text-[var(--color-text-muted)] text-sm font-medium">Made with</span>
                    <Heart size={16} className="text-[var(--color-primary)] fill-[var(--color-primary)] animate-pulse" />
                    <span className="text-[var(--color-text-muted)] text-sm font-medium">by</span>
                    <span className="text-[var(--color-text-main)] text-sm font-bold tracking-tight group-hover:text-[var(--color-primary)] transition-colors duration-300 uppercase">
                        aditya singh
                    </span>
                </div>

                <div className="flex items-center gap-8">
                    <a 
                        href="https://www.linkedin.com/in/aditya-singh-8b8045345/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all duration-300 group"
                    >
                        <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em] hidden sm:inline">LinkedIn</span>
                    </a>
                    
                    <a 
                        href="https://github.com/aditya3012singh" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all duration-300 group"
                    >
                        <Github size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em] hidden sm:inline">GitHub</span>
                    </a>
                </div>

                <div className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-[0.3em] font-mono pointer-events-none">
                    &copy; {new Date().getFullYear()} CodeArena System v2.0
                </div>
            </div>
        </footer>
    );
};

export default Footer;
