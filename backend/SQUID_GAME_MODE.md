# 🎮 SQUID GAME MODE - DOCUMENTATION

## Overview

Squid Game Mode is an elimination-style coding tournament where up to 50 players compete across 5 rounds with increasing difficulty. Players must solve coding problems against the clock. After each round, the bottom performers are eliminated until only 1 winner remains.

**Key Features:**
- ✅ 50-player elimination tournament bracket
- ✅ 5 rounds with difficulty progression (EASY → HARD)
- ✅ Real-time scoring and leaderboard updates
- ✅ Automatic player elimination based on performance
- ✅ WebSocket integration for real-time events
- ✅ Score calculation based on correctness, speed, and test case coverage

---

## Tournament Progression

### Round Structure

| Round | Difficulty | Time Limit | Elimination |
|-------|-----------|-----------|------------|
| 1     | EASY      | 20 min    | Bottom 20% |
| 2     | EASY      | 18 min    | Bottom 25% |
| 3     | MEDIUM    | 15 min    | Bottom 33% |
| 4     | HARD      | 12 min    | Bottom 50% |
| 5     | HARD      | 10 min    | Last one standing |

**Example: 50 players**
- Round 1: 50 → 40 players remain (10 eliminated)
- Round 2: 40 → 30 players remain (10 eliminated)
- Round 3: 30 → 20 players remain (10 eliminated)
- Round 4: 20 → 10 players remain (10 eliminated)
- Round 5: 10 → 1 player remains (1 WINNER!)

---

## API Endpoints

### 1. Create Tournament

**POST** `/api/squid-game`

```json
{
  "name": "Epic Squid Game Battle",
  "maxPlayers": 50
}
```

**Response:**
```json
{
  "message": "Tournament created successfully",
  "tournament": {
    "id": "uuid-here",
    "name": "Epic Squid Game Battle",
    "status": "REGISTRATION",
    "maxPlayers": 50,
    "currentRound": 0,
    "totalRounds": 5,
    "startedAt": null,
    "completedAt": null,
    "participants": []
  }
}
```

---

### 2. Join Tournament

**POST** `/api/squid-game/join`

```json
{
  "squidGameId": "tournament-id-here"
}
```

**Response:**
```json
{
  "message": "Joined tournament successfully",
  "participant": {
    "id": "participant-id",
    "userId": "user-id",
    "status": "ACTIVE",
    "totalScore": 0,
    "roundScores": [],
    "joinedAt": "2026-02-06T10:30:00Z"
  },
  "totalPlayers": 45,
  "maxPlayers": 50
}
```

---

### 3. Get Tournament Status

**GET** `/api/squid-game/:squidGameId`

**Response:**
```json
{
  "id": "tournament-id",
  "name": "Epic Squid Game",
  "status": "ROUND_ACTIVE",
  "maxPlayers": 50,
  "currentRound": 3,
  "totalRounds": 5,
  "startedAt": "2026-02-06T10:00:00Z",
  "participants": [
    {
      "id": "participant-id",
      "userId": "user-id",
      "user": { "id": "user-id", "username": "player123" },
      "status": "ACTIVE",
      "totalScore": 245,
      "roundsEliminated": 0
    }
  ],
  "roundProblems": [
    {
      "id": "round-id",
      "roundNumber": 3,
      "difficulty": "MEDIUM",
      "timeLimit": 900,
      "playersAtStart": 30,
      "playersEliminated": 0
    }
  ]
}
```

---

### 4. Start Tournament

**POST** `/api/squid-game/start`

```json
{
  "squidGameId": "tournament-id-here"
}
```

**Response:**
```json
{
  "message": "Tournament started",
  "tournament": {
    "id": "tournament-id",
    "status": "ROUND_ACTIVE",
    "currentRound": 1,
    "startedAt": "2026-02-06T10:30:00Z"
  }
}
```

---

### 5. Submit Solution

**POST** `/api/squid-game/submit`

```json
{
  "squidGameId": "tournament-id",
  "code": "function solve(n) { return n * 2; }",
  "language": "javascript",
  "status": "PASSED",
  "executionTimeMs": 45,
  "testCasesPassed": 5,
  "totalTestCases": 5
}
```

**Response:**
```json
{
  "message": "Solution submitted",
  "submission": {
    "id": "submission-id",
    "code": "function solve(n) { return n * 2; }",
    "language": "javascript",
    "status": "PASSED",
    "score": 149,
    "executionTimeMs": 45,
    "testCasesPassed": 5,
    "totalTestCases": 5,
    "submittedAt": "2026-02-06T10:35:00Z"
  }
}
```

---

### 6. End Round & Eliminate Players

**POST** `/api/squid-game/end-round`

```json
{
  "squidGameId": "tournament-id"
}
```

**Response (Round not finished):**
```json
{
  "roundEnded": true,
  "tournamentEnded": false,
  "eliminatedCount": 10,
  "remainingPlayers": 20,
  "nextRound": 4,
  "leaderboard": [
    {
      "rank": 1,
      "participantId": "p-id",
      "userId": "user-id",
      "username": "topPlayer",
      "score": 285,
      "status": "PASSED"
    }
  ]
}
```

**Response (Tournament finished):**
```json
{
  "roundEnded": true,
  "tournamentEnded": true,
  "eliminatedCount": 9,
  "remainingPlayers": 1,
  "winner": "victorious_warrior",
  "leaderboard": [
    {
      "rank": 1,
      "participantId": "p-id",
      "userId": "winner-id",
      "username": "victorious_warrior",
      "score": 450,
      "status": "PASSED"
    }
  ]
}
```

---

### 7. Get Leaderboard

**GET** `/api/squid-game/:squidGameId/leaderboard`

**Response:**
```json
{
  "currentLeaderboard": [
    {
      "rank": 1,
      "userId": "user-1",
      "username": "player1",
      "totalScore": 350,
      "status": "ACTIVE",
      "roundsSurvived": 0
    },
    {
      "rank": 2,
      "userId": "user-2",
      "username": "player2",
      "totalScore": 320,
      "status": "ACTIVE",
      "roundsSurvived": 0
    }
  ]
}
```

---

### 8. Get User Tournament History

**GET** `/api/squid-game/history/my`

**Response:**
```json
{
  "message": "User tournament history",
  "tournaments": [
    {
      "tournamentId": "tournament-id",
      "tournamentName": "Epic Squid Game",
      "status": "WINNER",
      "totalScore": 450,
      "roundsSurvived": 5,
      "joinedAt": "2026-02-06T10:00:00Z",
      "eliminatedAt": null
    }
  ]
}
```

---

## Scoring System

### Points Calculation

**For PASSED submissions:**
- Base score: **100 points**
- Time bonus: Up to **50 points** (faster execution = more points)
  - Formula: `max(0, 50 - floor(executionTimeMs / 100))`
- **Maximum possible: 150 points per submission**

**For PARTIAL passes:**
- Points: `50 * (testCasesPassed / totalTestCases)`
- Maximum: **50 points**

**For FAILED/ERROR/TIMEOUT:**
- **0 points**

### Leaderboard Ranking

Players are ranked by:
1. **Status**: PASSED submissions ranked before FAILED/PARTIAL
2. **Score**: Higher scores ranked first
3. **Time**: Faster solutions ranked first (tiebreaker)

---

## WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:4000', {
  path: '/socket.io/'
});

const squidGameSocket = io('http://localhost:4000/squid-game', {
  path: '/socket.io/'
});
```

### Events to Listen

#### 1. Player Joined Tournament

```javascript
squidGameSocket.on('squid_game:player_joined', (data) => {
  console.log('Player joined!', data.message);
  // Update UI to show new player count
});
```

#### 2. Submission Received

```javascript
squidGameSocket.on('squid_game:submission_received', (data) => {
  console.log('Submission received from player', data.userId);
  console.log('Score:', data.score);
  // Show real-time submission feedback
});
```

#### 3. Leaderboard Updated

```javascript
squidGameSocket.on('squid_game:leaderboard_updated', (data) => {
  console.log('Leaderboard:', data.leaderboard);
  // Update live leaderboard display
});
```

#### 4. Round Started

```javascript
squidGameSocket.on('squid_game:round_started', (data) => {
  console.log('Round', data.roundNumber, 'started!');
  console.log('Problem:', data.problem.title);
  console.log('Time limit:', data.timeLimit, 'seconds');
  // Display problem and start timer
});
```

#### 5. Round Ended

```javascript
squidGameSocket.on('squid_game:round_ended', (data) => {
  console.log('Round ended!');
  console.log('Eliminated:', data.eliminatedCount, 'players');
  console.log('Remaining:', data.remainingPlayers);
  // Show elimination results
});
```

#### 6. Players Eliminated

```javascript
squidGameSocket.on('squid_game:players_eliminated', (data) => {
  console.log(data.eliminatedCount, 'players eliminated!');
  console.log('Remaining:', data.remainingPlayers);
  // Show dramatic elimination screen
});
```

#### 7. Tournament Completed

```javascript
squidGameSocket.on('squid_game:tournament_completed', (data) => {
  console.log('🏆 Winner:', data.winner);
  // Display winner announcement
});
```

### Events to Emit

#### Join Tournament

```javascript
squidGameSocket.emit('squid_game:join_tournament', {
  squidGameId: 'tournament-id',
  userId: 'user-id'
});
```

#### Submit Solution

```javascript
squidGameSocket.emit('squid_game:submit_solution', {
  squidGameId: 'tournament-id',
  userId: 'user-id',
  code: 'const solve = (n) => n * 2;',
  language: 'javascript',
  status: 'PASSED',
  executionTimeMs: 45,
  testCasesPassed: 5,
  totalTestCases: 5
});
```

#### Request Leaderboard

```javascript
squidGameSocket.emit('squid_game:request_leaderboard', {
  squidGameId: 'tournament-id'
});
```

#### End Round

```javascript
squidGameSocket.emit('squid_game:end_round', {
  squidGameId: 'tournament-id'
});
```

---

## Frontend Integration Example (React)

```jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function SquidGameTournament({ tournamentId, userId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to Squid Game namespace
    const squidGameSocket = io('http://localhost:4000/squid-game');
    setSocket(squidGameSocket);

    // Join tournament
    squidGameSocket.emit('squid_game:join_tournament', {
      squidGameId: tournamentId,
      userId: userId
    });

    // Listen for leaderboard updates
    squidGameSocket.on('squid_game:leaderboard_updated', (data) => {
      setLeaderboard(data.leaderboard);
    });

    // Listen for round start
    squidGameSocket.on('squid_game:round_started', (data) => {
      setCurrentRound(data.roundNumber);
    });

    return () => squidGameSocket.close();
  }, [tournamentId, userId]);

  const submitSolution = (code, language, status, executionTimeMs, testCasesPassed, totalTestCases) => {
    socket.emit('squid_game:submit_solution', {
      squidGameId: tournamentId,
      userId: userId,
      code,
      language,
      status,
      executionTimeMs,
      testCasesPassed,
      totalTestCases
    });
  };

  return (
    <div className="squid-game-container">
      <h1>Squid Game Round {currentRound}</h1>
      <div className="leaderboard">
        {leaderboard.map((player, idx) => (
          <div key={idx} className="leaderboard-entry">
            <span>#{player.rank}</span>
            <span>{player.username}</span>
            <span>{player.totalScore} pts</span>
          </div>
        ))}
      </div>
      <CodeEditor onSubmit={submitSolution} />
    </div>
  );
}

export default SquidGameTournament;
```

---

## Edge Cases & Error Handling

### Tournament Not in Registration Phase
```json
{
  "message": "Tournament is not accepting new players"
}
```

### Tournament Full
```json
{
  "message": "Tournament is full"
}
```

### Insufficient Players to Start
```json
{
  "message": "Not enough players to start tournament"
}
```

### User Already Joined
```json
{
  "message": "User already joined this tournament"
}
```

### Missing Test Cases
```json
{
  "message": "No MEDIUM problems available"
}
```

---

## Game Flow Diagram

```
REGISTRATION → START → ROUND 1 (50 players) → ELIMINATION (40 remain)
                                ↓
                          ROUND 2 (40 players) → ELIMINATION (30 remain)
                                ↓
                          ROUND 3 (30 players) → ELIMINATION (20 remain)
                                ↓
                          ROUND 4 (20 players) → ELIMINATION (10 remain)
                                ↓
                          ROUND 5 (10 players) → ELIMINATION (1 WINNER!)
                                ↓
                          TOURNAMENT COMPLETED 🏆
```

---

## Future Enhancements

- [ ] Spectator mode for eliminated players
- [ ] Player statistics and analytics
- [ ] Achievement badges (speed demon, perfect run, etc.)
- [ ] Replay system to watch other solutions
- [ ] Difficulty adjustments based on player performance
- [ ] Seasonal tournaments with rankings

---

## Support

For issues or questions, contact the development team or open an issue on the repository.

**Happy coding! May the best coder win! 🎮🏆**
