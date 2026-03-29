import React from 'react';
import { Clock, CheckCircle, XCircle, Code, ArrowRight, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MatchHistory = ({ history, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-[#0a0a0a] border border-[#222] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-dashed border-[#222] rounded-xl p-12 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">
        No Combat Records Logged
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-mono text-gray-500 flex items-center gap-2">
        <History size={14} /> COMBAT DATA LOGS
      </h3>
      
      <div className="space-y-2">
        {history.map((sub) => (
          <div 
            key={sub.id} 
            className="group bg-[#0a0a0a] border border-[#222] hover:border-[var(--color-primary)]/30 rounded-xl p-4 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                sub.status === 'PASSED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {sub.status === 'PASSED' ? <CheckCircle size={20} /> : <XCircle size={20} />}
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white truncate">{sub.problem.title}</h4>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-black uppercase tracking-widest ${
                    sub.problem.difficulty === 'EASY' ? 'bg-green-500/10 text-green-500' :
                    sub.problem.difficulty === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {sub.problem.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                  <span className="flex items-center gap-1 uppercase tracking-tighter">
                    <Code size={10} /> {sub.language}
                  </span>
                  <span className="flex items-center gap-1 uppercase tracking-tighter">
                    <Clock size={10} /> {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                  </span>
                  {sub.executionTimeMs && (
                    <span className="text-[var(--color-primary)] font-bold">{sub.executionTimeMs}ms</span>
                  )}
                </div>
              </div>
            </div>

            <button 
              className="p-2 text-gray-600 group-hover:text-[var(--color-primary)] transition-all opacity-0 group-hover:opacity-100"
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
