import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Zap, Clock, Trophy, ChevronLeft, ChevronRight, 
  Terminal, Activity, Shield, Rocket, Target, Send,
  Play, MousePointer2, Loader2, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "react-hot-toast";

import { useSubmission } from "../hooks/useSubmission";
import axiosInstance from "../../lib/axios";
import { BattleProblem } from "../components/BattleProblem";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";

const LANGUAGES = {
  java: { monaco: "java", defaultCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello contest!");\n    }\n}` },
  cpp: { monaco: "cpp", defaultCode: `#include <iostream>\nint main() {\n  std::cout << "Hello\\n";\n  return 0;\n}` },
  python: { monaco: "python", defaultCode: `print("Hello world")`},
  javascript: { monaco: "javascript", defaultCode: `console.log("Hello JS")`},
};

export default function ContestArena() {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [contest, setContest] = useState(null);
  
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(LANGUAGES["java"].defaultCode);
  const [activeTab, setActiveTab] = useState("description"); // description, console
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileTab, setMobileTab] = useState("problem");
  
  // Sidebar states
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  // Time Remaining
  const [timeLeft, setTimeLeft] = useState("");

  const {
    submit: handleContestSubmit,
    status: submissionStatus,
    loading: isSubmitting
  } = useSubmission();

  useEffect(() => {
    const init = async () => {
      try {
         const [probRes, conRes] = await Promise.all([
             axiosInstance.get(`/problem/${problemId}`),
             axiosInstance.get(`/contest/${contestId}`)
         ]);
         setProblem(probRes.data.problem || probRes.data);
         setContest(conRes.data.contest);
      } catch (e) {
         console.error(e);
      }
    };
    init();
  }, [contestId, problemId]);

  useEffect(() => {
    if (!contest) return;
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(contest.endTime).getTime();
        const diff = end - now;

        if (diff <= 0) {
            setTimeLeft("ENDED");
            clearInterval(timer);
        } else {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        }
    }, 1000);
    return () => clearInterval(timer);
  }, [contest]);

  const resize = useCallback((e) => {
    if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth > 250 && newWidth < window.innerWidth * 0.45) {
            setSidebarWidth(newWidth);
        }
    }
    if (isResizingRight) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 200 && newWidth < window.innerWidth * 0.45) {
            setRightSidebarWidth(newWidth);
        }
    }
  }, [isResizing, isResizingRight]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    setIsResizingRight(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
        window.removeEventListener("mousemove", resize);
        window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const handleSubmit = async () => {
      try {
          await handleContestSubmit({ code, language, problemId, contestId });
          toast.success("Submission Received. Processing...");
          setActiveTab("console");
      } catch (err) {
          toast.error(`Submission Error: ${err.message}`);
      }
  };

  const statusMap = () => {
      if (submissionStatus?.isProcessing) return "running";
      if (submissionStatus?.status === "PASSED") return "success";
      if (submissionStatus?.status === "FAILED") return "error";
      return "idle";
  };

  if (!problem || !contest) return <div className="h-screen flex items-center justify-center bg-[var(--color-bg-dark)] text-[var(--color-primary)] font-mono uppercase">Loading Arena...</div>;

  const now = new Date();
  const startTime = new Date(contest.startTime);
  const isUpcoming = now < startTime;
  const isAdmin = useSelector((state) => state.auth.user?.role === "ADMIN");

  if (isUpcoming && !isAdmin) {
      return (
          <div className="h-screen flex flex-col items-center justify-center bg-[var(--color-bg-dark)] text-center p-6">
              <Shield size={64} className="text-red-500/20 mb-8 animate-pulse" />
              <h1 className="text-4xl font-black text-[var(--color-text-main)] uppercase tracking-tighter mb-4">Mission Restricted</h1>
              <p className="text-[var(--color-text-muted)] font-mono text-sm max-w-md uppercase tracking-widest leading-relaxed">
                  Neural uplink failed. The requested objective vectors are currently encrypted. 
                  Synchronization will commence at: <br/>
                  <span className="text-[var(--color-primary)] mt-4 block">{startTime.toLocaleString()}</span>
              </p>
              <button 
                  onClick={() => navigate(`/contests/${contestId}`)}
                  className="mt-12 px-10 py-3 border border-white/10 text-[var(--color-text-main)] font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
              >
                  Abort Connection
              </button>
          </div>
      );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg-dark)] overflow-hidden">
      {/* Premium Header */}
      <div className="h-14 border-b border-white/[0.05] bg-black/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(`/contests/${contestId}`)}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all font-bold text-[9px] uppercase tracking-widest group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Return to Protocols
          </button>
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-[0.4em]">CONTEST ID:</span>
            <span className="text-[10px] text-[var(--color-text-main)] font-mono font-bold uppercase">{contestId.slice(0, 8)}...</span>
          </div>
        </div>

        <div className="flex items-center gap-10">
            {/* Countdown */}
            <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-0.5">Time Remaining</span>
                <div className="flex items-center gap-2">
                    <Clock size={12} className="text-red-500 animate-pulse" />
                    <span className="text-sm font-black text-[var(--color-text-main)] font-mono">{timeLeft}</span>
                </div>
            </div>
            
            <div className="h-6 w-[1px] bg-white/10" />
            
            <div className="flex flex-col items-end">
                <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-0.5">Status</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Synchronized</span>
            </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR — Problem & Console (Desktop) / Main View (Mobile) */}
        {( !isMobile || mobileTab === 'problem' || mobileTab === 'console') && (
          <div 
            className={`flex flex-col bg-[var(--color-bg-card)] relative shrink-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-40 transition-all ${isMobile ? 'flex-1' : ''}`}
            style={{ width: isMobile ? '100%' : `${sidebarWidth}px` }}
          >
            {/* Tabs UI */}
            <div className="h-10 border-b border-white/5 flex bg-black/40 px-2 shrink-0">
              {[
                { id: 'description', label: 'Mission Data', icon: <Target size={12} /> },
                { id: 'console', label: 'Compiler Feed', icon: <Terminal size={12} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if(isMobile) setMobileTab(tab.id === 'description' ? 'problem' : 'console'); }}
                  className={`flex-1 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar p-6">
              {activeTab === 'description' ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <BattleProblem problem={problem} />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500 h-full">
                  <OutputPanel
                      output={submissionStatus?.output}
                      status={statusMap()}
                      testCaseResults={submissionStatus?.testCaseResults}
                      problem={problem}
                  />
                </div>
              )}
            </div>

            {!isMobile && (
              <div 
                onMouseDown={() => setIsResizing(true)}
                className="absolute top-0 right-0 w-[2px] h-full cursor-col-resize hover:bg-[var(--color-primary)] transition-all z-50 hover:shadow-[0_0_10px_var(--color-primary)]"
              />
            )}
          </div>
        )}

        {/* CENTER — IDE (Desktop) / Code View (Mobile) */}
        {(!isMobile || mobileTab === 'editor') && (
          <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-card)] relative">
            <div className="h-10 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 shrink-0">
              <div className="flex items-center gap-4">
                 <select 
                  value={language}
                  onChange={(e) => { setLanguage(e.target.value); setCode(LANGUAGES[e.target.value]?.defaultCode || ""); }}
                  className="bg-transparent text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest border-none outline-none focus:text-[var(--color-primary)] cursor-pointer"
                 >
                   {Object.keys(LANGUAGES).map(lang => (
                     <option key={lang} value={lang} className="bg-black text-[10px]">{lang.toUpperCase()}</option>
                   ))}
                 </select>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="group flex items-center gap-2 px-6 py-1.5 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 font-black text-[9px] uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-[var(--color-text-main)] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  Transmit Code
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-black/20">
              <CodeEditor
                language={LANGUAGES[language]?.monaco || language}
                value={code}
                onChange={(v) => setCode(v || "")}
              />
            </div>
          </div>
        )}

        {/* Mobile View Toggle (Bottom) */}
        {isMobile && (
          <div className="h-14 bg-[var(--color-bg-card)] border-t border-white/10 flex shrink-0 relative z-[100]">
            {[
              { id: 'problem', label: 'Mission', icon: <Target size={16} /> },
              { id: 'editor', label: 'Code', icon: <Terminal size={16} /> },
              { id: 'console', label: 'Feed', icon: <Activity size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setMobileTab(tab.id);
                  if (tab.id === 'problem') setActiveTab('description');
                  if (tab.id === 'console') setActiveTab('console');
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${mobileTab === tab.id ? 'text-[var(--color-primary)] bg-white/5' : 'text-[var(--color-text-muted)]'}`}
              >
                {tab.icon}
                <span className="text-[8px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* RIGHT SIDEBAR — Progress / Info */}
        {!isMobile && (
            <div 
                className="flex flex-col bg-[var(--color-bg-card)] border-l border-white/5 relative shrink-0 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-40"
                style={{ width: `${rightSidebarWidth}px` }}
            >
                <div 
                    onMouseDown={() => setIsResizingRight(true)}
                    className="absolute top-0 left-0 w-[2px] h-full cursor-col-resize hover:bg-[var(--color-primary)] transition-all z-50"
                />

                <div className="h-10 border-b border-white/5 flex items-center px-6 bg-black/40">
                    <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Competitor Stats</span>
                </div>

                <div className="p-8 space-y-10">
                    {/* Scores */}
                    <div className="p-6 bg-white/[0.02] border border-white/5 relative overflow-hidden group" style={{ borderRadius: "2px" }}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:h-full transition-all" />
                        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-4">Current Score</div>
                        <div className="text-4xl font-black text-[var(--color-text-main)] font-mono tracking-tighter">0000</div>
                        <div className="mt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">+ POINTS AVAILABLE</div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 relative overflow-hidden group" style={{ borderRadius: "2px" }}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50 group-hover:h-full transition-all" />
                        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-4">Total Penalty</div>
                        <div className="text-2xl font-black text-[var(--color-text-main)] font-mono tracking-tighter">+0m 00s</div>
                    </div>

                    <div className="pt-10 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity size={14} className="text-[var(--color-primary)]" />
                            <span className="text-[10px] font-black text-[var(--color-text-main)] uppercase tracking-widest">Protocol Instructions</span>
                        </div>
                        <p className="text-[var(--color-text-muted)] text-[10px] font-mono leading-relaxed space-y-4">
                            1. Ensure all test cases are processed.<br/><br/>
                            2. Multiple submissions are allowed, but beware of time penalties.<br/><br/>
                            3. Use the console feed to debug execution errors.
                        </p>
                    </div>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <button 
                        onClick={() => navigate(`/contests/${contestId}`)}
                        className="w-full py-4 border border-red-500/30 text-red-500 font-black text-[9px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-[var(--color-text-main)] transition-all"
                    >
                        ABANDON MATCH
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
