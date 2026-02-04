# 🚀 Quick Start Guide: New Team Battle System

## What Changed?

The team battle system now uses a **join-code flow** instead of direct team matching:

```
OLD FLOW:             NEW FLOW:
Admin creates match   Team1 creates battle + join code
  ↓                     ↓
Team1 vs Team2      Team2 joins with code
  ↓                     ↓
Battle starts       Battle starts when both teams joined
```

## Installation

### Backend (Already Configured)
No additional installation needed. The service, controller, and routes are already set up.

Database migration is complete:
```bash
cd backend
npx prisma db push  # Already executed
```

### Frontend (Already Configured)
Redux thunks, slices, and components are ready to use.

## Testing the Feature

### Step 1: Start the Application
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

### Step 2: Create a Team Battle (Team1)
1. Navigate to Team Battle page
2. Click **"➕ Create Battle"** button (bottom-right)
3. Select your team from dropdown
4. Choose team size (1v1, 2v2, etc.)
5. Click "Create Battle"
6. ✅ Join code appears - **copy it!**

### Step 3: Join Battle (Team2)
1. Click **"🔗 Join Battle"** button (bottom-right)
2. **Option A**: "Join with Code"
   - Enter the join code you copied
   - Select your team
   - Click "Join Battle"
3. **Option B**: "Browse Battles"
   - View available battles
   - Select your team
   - Click "Join" on a battle
4. ✅ Battle status changes to READY

## API Quick Reference

### Create Battle
```bash
curl -X POST http://localhost:5000/team-battle/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "team1Id": "team_uuid",
    "maxTeamSize": 2
  }'
```

### Get Available Battles
```bash
curl http://localhost:5000/team-battle/available
```

### Join Battle
```bash
curl -X POST http://localhost:5000/team-battle/join \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "joinCode": "ABC123",
    "team2Id": "team_uuid"
  }'
```

## Key Files

### Backend
- **Service**: `backend/src/services/teamBattleNew.service.js`
  - `createTeamBattleByLeaderService()`
  - `joinBattleWithCodeService()`
  - `getAvailableBattlesService()`

- **Controller**: `backend/src/controllers/teamBattleNew.controller.js`
  - `createTeamBattle()`
  - `joinTeamBattle()`
  - `getAvailableBattles()`

- **Routes**: `backend/src/routes/teamBattle.route.js`
  - `POST /team-battle/create`
  - `POST /team-battle/join`
  - `GET /team-battle/available`

### Frontend
- **Components**: 
  - `frontend/src/components/TeamBattle/CreateBattleModal.jsx`
  - `frontend/src/components/TeamBattle/JoinBattleModal.jsx`

- **Redux**:
  - `frontend/store/api/teamBattle.thunk.js` (3 new thunks)
  - `frontend/store/slices/teamBattle.slice.js` (3 new handlers)

- **Main Page**: `frontend/src/pages/TeamBattle.jsx`
  - Integrated modals
  - Added action buttons

## Common Issues & Solutions

### Issue: "Invalid join code"
**Solution**: Make sure you:
- Copied the code correctly (case-sensitive uppercase)
- The code hasn't expired (battles auto-expire after timeout)
- The battle creator didn't cancel the battle

### Issue: "Only team leaders can join"
**Solution**: Join with a user account that is marked as team leader

### Issue: "Team must have at least X members"
**Solution**: Add more members to your team before joining

### Issue: Join code not generated
**Solution**: Make sure you:
- Selected a team
- Selected a valid team size
- Clicked "Create Battle" button (not just filled the form)

## Success Criteria ✅

The feature is working correctly when you can:

- [x] Team1 leader creates a battle
- [x] System generates a 6-character join code
- [x] Join code is unique and copyable
- [x] Team2 leader can join with the code
- [x] Team2 leader can browse available battles
- [x] Battle status changes from WAITING to ONGOING
- [x] Both modals open/close properly
- [x] Error messages are clear and helpful
- [x] No console errors or crashes

## Documentation

For complete documentation, see:
- **Architecture**: `backend/TEAM_BATTLE_JOIN_CODE_FLOW.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`

## Need Help?

Check the documentation files:
1. **API Details**: `backend/TEAM_BATTLE_JOIN_CODE_FLOW.md` → "API Endpoints" section
2. **Database Schema**: `backend/TEAM_BATTLE_JOIN_CODE_FLOW.md` → "Database Schema Changes"
3. **User Flows**: `backend/TEAM_BATTLE_JOIN_CODE_FLOW.md` → "User Flow"
4. **Implementation Details**: `IMPLEMENTATION_SUMMARY.md` → "Highlights" & "Testing Recommendations"

---

**Status**: ✅ Ready for Testing  
**Last Updated**: January 2024
