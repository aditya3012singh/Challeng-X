import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  createTeamBattle,
  getTeamBattle,
  startTeamBattle,
  submitTeamBattleSolution,
  getTeamBattleSubmissions,
  completeTeamBattle,
  getActiveTeamBattles,
} from "../../store/api/teamBattle.thunk";
import { createTeam, joinTeam, getUserTeams, leaveTeam, disbandTeam } from "../../store/api/team.thunk";
import { clearError, clearSuccessMessage, setCurrentBattle } from "../../store/slices/teamBattle.slice";
import { clearTeamError, clearSuccessMessage as clearTeamSuccess } from "../../store/slices/team.slice";

export const TeamBattle = () => {
  const [activeTab, setActiveTab] = useState("myTeams"); // myTeams, create, join, battle
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(2);
  const [joinCode, setJoinCode] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userTeams, loading: teamLoading, error: teamError, successMessage: teamSuccess } = useSelector(
    (state) => state.team
  );
  const {
    currentBattle,
    submissions,
    activeBattles,
    loading: battleLoading,
    error: battleError,
    successMessage: battleSuccess,
  } = useSelector((state) => state.teamBattle);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUserTeams());
    dispatch(getActiveTeamBattles());
  }, [dispatch]);

  useEffect(() => {
    if (battleSuccess || teamSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        dispatch(clearTeamSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [battleSuccess, teamSuccess, dispatch]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || teamName.length < 3) {
      alert("Team name must be at least 3 characters");
      return;
    }

    try {
      await dispatch(createTeam({ teamName, maxTeamSize: teamSize })).unwrap();
      setTeamName("");
      setActiveTab("myTeams");
      dispatch(getUserTeams());
    } catch (err) {
      console.error("Create team error:", err);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      alert("Enter a team code");
      return;
    }

    try {
      await dispatch(joinTeam({ teamCode: joinCode })).unwrap();
      setJoinCode("");
      setActiveTab("myTeams");
      dispatch(getUserTeams());
    } catch (err) {
      console.error("Join team error:", err);
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to leave this team?")) {
      try {
        await dispatch(leaveTeam(teamId)).unwrap();
        dispatch(getUserTeams());
      } catch (err) {
        console.error("Leave team error:", err);
      }
    }
  };

  const handleDisbandTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to disband this team?")) {
      try {
        await dispatch(disbandTeam(teamId)).unwrap();
        dispatch(getUserTeams());
      } catch (err) {
        console.error("Disband team error:", err);
      }
    }
  };

  const handleCreateBattle = async (team1Id, team2Id) => {
    if (!selectedTeam) {
      alert("Select a team first");
      return;
    }

    // Select a problem (for now, use the first available or let user select)
    const selectedProblem = "669d3c0a-e91e-4e99-b0f4-0a7eac1b2a3d"; // You should let users select

    try {
      await dispatch(
        createTeamBattle({
          team1Id: selectedTeam.id,
          team2Id: team2Id,
          problemId: selectedProblem,
          maxTeamSize: teamSize,
        })
      ).unwrap();
      setActiveTab("battle");
    } catch (err) {
      console.error("Create battle error:", err);
    }
  };

  const handleStartBattle = async () => {
    if (!currentBattle?.battleCode) return;
    try {
      await dispatch(startTeamBattle(currentBattle.battleCode)).unwrap();
    } catch (err) {
      console.error("Start battle error:", err);
    }
  };

  const handleSubmitSolution = async () => {
    if (!currentBattle?.battleCode || !code) {
      alert("Enter code first");
      return;
    }

    try {
      await dispatch(
        submitTeamBattleSolution({
          battleCode: currentBattle.battleCode,
          code,
          language,
          output,
        })
      ).unwrap();
      setCode("");
      setOutput("");
    } catch (err) {
      console.error("Submit solution error:", err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Team code copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">🏆 Team Battle</h1>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab("myTeams")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "myTeams"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            My Teams
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "create"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Create Team
          </button>
          <button
            onClick={() => setActiveTab("join")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "join"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Join Team
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "browse"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Browse Battles
          </button>
        </div>

        {/* Success/Error Messages */}
        {(battleSuccess || teamSuccess) && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-300">{battleSuccess || teamSuccess}</p>
          </div>
        )}

        {(battleError || teamError) && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-300">{battleError || teamError}</p>
          </div>
        )}

        {/* My Teams Tab */}
        {activeTab === "myTeams" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userTeams.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-400 text-lg">No teams yet. Create or join one!</p>
              </div>
            ) : (
              userTeams.map((team) => (
                <div
                  key={team.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                      <p className="text-gray-400 text-sm">
                        Created by: <span className="text-blue-400">{team.creator?.username}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Team Code:</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-900 px-3 py-2 rounded font-mono text-lg font-bold text-green-400">
                        {team.teamCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard(team.teamCode)}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-3">
                      Members ({team.members?.length || 0})
                    </p>
                    <div className="space-y-2">
                      {team.members?.map((member) => (
                        <div key={member.id} className="flex items-center justify-between bg-gray-900 p-2 rounded">
                          <div>
                            <p className="text-white font-semibold">{member.user?.username}</p>
                            <p className="text-xs text-gray-500">Rank: {member.user?.rankPoints}</p>
                          </div>
                          {member.user?.id === team.creatorId && (
                            <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                              Creator
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {team.creatorId !== user?.id && (
                      <button
                        onClick={() => handleLeaveTeam(team.id)}
                        disabled={teamLoading}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50"
                      >
                        Leave Team
                      </button>
                    )}
                    {team.creatorId === user?.id && (
                      <button
                        onClick={() => handleDisbandTeam(team.id)}
                        disabled={teamLoading}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50"
                      >
                        Disband
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setActiveTab("browse");
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    >
                      Start Battle
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Team Tab */}
        {activeTab === "create" && (
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-6">Create New Team</h2>
            <form onSubmit={handleCreateTeam} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Code Warriors"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Team Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTeamSize(size)}
                      className={`py-2 px-4 rounded font-semibold transition-colors ${
                        teamSize === size
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {size}v{size}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={teamLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold disabled:opacity-50"
              >
                {teamLoading ? "Creating..." : "Create Team"}
              </button>
            </form>
          </div>
        )}

        {/* Join Team Tab */}
        {activeTab === "join" && (
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-6">Join Team</h2>
            <form onSubmit={handleJoinTeam} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Team Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit team code"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-blue-500"
                  maxLength="6"
                />
              </div>

              <button
                type="submit"
                disabled={teamLoading || joinCode.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold disabled:opacity-50"
              >
                {teamLoading ? "Joining..." : "Join Team"}
              </button>
            </form>

            <div className="mt-8 bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold mb-2">How it works:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Get a 6-digit team code from your teammates</li>
                <li>• Teams compete against each other</li>
                <li>• Solve coding problems as a team</li>
                <li>• First team to complete wins!</li>
              </ul>
            </div>
          </div>
        )}

        {/* Browse Battles Tab */}
        {activeTab === "browse" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBattles.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-400 text-lg">No active battles available</p>
              </div>
            ) : (
              activeBattles.map((battle) => (
                <div
                  key={battle.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-colors"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">{battle.team1?.name} vs {battle.team2?.name}</h3>
                    <p className="text-gray-400 text-sm">Problem: {battle.problem?.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900 p-3 rounded">
                      <p className="text-sm text-gray-400">Team 1</p>
                      <p className="font-semibold">{battle.team1?.members.length}/{battle.maxTeamSize}</p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded">
                      <p className="text-sm text-gray-400">Team 2</p>
                      <p className="font-semibold">{battle.team2?.members.length}/{battle.maxTeamSize}</p>
                    </div>
                  </div>

                  <button
                    className="w-full py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold"
                  >
                    Join Battle
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};