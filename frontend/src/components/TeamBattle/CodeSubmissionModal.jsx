export const CodeSubmissionModal = ({
  selectedMatch,
  onClose,
  code,
  setCode,
  language,
  setLanguage,
  onSubmitCode,
  onMarkWinner,
  battleLoading,
}) => {
  if (!selectedMatch) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="premium-card w-full max-w-5xl my-8 relative overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: "2px" }}
      >
        <div className="border-b border-white/[0.03] px-10 py-8 flex justify-between items-center bg-white/[0.01]">
          <div>
            <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-2">Battle Room // Active</div>
            <h3 className="text-2xl font-black text-[var(--color-text-main)] uppercase tracking-tighter">
              {selectedMatch.player1?.username} <span className="text-slate-600 px-2 font-mono">VS</span> {selectedMatch.player2?.username}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-10 space-y-12">
          {/* Problem Display */}
          <div className="bg-white/[0.02] border-l-2 border-[var(--color-primary)] p-8 shadow-xl" style={{ borderRadius: "2px" }}>
            <h4 className="text-xl font-black text-[var(--color-text-main)] mb-4 uppercase tracking-tight">
              {selectedMatch.problem?.title}
            </h4>
            <p className="text-[var(--color-text-muted)] text-sm font-light leading-relaxed mb-8">
              {selectedMatch.problem?.description}
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
              <div>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Complexity</p>
                <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest">
                  {selectedMatch.problem?.difficulty}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Constraints</p>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                  {selectedMatch.problem?.constraints}
                </p>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.3em]">Code Transmission Layer</label>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Compiler:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest focus:outline-none cursor-pointer"
                >
                  <option value="java" className="bg-[var(--color-bg-dark)]">Java</option>
                  <option value="cpp" className="bg-[var(--color-bg-dark)]">C++</option>
                </select>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Initiate logic sequence here..."
              className="w-full h-96 bg-white/[0.01] border border-white/5 p-8 text-[var(--color-text-main)] font-mono text-sm focus:outline-none focus:border-[var(--color-primary)]/40 transition-all custom-scrollbar outline-none"
              style={{ borderRadius: "2px" }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-6 pt-4 border-t border-white/[0.03]">
            <button
              onClick={onSubmitCode}
              disabled={battleLoading || !code.trim()}
              className="flex-[2] py-5 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest text-xs disabled:opacity-20 hover:bg-white transition-all transform active:scale-95 shadow-xl"
              style={{ borderRadius: "2px" }}
            >
              {battleLoading ? "Transmitting..." : "Initialize Submission →"}
            </button>
            <button
              onClick={onMarkWinner}
              disabled={
                battleLoading ||
                !selectedMatch.submissions?.length ||
                selectedMatch.winnerId
              }
              className="flex-1 py-5 border border-white/10 text-[var(--color-text-main)]/50 font-bold uppercase tracking-widest text-[10px] hover:text-[var(--color-text-main)] hover:border-white transition-all disabled:opacity-20"
              style={{ borderRadius: "2px" }}
            >
              Resolve Victory
            </button>
            <button
              onClick={onClose}
              className="px-8 py-5 text-[var(--color-text-muted)] font-bold uppercase tracking-widest text-[10px] hover:text-[var(--color-text-main)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
