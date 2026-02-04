# Team Battle - Join Code Flow Implementation

## Overview

This document describes the **new join-code based tournament system** that replaces the direct team-to-team selection model. This flow allows **Team1 leaders** to create battles and generate join codes for **Team2 members** to join dynamically.

## Architecture

### Database Schema Changes

#### TeamBattle Model Updates:
```prisma
model TeamBattle {
  id              String   @id @default(cuid())
  battleCode      String   @unique
  joinCode        String   @unique  // NEW: 6-character join code for Team2
  team1Id         String
  team1           Team     @relation("Team1Battles", fields: [team1Id], references: [id])
  team2Id         String?  // Nullable until Team2 joins
  team2           Team?    @relation("Team2Battles", fields: [team2Id], references: [id])
  
  createdByUserId String  // NEW: Track which user (Team1 leader) created the battle
  createdByUser   User    @relation("CreatedTeamBattles", fields: [createdByUserId], references: [id])
  
  joinedByUserId  String? // NEW: Track which user (Team2 leader) joined
  joinedByUser    User?   @relation("JoinedTeamBattles", fields: [joinedByUserId], references: [id])
  
  maxTeamSize     Int
  status          BattleStatus @default(WAITING) // WAITING = awaiting Team2, ONGOING = both teams present
  matches         TeamBattleMatch[]
  submissions     TeamBattleSubmission[]
  createdAt       DateTime @default(now())
  startedAt       DateTime?
  completedAt     DateTime?
}

model User {
  // ... existing fields ...
  createdTeamBattles   TeamBattle[] @relation("CreatedTeamBattles")
  joinedTeamBattles    TeamBattle[] @relation("JoinedTeamBattles")
}
```

### API Endpoints

#### 1. **Create Battle** (Team1 Leader)
```
POST /team-battle/create
Authorization: Bearer token
Content-Type: application/json

Request:
{
  "team1Id": "team_uuid",
  "maxTeamSize": 2
}

Response (201):
{
  "id": "battle_uuid",
  "joinCode": "ABC123",
  "battleCode": "BC-123456",
  "team1Id": "team_uuid",
  "maxTeamSize": 2,
  "status": "WAITING_FOR_TEAM2",
  "message": "Battle created! Share this code with Team2: ABC123"
}
```

#### 2. **Get Available Battles** (Team2 Browse)
```
GET /team-battle/available

Response (200):
[
  {
    "id": "battle_uuid",
    "joinCode": "ABC123",
    "team1Name": "Alpha Squad",
    "createdBy": "user_name",
    "maxTeamSize": 2,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  ...
]
```

#### 3. **Join Battle** (Team2 Leader)
```
POST /team-battle/join
Authorization: Bearer token
Content-Type: application/json

Request:
{
  "joinCode": "ABC123",
  "team2Id": "team_uuid"
}

Response (200):
{
  "id": "battle_uuid",
  "status": "READY_TO_START",
  "message": "Team2 successfully joined! Battle is ready to start.",
  "team1": { /* team1 data */ },
  "team2": { /* team2 data */ }
}
```

### Service Layer

#### File: `backend/src/services/teamBattleNew.service.js`

**Key Functions:**

1. **createTeamBattleByLeaderService(userId, team1Id, maxTeamSize)**
   - Validates user is Team1 leader
   - Generates unique join code (6 characters, uppercase)
   - Creates TeamBattle with WAITING status
   - Returns join code for sharing

2. **getAvailableBattlesService()**
   - Returns all battles with status = WAITING
   - Filters for battles without Team2 assigned
   - Ordered by creation time (newest first)

3. **joinBattleWithCodeService(joinCode, userId, team2Id)**
   - Validates join code exists and is active
   - Validates user is Team2 leader
   - Validates Team2 has minimum required members
   - Updates battle with Team2 info
   - Changes status to ONGOING

4. **getBattleDetailsService(battleId)**
   - Returns full battle data with team and match info
   - Used for battle dashboard

5. **cancelBattleService(battleId, userId)**
   - Only callable by battle creator
   - Only before Team2 joins
   - Deletes the battle

### Controller Layer

#### File: `backend/src/controllers/teamBattleNew.controller.js`

Controllers handle HTTP request/response logic and validation:

1. `createTeamBattle` - Validates input, dispatches service
2. `getAvailableBattles` - Fetches and returns available battles
3. `joinTeamBattle` - Validates code/team, joins battle

### Frontend Implementation

#### Redux Thunks: `frontend/store/api/teamBattle.thunk.js`

```javascript
// Create battle with automatic join code generation
createTeamBattleByLeader({ team1Id, maxTeamSize })

// Browse available battles
getAvailableBattles()

// Join battle with code
joinTeamBattleWithCode({ joinCode, team2Id })
```

#### Redux Slice: `frontend/store/slices/teamBattle.slice.js`

New state properties:
- `currentBattle` - Active battle info
- `availableBattles` - List of joinable battles
- `joinCode` - Generated code for sharing

#### Components

**1. CreateBattleModal** (`CreateBattleModal.jsx`)
- Team1 leader creates battle
- Shows generated join code
- Allows copying code to clipboard
- Usage:
  ```jsx
  <CreateBattleModal
    isOpen={showCreateBattleModal}
    onClose={() => setShowCreateBattleModal(false)}
    teams={userTeams}
  />
  ```

**2. JoinBattleModal** (`JoinBattleModal.jsx`)
- Two modes: "Join with Code" or "Browse Battles"
- Teams can enter code directly or select from list
- Usage:
  ```jsx
  <JoinBattleModal
    isOpen={showJoinBattleModal}
    onClose={() => setShowJoinBattleModal(false)}
    teams={userTeams}
  />
  ```

**3. Main Page Buttons** (`TeamBattle.jsx`)
```jsx
<button onClick={() => setShowCreateBattleModal(true)}>
  ➕ Create Battle
</button>
<button onClick={() => setShowJoinBattleModal(true)}>
  🔗 Join Battle
</button>
```

## User Flow

### Team1 (Battle Creator) Flow:
```
1. Click "Create Battle" button
2. Select team (must be leader)
3. Choose team size (1v1, 2v2, 3v3, 4v4, 5v5)
4. System generates 6-char join code
5. User copies code and shares with Team2
6. Battle status: WAITING (waiting for Team2)
```

### Team2 (Battle Joiner) Flow:
```
Option A: Join with Code
1. Click "Join Battle" button
2. Switch to "Join with Code" tab
3. Select their team (must be leader)
4. Enter join code
5. System validates and adds Team2
6. Battle status changes to ONGOING

Option B: Browse Battles
1. Click "Join Battle" button
2. Switch to "Browse Battles" tab
3. Select their team
4. View available battles
5. Click "Join" on desired battle
6. Battle status changes to ONGOING
```

## Status Transitions

```
WAITING (default)
   ↓ (Team2 joins)
ONGOING (both teams present, ready to start)
   ↓ (Battle starts)
ONGOING (matches in progress)
   ↓ (All matches complete)
FINISHED (battle complete)
```

## Key Differences from Legacy System

| Aspect | Legacy | New Join-Code |
|--------|--------|---------------|
| **Pairing** | Admin selects both teams | Team1 creates, Team2 joins |
| **Code Gen** | Battle code only | Both join code and battle code |
| **Flexibility** | Fixed matchups | Dynamic Team2 selection |
| **Scalability** | Limited to pre-defined matchups | Open for many Team2 options |
| **UI/UX** | Single creation form | Separate create/join modals |
| **Discovery** | Limited | Browse available battles |

## Validation Rules

### Create Battle Validation:
- User must be Team1 leader ✓
- Team size: 1-5 ✓
- Join code must be unique ✓
- Battle code must be unique ✓

### Join Battle Validation:
- Join code must exist ✓
- Battle must be in WAITING status ✓
- Team2 not yet assigned ✓
- User must be Team2 leader ✓
- Team2 members ≥ maxTeamSize ✓

## Error Handling

### Create Battle Errors:
```
"Team not found" - Invalid team1Id
"Only team leaders can create battles" - User not authorized
"Failed to generate unique join code" - Code generation collision
```

### Join Battle Errors:
```
"Invalid join code" - Code doesn't exist
"This battle is no longer available to join" - Status not WAITING
"Team2 has already joined this battle" - Already joined
"Team not found" - Invalid team2Id
"Only team leaders can join battles" - User not authorized
"Team2 must have at least X members" - Insufficient team size
```

## Database Migration

Run migration to apply schema changes:
```bash
npx prisma db push  # Direct schema push (used here)
# OR
npx prisma migrate dev --name add_team_battle_join_code  # Create migration
```

## Testing Checklist

- [ ] Team1 leader can create battle
- [ ] Join code is 6 characters, uppercase
- [ ] Multiple battles have unique codes
- [ ] Available battles endpoint returns waiting battles
- [ ] Team2 leader can join with valid code
- [ ] Team2 leader cannot join with invalid code
- [ ] Team2 cannot join if Team1 already joined
- [ ] Team2 cannot join with insufficient members
- [ ] Non-leaders cannot create/join battles
- [ ] Battle status transitions correctly
- [ ] Frontend modals open/close correctly
- [ ] Join code can be copied to clipboard
- [ ] Browse battles shows multiple options

## Future Enhancements

1. **Real-time Updates** - Socket.IO for live join notifications
2. **Battle Expiration** - Auto-cancel battles after X time
3. **Custom Rules** - Allow Team1 to set difficulty level
4. **Invitations** - Direct team invites vs. open browsing
5. **Statistics** - Track accepted/rejected join codes
6. **Ratings** - Sort battles by team ratings
7. **Notifications** - In-app alerts for join requests
