import { useState } from "react";
import CodeEditor from "../CodeEditor";
import { LANGUAGES } from "./SquidGameConfig";

const OrganizerView = ({ tournament, roundInfo, timeLeft, leaderboard, playerStreams, onEndRound, onDisqualify }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
    };

    const roundNum = tournament?.currentRound || roundInfo?.roundNumber || 1;
    const currentRoundData = tournament?.roundProblems?.find(r => r.roundNumber === roundNum);
    const problem = currentRoundData?.problem || roundInfo?.problem;

    const selectedPlayer = tournament?.participants?.find(p => p.userId === selectedPlayerId);
    const selectedStream = playerStreams[selectedPlayerId];

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col">
            {/* Header */}
            <div className="relative z-20 p-8 flex justify-between items-center bg-white/[0.01] border-b border-white/[0.03]">
                <div className="flex items-center gap-6">
                    <div>
                        <div className="text-[10px] font-bold tracking-[0.6em] text-red-500 uppercase mb-2">Organizer Dashboard // Live</div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">
                            {tournament?.name}
                        </h1>
                    </div>
                </div>

                <div className="text-center px-8">
                    <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest block mb-1">Round {roundNum} Time Remaining</span>
                    <span className={`text-5xl font-black tabular-nums font-[family:var(--font-heading)] ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-white"}`}>
                        {formatTime(timeLeft)}
                    </span>
                    {/* End Round Button for Host — Always Visible and Prominent */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={onEndRound}
                            className="bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.3em] px-10 py-4 hover:bg-red-700 transition-all shadow-[0_4px_30px_rgba(220,38,38,0.5)] border-2 border-red-400 hover:scale-105 active:scale-95 flex items-center gap-3"
                            style={{ borderRadius: "2px" }}
                        >
                            <span className="text-lg">⏹</span> FORCE END ROUND
                        </button>
                    </div>
                </div>

                <div className="flex gap-12">
                    <div className="text-right">
                        <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest block mb-1">Alive Subjects</span>
                        <span className="text-2xl font-black text-white tabular-nums">
                            {tournament?.participants?.filter(p => p.status === "ACTIVE").length || 0}
                            <span className="text-slate-800 mx-2">/</span>
                            {tournament?.participants?.length || 0}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Left: Dashboard Grid */}
                <div className="flex-1 overflow-y-auto p-12 border-r border-white/5">
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {tournament?.participants?.map((p, i) => {
                            const lbEntry = Array.isArray(leaderboard) ? leaderboard.find(l => l.userId === p.userId) : null;
                            const isSelected = selectedPlayerId === p.userId;
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPlayerId(p.userId)}
                                    className={`relative group p-4 border cursor-pointer transition-all duration-300 ${p.status === "ACTIVE"
                                        ? isSelected ? 'border-red-500 bg-red-500/5' : 'border-white/5 bg-white/[0.01] hover:border-white/20'
                                        : 'border-red-500/10 bg-red-500/[0.02] grayscale opacity-30 shadow-inner'}`}
                                    style={{ borderRadius: "2px" }}
                                >
                                    {/* Disqualify Button */}
                                    {p.status === "ACTIVE" && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDisqualify(p.userId);
                                            }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full items-center justify-center text-[10px] hidden group-hover:flex z-50 border-2 border-[#050505]"
                                            title="Disqualify Participant"
                                        >
                                            ✕
                                        </button>
                                    )}

                                    <div className="flex justify-between items-center mb-4">
                                        <span className={`text-[9px] font-bold font-mono ${p.status === "ACTIVE" ? isSelected ? 'text-red-500' : 'text-slate-600' : 'text-red-900'}`}>
                                            #{i + 1 < 10 ? `0${i + 1}` : i + 1}
                                        </span>
                                        {p.status === "ELIMINATED" && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-[10px] font-bold truncate mb-2 ${p.status === "ACTIVE" ? 'text-white' : 'text-slate-800'}`}>
                                            {p.user?.username}
                                        </div>
                                        <div className={`text-[12px] font-black tabular-nums ${p.status === "ACTIVE" ? 'text-red-500' : 'text-slate-900'}`}>
                                            {lbEntry?.score || 0}<span className="text-[8px] opacity-40 ml-1">pts</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Live Stream Preview */}
                <div className="w-[40%] bg-[#080808] flex flex-col">
                    {selectedPlayer ? (
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center shrink-0">
                                <span className="text-[9px] text-white font-black uppercase tracking-widest">Live Stream // {selectedPlayer.user?.username}</span>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-[8px] text-red-500 font-bold uppercase">Live</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                {selectedStream ? (
                                    <CodeEditor
                                        language={LANGUAGES[selectedStream.language]?.monaco || "java"}
                                        value={selectedStream.code}
                                        readOnly={true}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-mono text-xs">
                                        Waiting for stream feed...
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 border border-white/5 rounded-full flex items-center justify-center mb-6">
                                <span className="text-2xl opacity-20">👁️</span>
                            </div>
                            <h3 className="text-white text-lg font-bold mb-2">Subject Monitoring</h3>
                            <p className="text-slate-600 text-xs">Select a participant to view their live editor and monitor progress in real-time.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Problem View Overlay Bar */}
            <div className="p-4 bg-[#0a0a0a] border-t border-white/5 flex justify-between items-center shrink-0">
                <div className="flex gap-4 items-center">
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Active Task:</span>
                    <span className="text-xs font-bold text-white uppercase">{problem?.title}</span>
                </div>
                <div className="text-[9px] text-slate-500 italic">Only the organizer can see all participants in real-time.</div>
            </div>
        </div>
    );
};

export default OrganizerView;
