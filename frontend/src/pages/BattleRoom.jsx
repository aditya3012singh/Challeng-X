import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getBattleById } from "../../store/api/teamBattle.thunk";

export const BattleRoom = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [battleData, setBattleData] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch battle data
  useEffect(() => {
    const fetchBattleData = async () => {
      try {
        setLoading(true);
        const result = await dispatch(getBattleById(battleId)).unwrap();
        setBattleData(result);
      } catch (error) {
        console.error("Failed to fetch battle:", error);
        alert("Failed to load battle room. Redirecting...");
        navigate("/team-battle");
      } finally {
        setLoading(false);
      }
    };

    if (battleId) {
      fetchBattleData();
    }
  }, [battleId, dispatch, navigate]);

  // Listen for Team2 joining (Socket.IO or polling)
  useEffect(() => {
    if (!battleData || battleData.team2) return;

    // Poll for updates every 3 seconds if Team2 hasn't joined
    const interval = setInterval(async () => {
      try {
        const result = await dispatch(getBattleById(battleId)).unwrap();
        if (result.team2 && !battleData.team2) {
          setBattleData(result);
          // Optionally auto-start countdown when Team2 joins
          // setIsStarting(true);
          // setCountdown(5);
        }
      } catch (error) {
        console.error("Error polling battle:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [battleData, battleId, dispatch]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown === 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
      if (countdown === 1) {
        // Navigate to IDE when countdown reaches 0
        startBattle();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => {
    setIsStarting(true);
    setCountdown(5);
  };

  const startBattle = () => {
    // Navigate each member to their IDE with their opponent
    // For now, navigate to a general battle IDE
    navigate(`/battle/${battleData.battleCode}/ide`);
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(battleData?.joinCode || "");
    alert("Join code copied to clipboard!");
  };

  if (!battleData || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading battle room...</p>
        </div>
      </div>
    );
  }

  const isTeam1 = battleData.team1.members.some(m => m.id === user?.id);
  const isTeam2 = battleData.team2?.members.some(m => m.id === user?.id);
  const bothTeamsReady = battleData.team1 && battleData.team2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-2">
            ⚔️ Battle Room
          </h1>
          <div className="text-center text-gray-400">
            <p className="text-sm">Battle Code: <span className="text-blue-400 font-mono">{battleData.battleCode}</span></p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Join Code Section (Only show if Team2 hasn't joined) */}
        {!bothTeamsReady && isTeam1 && (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-3">🔗 Waiting for Team 2</h2>
            <p className="mb-4 text-lg">Share this code with the opposing team:</p>
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white text-gray-900 px-8 py-4 rounded-lg text-3xl font-mono font-bold tracking-wider">
                {battleData.joinCode}
              </div>
              <button
                onClick={copyJoinCode}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-all"
              >
                📋 Copy Code
              </button>
            </div>
          </div>
        )}

        {/* Countdown Section */}
        {bothTeamsReady && countdown !== null && (
          <div className="mb-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Battle Starting In...</h2>
            <div className="text-9xl font-bold animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Ready Button (show when both teams are ready but countdown hasn't started) */}
        {bothTeamsReady && countdown === null && !isStarting && (
          <div className="mb-8 text-center">
            <button
              onClick={startCountdown}
              className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-2xl font-bold transition-all shadow-lg transform hover:scale-105"
            >
              🚀 START BATTLE
            </button>
          </div>
        )}

        {/* Teams Display - Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Team 1 - Left Side */}
          <div className={`bg-gray-800 rounded-lg p-6 border-2 ${isTeam1 ? 'border-blue-500' : 'border-gray-700'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-400">
                🛡️ {battleData.team1.name}
              </h2>
              {isTeam1 && (
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm font-semibold">
                  YOUR TEAM
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {battleData.team1.members.map((member, index) => (
                <div
                  key={member.id}
                  className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{member.username}</p>
                      <p className="text-sm text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Team 2 - Right Side */}
          <div className={`bg-gray-800 rounded-lg p-6 border-2 ${isTeam2 ? 'border-red-500' : 'border-gray-700'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-red-400">
                ⚔️ {battleData.team2?.name || "Waiting..."}
              </h2>
              {isTeam2 && (
                <span className="px-3 py-1 bg-red-600 rounded-full text-sm font-semibold">
                  YOUR TEAM
                </span>
              )}
            </div>

            {battleData.team2 ? (
              <div className="space-y-3">
                {battleData.team2.members.map((member, index) => (
                  <div
                    key={member.id}
                    className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{member.username}</p>
                        <p className="text-sm text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto mb-4"></div>
                  <p className="text-lg">Waiting for Team 2 to join...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Match-ups Info (Show when both teams ready) */}
        {bothTeamsReady && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-center">📊 Match-ups</h3>
            <div className="space-y-3">
              {battleData.team1.members.map((member1, index) => {
                const member2 = battleData.team2?.members[index];
                return (
                  <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 font-semibold">{member1.username}</span>
                    </div>
                    <div className="text-yellow-400 font-bold text-xl">VS</div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 font-semibold">{member2?.username || "TBD"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
