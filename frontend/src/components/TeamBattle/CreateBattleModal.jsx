import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createTeamBattleByLeader } from "../../../store/api/teamBattle.thunk";
import "./TeamBattleModals.css";

export const CreateBattleModal = ({ isOpen, onClose, teams }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.teamBattle);
  const [team1Id, setTeam1Id] = useState("");
  const [maxTeamSize, setMaxTeamSize] = useState(2);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team1Id) {
      alert("Please select a team");
      return;
    }

    const result = await dispatch(
      createTeamBattleByLeader({ team1Id, maxTeamSize })
    );

    if (result.payload?.id) {
      // Navigate to battle room
      onClose();
      navigate(`/battle-room/${result.payload.id}`);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    alert("Join code copied!");
  };

  if (!isOpen) return null;

  return (
    <div className="team-battle-modal-overlay" onClick={onClose}>
      <div className="team-battle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{showJoinCode ? "Share Join Code" : "Create Team Battle"}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {showJoinCode ? (
            <div className="join-code-display">
              <p className="join-code-label">Your team battle is ready!</p>
              <div className="join-code-box">
                <span className="join-code-text">{joinCode}</span>
                <button
                  className="copy-btn"
                  onClick={handleCopyCode}
                  title="Copy join code"
                >
                  📋
                </button>
              </div>
              <p className="join-code-instruction">
                Share this code with Team2 so they can join your battle
              </p>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowJoinCode(false);
                  onClose();
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="team1">Select Your Team</label>
                <select
                  id="team1"
                  value={team1Id}
                  onChange={(e) => setTeam1Id(e.target.value)}
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

              <div className="form-group">
                <label htmlFor="teamSize">Team Size (per side)</label>
                <select
                  id="teamSize"
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                >
                  <option value={1}>1v1</option>
                  <option value={2}>2v2</option>
                  <option value={3}>3v3</option>
                  <option value={4}>4v4</option>
                  <option value={5}>5v5</option>
                </select>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Battle"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
