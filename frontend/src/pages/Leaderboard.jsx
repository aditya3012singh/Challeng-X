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
          <div className="text-xl text-red-400">Error: {typeof error === 'object' ? (error.message || error.error || JSON.stringify(error)) : error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-neutral-50 pt-10 pb-20 px-6 font-[family:var(--font-body)] relative overflow-hidden">
      {/* AMBIENT BACKGROUND SYSTEM */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          alt="Dark code editor"
          className="object-cover opacity-[0.03] absolute inset-0 w-full h-full"
          src="https://images.unsplash.com/photo-1518773553398-650c184e0bb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
        />
        <div className="bg-[radial-gradient(circle_at_30%_20%,rgba(18,18,18,0.7),transparent_60%)] absolute inset-0" />
        <div className="bg-gradient-to-br from-[#09090b]/80 via-transparent to-[#09090b]/90 absolute inset-0" />
        <div className="bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] absolute inset-0" />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-20 text-center relative z-10">
        <div className="text-[10px] font-bold tracking-[0.6em] text-neutral-400 uppercase mb-4">Global Rankings</div>
        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase font-[family:var(--font-heading)]">Global Leaderboard</h1>
        <p className="text-zinc-400 text-lg font-light max-w-2xl mx-auto">
          Top players from around the world.
        </p>

        {/* Filter Tabs */}
        <div className="flex justify-center mt-12 select-none">
          <div className="inline-flex bg-zinc-900 border border-zinc-800 p-1 rounded-sm gap-1">
            {[
              { id: 'GLOBAL', label: 'Global', icon: Globe },
              { id: 'REGIONAL', label: 'Regional', icon: MapPin },
              { id: 'FRIENDS', label: 'Friends', icon: Users }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${activeFilter === filter.id
                    ? 'bg-neutral-200 text-neutral-900'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
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

      <div className="max-w-7xl mx-auto mb-16 relative z-10">
        {/* Table Container */}
        <div className="shadow-[0_10px_30px_rgba(0,0,0,0.35)] rounded-2xl bg-neutral-900 border border-zinc-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/40 select-none">
                <th className="py-8 px-10 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Rank</th>
                <th className="py-8 px-10 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Player</th>
                <th className="py-8 px-10 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 text-center">Wins</th>
                <th className="py-8 px-10 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 text-center">Defeats</th>
                <th className="py-8 px-10 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 text-right">ELO Rating</th>
              </tr>
            </thead>

            <tbody>
              {rankings.map((player, index) => {
                const rank = (currentPage - 1) * 20 + index + 1;
                return (
                  <tr
                    key={player.id}
                    className="border-b border-zinc-800/40 hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="py-8 px-10">
                      <span className={`text-xl font-black font-mono tracking-tighter ${rank <= 3 ? 'text-white' : 'text-slate-700'}`}>
                        {rank < 10 ? `0${rank}` : rank}
                      </span>
                    </td>

                    <td className="py-8 px-10">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-white group-hover:border-white/20 transition-colors bg-zinc-950" style={{ borderRadius: "2px" }}>
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
            <div className="flex justify-between items-center px-10 py-8 bg-zinc-950/20 select-none">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
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
                      className={`text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${currentPage === page
                        ? "text-emerald-500"
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
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
              >
                Next Page →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats Summary */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">
        <div className="shadow-[0_10px_30px_rgba(0,0,0,0.28)] rounded-xl bg-neutral-900 border border-zinc-800 p-10">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Players</p>
          <p className="text-4xl font-black text-white tabular-nums">
            {rankings[0]?.total || 0}
          </p>
        </div>

        <div className="shadow-[0_10px_30px_rgba(0,0,0,0.28)] rounded-xl bg-neutral-900 border border-zinc-800 p-10">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Current Page</p>
          <p className="text-4xl font-black text-white tabular-nums">
            {currentPage}<span className="text-slate-800 mx-2">/</span>{totalPages}
          </p>
        </div>

        <div className="shadow-[0_10px_30px_rgba(0,0,0,0.28)] rounded-xl bg-neutral-900 border border-zinc-800 p-10">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Players on Page</p>
          <p className="text-4xl font-black text-emerald-500 tabular-nums">
            {rankings.length}
          </p>
        </div>
      </div>
    </div>
  );
};
