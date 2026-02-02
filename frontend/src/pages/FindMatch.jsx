import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../lib/socket";
import { joinMatchmaking, leaveMatchmaking, getQueueStatus } from "../../store/api/matchmaking.thunk";
import { setMatchFound, resetMatchmaking } from "../../store/slices/matchmaking.slice";

export const FindMatch = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState("MEDIUM");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { inQueue, loading, error, queueSize, waitTime, matchFound, battleId, opponent } = useSelector(
    (state) => state.matchmaking
  );

  useEffect(() => {
    const socket = getSocket();

    // Listen for match found
    socket.on("matchFound", (data) => {
      console.log("Match found!", data);
      dispatch(setMatchFound(data));
    });

    socket.on("matchmakingError", (data) => {
      alert(data.message);
      handleLeaveQueue();
    });

    // Poll queue status every 2 seconds when in queue
    let statusInterval;
    if (inQueue && !matchFound) {
      statusInterval = setInterval(() => {
        dispatch(getQueueStatus());
      }, 2000);
    }

    return () => {
      socket.off("matchFound");
      socket.off("matchmakingError");
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [inQueue, matchFound, dispatch]);

  // Navigate to battle when match is found
  useEffect(() => {
    if (matchFound && battleId) {
      setTimeout(() => {
        navigate(`/battle/${battleId}/ide`);
        dispatch(resetMatchmaking());
      }, 2000);
    }
  }, [matchFound, battleId, navigate, dispatch]);

  const handleJoinQueue = async () => {
    const socket = getSocket();
    try {
      await dispatch(joinMatchmaking({ 
        difficulty: selectedDifficulty, 
        socketId: socket.id 
      })).unwrap();
    } catch (err) {
      console.error("Join queue error:", err);
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await dispatch(leaveMatchmaking()).unwrap();
    } catch (err) {
      console.error("Leave queue error:", err);
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {matchFound ? (
          // Match Found Screen
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-12 text-center shadow-2xl animate-pulse">
            <div className="text-6xl mb-6">🎯</div>
            <h1 className="text-4xl font-bold mb-4">Match Found!</h1>
            <p className="text-xl mb-2">Opponent: <span className="font-bold">{opponent}</span></p>
            <p className="text-sm opacity-80">Redirecting to battle...</p>
          </div>
        ) : inQueue ? (
          // Searching Screen
          <div className="bg-gray-800 rounded-3xl p-10 shadow-2xl border border-gray-700">
            <div className="text-center mb-8">
              <div className="inline-block">
                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Searching for Opponent</h1>
              <p className="text-gray-400">Difficulty: <span className="text-blue-400 font-semibold">{selectedDifficulty}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700 rounded-xl p-6 text-center">
                <p className="text-gray-400 text-sm mb-2">Players in Queue</p>
                <p className="text-3xl font-bold text-blue-400">{queueSize}</p>
              </div>
              <div className="bg-gray-700 rounded-xl p-6 text-center">
                <p className="text-gray-400 text-sm mb-2">Wait Time</p>
                <p className="text-3xl font-bold text-green-400">{formatTime(waitTime)}</p>
              </div>
            </div>

            <button
              onClick={handleLeaveQueue}
              className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors"
            >
              Cancel Search
            </button>
          </div>
        ) : (
          // Selection Screen
          <div className="bg-gray-800 rounded-3xl p-10 shadow-2xl border border-gray-700">
            <h1 className="text-4xl font-bold text-center mb-8">⚔️ Find Match</h1>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-400 mb-4">
                Select Difficulty
              </label>
              <div className="grid grid-cols-3 gap-4">
                {["EASY", "MEDIUM", "HARD"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                      selectedDifficulty === diff
                        ? "bg-blue-600 text-white shadow-lg scale-105"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleJoinQueue}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "Joining..." : "Start Matchmaking"}
            </button>

            <div className="mt-8 bg-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <span className="mr-2">ℹ️</span> How it works
              </h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• You'll be matched with players of similar rank</li>
                <li>• Average wait time is 30 seconds or less</li>
                <li>• Problem difficulty matches your selection</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};