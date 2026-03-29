import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaderboard } from "../../store/api/leaderboard.thunk";
import { Globe, MapPin, Users, Trophy } from "lucide-react";

export const Leaderboard = () => {
  const dispatch = useDispatch();

  const { rankings, loading, error, currentPage, totalPages } = useSelector(
    (state) => state.leaderboard
  );

  const [activeFilter, setActiveFilter] = useState('GLOBAL');

  useEffect(() => {
    dispatch(fetchLeaderboard({ page: currentPage, limit: 20, filter: activeFilter }));
  }, [dispatch, currentPage, activeFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(fetchLeaderboard({ page: newPage, limit: 20, filter: activeFilter }));
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-yellow-400 font-bold"; // Gold
      case 2:
        return "text-gray-300 font-bold"; // Silver
      case 3:
        return "text-orange-400 font-bold"; // Bronze
      default:
        return "text-gray-400";
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-screen-2xl  mx-auto px-6 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-xl text-gray-400">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-2xl  mx-auto px-6 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-xl text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-text-main)] py-20 px-6 font-[family:var(--font-body)]">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[800px] h-[800px] bg-[var(--color-primary)] opacity-[0.01] blur-[150px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-20 text-center">
        <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Global Rankings</div>
        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase font-[family:var(--font-heading)]">Global Leaderboard</h1>
        <p className="text-slate-500 text-lg font-light max-w-2xl mx-auto">
          Top players from around the world.
        </p>

        {/* Filter Tabs */}
        <div className="flex justify-center mt-12">
            <div className="inline-flex bg-white/[0.02] border border-white/5 p-1 rounded-sm gap-1">
                {[
                    { id: 'GLOBAL', label: 'Global', icon: Globe },
                    { id: 'REGIONAL', label: 'Regional', icon: MapPin },
                    { id: 'FRIENDS', label: 'Friends', icon: Users }
                ].map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => handleFilterChange(filter.id)}
                        className={`flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                            activeFilter === filter.id 
                                ? 'bg-[var(--color-primary)] text-black' 
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                        style={{ borderRadius: '2px' }}
                    >
                        <filter.icon size={14} />
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-16">
        {/* Table Container */}
        <div className="premium-card overflow-hidden" style={{ borderRadius: "2px" }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="py-8 px-10 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Rank</th>
                <th className="py-8 px-10 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Player</th>
                <th className="py-8 px-10 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 text-center">Wins</th>
                <th className="py-8 px-10 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 text-center">Defeats</th>
                <th className="py-8 px-10 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 text-right">ELO Rating</th>
              </tr>
            </thead>

            <tbody>
              {rankings.map((player, index) => {
                const rank = (currentPage - 1) * 20 + index + 1;
                return (
                  <tr
                    key={player.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="py-8 px-10">
                      <span className={`text-xl font-black font-mono tracking-tighter ${rank <= 3 ? 'text-[var(--color-primary)]' : 'text-slate-700'}`}>
                        {rank < 10 ? `0${rank}` : rank}
                      </span>
                    </td>

                    <td className="py-8 px-10">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white group-hover:border-[var(--color-primary)]/40 transition-colors" style={{ borderRadius: "2px" }}>
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-bold tracking-tight text-lg">
                          {player.username}
                        </span>
                      </div>
                    </td>

                    <td className="py-8 px-10 text-center">
                      <span className="text-emerald-500/80 font-bold font-mono tracking-widest">{player.wins}</span>
                    </td>

                    <td className="py-8 px-10 text-center text-slate-600 font-mono tracking-widest">
                      {player.losses}
                    </td>

                    <td className="py-8 px-10 text-right">
                      <span className="text-2xl font-black text-white tracking-tighter tabular-nums font-[family:var(--font-heading)]">
                        {player.rankPoints}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination - REFINED */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-10 py-8 bg-white/[0.01]">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
              >
                ← Previous Page
              </button>

              <div className="flex gap-6">
                {[...Array(totalPages)].slice(0, 5).map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`text-[10px] font-bold uppercase tracking-widest transition-all ${currentPage === page
                        ? "text-[var(--color-primary)]"
                        : "text-slate-700 hover:text-white"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
              >
                Next Page →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats Summary */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="premium-card p-10 border-l border-[var(--color-primary)]/20" style={{ borderRadius: "2px" }}>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Players</p>
          <p className="text-4xl font-black text-white tabular-nums">
            {rankings[0]?.total || 0}
          </p>
        </div>

        <div className="premium-card p-10" style={{ borderRadius: "2px" }}>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Current Page</p>
          <p className="text-4xl font-black text-white tabular-nums">
            {currentPage}<span className="text-slate-800 mx-2">/</span>{totalPages}
          </p>
        </div>

        <div className="premium-card p-10" style={{ borderRadius: "2px" }}>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Players on Page</p>
          <p className="text-4xl font-black text-[var(--color-primary)] tabular-nums">
            {rankings.length}
          </p>
        </div>
      </div>
    </div>
  );
};