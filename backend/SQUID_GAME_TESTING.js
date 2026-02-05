// 🧪 squidGame.test.js - Quick Testing Guide for Squid Game Mode

/**
 * TEST FLOW:
 * 1. Create Tournament
 * 2. Join Tournament (multiple times)
 * 3. Start Tournament
 * 4. Submit Solutions
 * 5. End Round
 * 6. Check Leaderboard
 * 7. Repeat rounds until winner
 */

// USING POSTMAN OR CURL

// ============================================
// 1. CREATE TOURNAMENT
// ============================================
/*
POST http://localhost:4000/api/squid-game
Headers: 
  - Authorization: Bearer <your-jwt-token>
  - Content-Type: application/json

Body:
{
  "name": "Ultimate Squid Game Battle",
  "maxPlayers": 50
}

Expected Response:
{
  "message": "Tournament created successfully",
  "tournament": {
    "id": "tournament-uuid",
    "name": "Ultimate Squid Game Battle",
    "status": "REGISTRATION",
    "maxPlayers": 50,
    "currentRound": 0,
    "totalRounds": 5,
    "participants": []
  }
}

SAVE: tournament-uuid as TOURNAMENT_ID
*/

// ============================================
// 2. JOIN TOURNAMENT (10+ times with different users)
// ============================================
/*
POST http://localhost:4000/api/squid-game/join
Headers: 
  - Authorization: Bearer <jwt-token-for-user-1>
  - Content-Type: application/json

Body:
{
  "squidGameId": "TOURNAMENT_ID"
}

Expected Response:
{
  "message": "Joined tournament successfully",
  "participant": { ... },
  "totalPlayers": 1,
  "maxPlayers": 50
}

💡 Repeat with different user tokens for each join
   (You need at least 2 players, ideally 50 for full testing)
*/

// ============================================
// 3. GET TOURNAMENT STATUS
// ============================================
/*
GET http://localhost:4000/api/squid-game/TOURNAMENT_ID
Headers: 
  - Authorization: Bearer <jwt-token>

Expected Response:
{
  "id": "TOURNAMENT_ID",
  "status": "REGISTRATION",
  "participants": [
    { userId, username, status, totalScore, roundsEliminated }
  ]
}

Check that all joined players are listed!
*/

// ============================================
// 4. START TOURNAMENT
// ============================================
/*
POST http://localhost:4000/api/squid-game/start
Headers: 
  - Authorization: Bearer <jwt-token>
  - Content-Type: application/json

Body:
{
  "squidGameId": "TOURNAMENT_ID"
}

Expected Response:
{
  "message": "Tournament started",
  "tournament": {
    "status": "ROUND_ACTIVE",
    "currentRound": 1,
    "startedAt": "2026-02-06T..."
  }
}

💡 Tournament now in ROUND_ACTIVE status
   Round 1 problem should be EASY difficulty
*/

// ============================================
// 5. SUBMIT SOLUTIONS (from different users)
// ============================================
/*
POST http://localhost:4000/api/squid-game/submit
Headers: 
  - Authorization: Bearer <jwt-token-for-player>
  - Content-Type: application/json

Body:
{
  "squidGameId": "TOURNAMENT_ID",
  "code": "function solve(n) { return n * 2; }",
  "language": "javascript",
  "status": "PASSED",
  "executionTimeMs": 45,
  "testCasesPassed": 5,
  "totalTestCases": 5
}

Expected Response:
{
  "message": "Solution submitted",
  "submission": {
    "id": "submission-id",
    "status": "PASSED",
    "score": 149,  // 100 + 49 time bonus
    "submittedAt": "..."
  }
}

💡 Submit from multiple players with different scores:
   - Player 1: PASSED, 45ms → ~150 points
   - Player 2: PASSED, 500ms → ~100 points
   - Player 3: FAILED, 1000ms → 0 points
   - Player 4: PASSED (4/5 cases), 100ms → 40 points
*/

// ============================================
// 6. GET LEADERBOARD
// ============================================
/*
GET http://localhost:4000/api/squid-game/TOURNAMENT_ID/leaderboard
Headers: 
  - Authorization: Bearer <jwt-token>

Expected Response:
{
  "currentLeaderboard": [
    {
      "rank": 1,
      "userId": "user-1",
      "username": "topPlayer",
      "totalScore": 150,
      "status": "ACTIVE",
      "roundsSurvived": 0
    },
    {
      "rank": 2,
      "userId": "user-2",
      "username": "player2",
      "totalScore": 100,
      "status": "ACTIVE",
      "roundsSurvived": 0
    }
  ]
}

💡 Verify leaderboard is sorted by score (highest first)
   Verify all submitted players are here
*/

// ============================================
// 7. END ROUND & ELIMINATE PLAYERS
// ============================================
/*
POST http://localhost:4000/api/squid-game/end-round
Headers: 
  - Authorization: Bearer <jwt-token>
  - Content-Type: application/json

Body:
{
  "squidGameId": "TOURNAMENT_ID"
}

Expected Response (if not final round):
{
  "roundEnded": true,
  "tournamentEnded": false,
  "eliminatedCount": 3,           // 20% of 15 players
  "remainingPlayers": 12,
  "nextRound": 2,
  "leaderboard": [...]
}

Expected Response (if final round):
{
  "roundEnded": true,
  "tournamentEnded": true,
  "eliminatedCount": 9,
  "remainingPlayers": 1,
  "winner": "topPlayer",
  "leaderboard": [...]
}

💡 Verify:
   - Bottom players are marked as ELIMINATED
   - Correct number eliminated based on round
   - Tournament moves to next round (or completes)
   - Winner has highest score
*/

// ============================================
// 8. USER TOURNAMENT HISTORY
// ============================================
/*
GET http://localhost:4000/api/squid-game/history/my
Headers: 
  - Authorization: Bearer <jwt-token-of-player>

Expected Response:
{
  "message": "User tournament history",
  "tournaments": [
    {
      "tournamentId": "TOURNAMENT_ID",
      "tournamentName": "Ultimate Squid Game Battle",
      "status": "WINNER",        // or "ELIMINATED" or "ACTIVE"
      "totalScore": 450,
      "roundsSurvived": 5,
      "joinedAt": "2026-02-06T...",
      "eliminatedAt": null
    }
  ]
}

💡 Check that user's tournament appears with correct status
*/

// ============================================
// WEBSOCKET TESTING (using socket.io-client)
// ============================================

import io from 'socket.io-client';

const squidGameSocket = io('http://localhost:4000/squid-game');

// Listen for player join
squidGameSocket.on('squid_game:player_joined', (data) => {
  console.log('🎮 Player joined tournament!', data);
});

// Join tournament
squidGameSocket.emit('squid_game:join_tournament', {
  squidGameId: 'TOURNAMENT_ID',
  userId: 'user-uuid'
});

// Listen for submission received
squidGameSocket.on('squid_game:submission_received', (data) => {
  console.log('📝 Submission received:', data.userId, 'Score:', data.score);
});

// Submit solution via socket
squidGameSocket.emit('squid_game:submit_solution', {
  squidGameId: 'TOURNAMENT_ID',
  userId: 'user-uuid',
  code: 'const solve = n => n * 2;',
  language: 'javascript',
  status: 'PASSED',
  executionTimeMs: 30,
  testCasesPassed: 5,
  totalTestCases: 5
});

// Listen for leaderboard updates
squidGameSocket.on('squid_game:leaderboard_updated', (data) => {
  console.log('📊 Leaderboard updated:', data.leaderboard);
});

// Request leaderboard
squidGameSocket.emit('squid_game:request_leaderboard', {
  squidGameId: 'TOURNAMENT_ID'
});

// Listen for round ended
squidGameSocket.on('squid_game:round_ended', (data) => {
  console.log('🔚 Round ended!', data.eliminatedCount, 'eliminated');
});

// Listen for players eliminated
squidGameSocket.on('squid_game:players_eliminated', (data) => {
  console.log('⚠️ Players eliminated:', data.eliminatedCount);
  console.log('Remaining:', data.remainingPlayers);
});

// Listen for tournament completed
squidGameSocket.on('squid_game:tournament_completed', (data) => {
  console.log('🏆 WINNER:', data.winner);
  console.log('Final leaderboard:', data.finalLeaderboard);
});

// End round via socket
squidGameSocket.emit('squid_game:end_round', {
  squidGameId: 'TOURNAMENT_ID'
});

// ============================================
// EXPECTED TEST RESULTS
// ============================================

/*
✅ Tournament created with 50 max players
✅ 10+ players can join tournament
✅ Tournament starts in ROUND_ACTIVE status
✅ Players can submit solutions
✅ Submissions show correct scores (100-150 for PASSED)
✅ Leaderboard shows players sorted by score
✅ Bottom 20% eliminated in Round 1
✅ Round 2 difficulty is EASY with 18 min time
✅ Round 3 difficulty is MEDIUM with 15 min time
✅ Round 4 difficulty is HARD with 12 min time
✅ Round 5 difficulty is HARD with 10 min time
✅ Bottom 50% eliminated in Round 4
✅ Last player standing becomes WINNER
✅ Tournament status changes to COMPLETED
✅ WebSocket events emit correctly for all actions
✅ User history shows tournament with WINNER status
*/
