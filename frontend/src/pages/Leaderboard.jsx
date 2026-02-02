import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaderboard } from "../../store/api/leaderboard.thunk";

export const Leaderboard = () => {
    const dispatch = useDispatch();

    const { rankings, loading, error, currentPage, totalPages } = useSelector(
        (state) => state.leaderboard
    );

    useEffect(() => {
        dispatch(fetchLeaderboard({ page: currentPage, limit: 20 }));
    }, [dispatch, currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            dispatch(fetchLeaderboard({ page: newPage, limit: 20 }));
        }
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
  <div className="min-h-screen bg-[#0f0f12] text-gray-200 px-6 py-10">
    {/* Header */}
    <div className="max-w-7xl mx-auto mb-10">
      <h1 className="text-5xl font-bold text-white mb-2">🏆 Leaderboard</h1>
      <p className="text-gray-400 text-lg">
        Top warriors ranked by ELO points
      </p>
    </div>

    <div className="max-w-7xl mx-auto bg-[#15151a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#1d1d24] sticky top-0 z-10">
            <tr className="text-gray-400 text-sm uppercase tracking-wider">
              <th className="py-5 px-6">Rank</th>
              <th className="py-5 px-6">Player</th>
              <th className="py-5 px-6 text-center">Wins</th>
              <th className="py-5 px-6 text-center">Losses</th>
              <th className="py-5 px-6 text-right">ELO</th>
            </tr>
          </thead>

          <tbody>
            {rankings.map((player, index) => {
              const rank = (currentPage - 1) * 20 + index + 1;

              const highlight =
                rank === 1
                  ? "bg-yellow-500/10"
                  : rank === 2
                  ? "bg-gray-400/10"
                  : rank === 3
                  ? "bg-orange-500/10"
                  : "hover:bg-[#1d1d24]";

              return (
                <tr
                  key={player.id}
                  className={`border-b border-gray-800 transition ${highlight}`}
                >
                  {/* Rank */}
                  <td className="py-5 px-6 font-bold text-lg">
                    {getRankIcon(rank)}{" "}
                    <span className={getRankColor(rank)}>{rank}</span>
                  </td>

                  {/* Player */}
                  <td className="py-5 px-6 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-lg font-medium">
                      {player.username}
                    </span>
                  </td>

                  {/* Wins */}
                  <td className="py-5 px-6 text-center text-green-400 font-semibold">
                    {player.wins}
                  </td>

                  {/* Losses */}
                  <td className="py-5 px-6 text-center text-red-400 font-semibold">
                    {player.losses}
                  </td>

                  {/* Points */}
                  <td className="py-5 px-6 text-right text-emerald-400 text-xl font-bold">
                    {player.rankPoints}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-8 py-6 border-t border-gray-800 bg-[#1d1d24]">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-5 py-2 rounded-lg bg-[#0f0f12] hover:bg-[#2a2a35] disabled:opacity-40"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].slice(0, 5).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-[#0f0f12] hover:bg-[#2a2a35]"
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
            className="px-5 py-2 rounded-lg bg-[#0f0f12] hover:bg-[#2a2a35] disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>

    {/* Footer Stats */}
    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mt-10">
      <div className="bg-[#15151a] p-6 rounded-xl border border-gray-800">
        <p className="text-gray-400">Total Players</p>
        <p className="text-3xl font-bold text-white">
          {rankings[0]?.total || 0}
        </p>
      </div>

      <div className="bg-[#15151a] p-6 rounded-xl border border-gray-800">
        <p className="text-gray-400">Page</p>
        <p className="text-3xl font-bold text-white">
          {currentPage} / {totalPages}
        </p>
      </div>

      <div className="bg-[#15151a] p-6 rounded-xl border border-gray-800">
        <p className="text-gray-400">Players on this page</p>
        <p className="text-3xl font-bold text-emerald-400">
          {rankings.length}
        </p>
      </div>
    </div>
  </div>
)
}