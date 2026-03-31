import React from 'react';
import { Clock, CheckCircle, XCircle, Code, ArrowRight, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MatchHistory = ({ history, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-[var(--color-bg-card)] border border-[var(--glass-border)] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-[var(--color-bg-card)] border border-dashed border-[var(--glass-border)] rounded-xl p-12 text-center text-[var(--color-text-muted)] font-mono text-[10px] uppercase tracking-widest opacity-40">
        No Combat Records Logged
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-[var(--color-text-muted)] flex items-center gap-2 uppercase tracking-widest opacity-30">
        <History size={14} /> Combat Data Logs
      </h3>
      
      <div className="space-y-2">
        {history.map((sub) => (
          <div 
            key={sub.id} 
            className="group bg-[var(--color-bg-card)] border border-[var(--glass-border)] hover:border-[var(--color-primary)]/30 rounded-xl p-4 transition-all flex items-center justify-between backdrop-blur-md"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-current transition-all ${
                sub.status === 'PASSED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {sub.status === 'PASSED' ? <CheckCircle size={20} /> : <XCircle size={20} />}
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-black text-[var(--color-text-main)] truncate uppercase">{sub.problem.title}</h4>
                  <span className={`text-[8px] px-2 py-0.5 rounded-sm font-black uppercase tracking-widest ${
                    sub.problem.difficulty === 'EASY' ? 'bg-green-500/10 text-green-500' :
                    sub.problem.difficulty === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {sub.problem.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-tighter opacity-60">
                  <span className="flex items-center gap-1.5">
                    <Code size={10} className="text-[var(--color-primary)]" /> {sub.language}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={10} /> {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                  </span>
                  {sub.executionTimeMs && (
                    <span className="text-[var(--color-primary)] font-black bg-[var(--color-primary)]/5 px-2 py-0.5 rounded-sm">{sub.executionTimeMs}ms</span>
                  )}
                </div>
              </div>
            </div>

            <button 
              className="p-2 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-all opacity-0 group-hover:opacity-100"
              title="View Source Code"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchHistory;
