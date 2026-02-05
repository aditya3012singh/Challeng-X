import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAvailableBattles, joinTeamBattleWithCode } from "../../../store/api/teamBattle.thunk";
import "./TeamBattleModals.css";

export const JoinBattleModal = ({ isOpen, onClose, teams }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.teamBattle);
  const { availableBattles } = useSelector((state) => state.teamBattle);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [joinMethod, setJoinMethod] = useState("code"); // "code" or "browse"
  const [selectedBattle, setSelectedBattle] = useState(null);

  useEffect(() => {
    if (isOpen && joinMethod === "browse") {
      dispatch(getAvailableBattles());
    }
  }, [isOpen, joinMethod, dispatch]);

  const handleJoinWithCode = async (e) => {
    e.preventDefault();
    if (!joinCodeInput || !team2Id) {
      alert("Please enter join code and select a team");
      return;
    }

    const result = await dispatch(
      joinTeamBattleWithCode({
        joinCode: joinCodeInput.toUpperCase(),
        team2Id,
      })
    );
    
    if (result.payload?.id) {
      onClose();
      navigate(`/battle-room/${result.payload.id}`);
    }
  };

  const handleJoinBattle = async (battleId) => {
    if (!team2Id) {
      alert("Please select a team first");
      return;
    }

    const battle = availableBattles.find((b) => b.id === battleId);
    if (battle) {
      const result = await dispatch(
        joinTeamBattleWithCode({
          joinCode: battle.joinCode,
          team2Id,
        })
      );
      
      if (result.payload?.id) {
        onClose();
        navigate(`/battle-room/${result.payload.id}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="team-battle-modal-overlay" onClick={onClose}>
      <div className="team-battle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Join Team Battle</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${joinMethod === "code" ? "active" : ""}`}
            onClick={() => setJoinMethod("code")}
          >
            Join with Code
          </button>
          <button
            className={`tab-btn ${joinMethod === "browse" ? "active" : ""}`}
            onClick={() => setJoinMethod("browse")}
          >
            Browse Battles
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="team2">Select Your Team</label>
            <select
              id="team2"
              value={team2Id}
              onChange={(e) => setTeam2Id(e.target.value)}
              required
            >
              <option value="">-- Choose a team --</option>
              {teams?.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.members?.length || 0} members)
                </option>
              ))}
            </select>
          </div>

          {joinMethod === "code" ? (
            <form onSubmit={handleJoinWithCode}>
              <div className="form-group">
                <label htmlFor="joinCode">Join Code</label>
                <input
                  id="joinCode"
                  type="text"
                  placeholder="e.g., ABC123"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  maxLength="6"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Joining..." : "Join Battle"}
              </button>
            </form>
          ) : (
            <div className="available-battles">
              {availableBattles?.length === 0 ? (
                <p className="no-battles">No available battles at the moment</p>
              ) : (
                availableBattles.map((battle) => (
                  <div key={battle.id} className="battle-card">
                    <div className="battle-info">
                      <h3>{battle.team1Name}</h3>
                      <p>Created by: {battle.createdBy}</p>
                      <p className="team-size">
                        {battle.maxTeamSize}v{battle.maxTeamSize}
                      </p>
                    </div>
                    <div className="battle-code">Code: {battle.joinCode}</div>
                    <button
                      className="btn-primary"
                      onClick={() => handleJoinBattle(battle.id)}
                      disabled={loading}
                    >
                      {loading ? "Joining..." : "Join"}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
