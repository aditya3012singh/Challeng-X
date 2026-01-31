// • Fetch ranking data

import { getLeaderboard } from "../services/leaderboard.service.js";

export async function fetchLeaderboard(req, res) {
  try {
    const leaderboard = await getLeaderboard();
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
