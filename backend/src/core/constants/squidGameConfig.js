// 🎮 squidGameConfig.js - Configuration for Squid Game tournament

class SquidGameConfig {
  static DIFFICULTY_PROGRESSION = [
  {
    round: 1,
    difficulty: "EASY",
    timeLimit: 3 * 60, // 20 minutes
    eliminationPercentage: 0.2 // Eliminate bottom 20%
  },
  {
    round: 2,
    difficulty: "EASY",
    timeLimit: 3 * 60, // 18 minutes
    eliminationPercentage: 0.25 // Eliminate bottom 25%
  },
  {
    round: 3,
    difficulty: "MEDIUM",
    timeLimit: 10 * 60, // 15 minutes
    eliminationPercentage: 0.33 // Eliminate bottom 33%
  },
  {
    round: 4,
    difficulty: "HARD",
    timeLimit: 12 * 60, // 12 minutes
    eliminationPercentage: 0.5 // Eliminate bottom 50%
  },
  {
    round: 5,
    difficulty: "HARD",
    timeLimit: 15 * 60, // 10 minutes
    eliminationPercentage: 1.0 // Last one standing wins
  }
  ];

  static SQUID_GAME_CONFIG = {
  DEFAULT_MAX_PLAYERS: 50,
  MIN_PLAYERS_TO_START: 2,
  SCORING: {
    PASSED_BASE: 100,
    TIME_BONUS_MAX: 50,
    TIME_BONUS_PER_100MS: 1,
    PARTIAL_PASS_MAX: 50
  },
  WEBSOCKET_EVENTS: {
    PLAYER_JOINED: "squid_game:player_joined",
    ROUND_STARTED: "squid_game:round_started",
    SUBMISSION_RECEIVED: "squid_game:submission_received",
    LEADERBOARD_UPDATED: "squid_game:leaderboard_updated",
    ROUND_ENDED: "squid_game:round_ended",
    PLAYERS_ELIMINATED: "squid_game:players_eliminated",
    TOURNAMENT_COMPLETED: "squid_game:tournament_completed"
  }
  };
}

export default SquidGameConfig;
