#!/bin/bash
# 🎮 SQUID_GAME_QUICK_START.sh - Quick test commands

# ============================================
# SETUP
# ============================================
# 1. Replace YOUR_JWT_TOKEN with an actual JWT token from login
# 2. Replace TOURNAMENT_ID with the ID returned from create
# 3. Run commands in order

BASE_URL="${BASE_URL:-http://localhost:4000}"
JWT_TOKEN="${JWT_TOKEN:-your-jwt-token-here}"
TOURNAMENT_ID="${TOURNAMENT_ID:-}"

# ============================================
# 1. CREATE TOURNAMENT
# ============================================
echo "🎮 Creating tournament..."
curl -X POST "$BASE_URL/api/squid-game" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Epic Squid Game Battle",
    "maxPlayers": 50
  }' | jq .

# SAVE: tournament.id as TOURNAMENT_ID
# Example: TOURNAMENT_ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# ============================================
# 2. JOIN TOURNAMENT (repeat with different users)
# ============================================
echo ""
echo "👥 Joining tournament (run multiple times with different users)..."
curl -X POST "$BASE_URL/api/squid-game/join" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"squidGameId\": \"$TOURNAMENT_ID\"
  }" | jq .

# ============================================
# 3. GET TOURNAMENT STATUS
# ============================================
echo ""
echo "📊 Getting tournament status..."
curl -X GET "$BASE_URL/api/squid-game/$TOURNAMENT_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .

# ============================================
# 4. START TOURNAMENT
# ============================================
echo ""
echo "🚀 Starting tournament..."
curl -X POST "$BASE_URL/api/squid-game/start" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"squidGameId\": \"$TOURNAMENT_ID\"
  }" | jq .

# ============================================
# 5. SUBMIT SOLUTION (Winning submission)
# ============================================
echo ""
echo "📝 Submitting PASSED solution..."
curl -X POST "$BASE_URL/api/squid-game/submit" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"squidGameId\": \"$TOURNAMENT_ID\",
    \"code\": \"function solve(n) { return n * 2; }\",
    \"language\": \"javascript\",
    \"status\": \"PASSED\",
    \"executionTimeMs\": 45,
    \"testCasesPassed\": 5,
    \"totalTestCases\": 5
  }" | jq .

# ============================================
# 6. SUBMIT SOLUTION (Failing submission)
# ============================================
echo ""
echo "📝 Submitting FAILED solution..."
curl -X POST "$BASE_URL/api/squid-game/submit" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"squidGameId\": \"$TOURNAMENT_ID\",
    \"code\": \"function solve(n) { return 0; }\",
    \"language\": \"javascript\",
    \"status\": \"FAILED\",
    \"executionTimeMs\": 100,
    \"testCasesPassed\": 0,
    \"totalTestCases\": 5
  }" | jq .

# ============================================
# 7. GET LEADERBOARD
# ============================================
echo ""
echo "📋 Getting leaderboard..."
curl -X GET "$BASE_URL/api/squid-game/$TOURNAMENT_ID/leaderboard" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .

# ============================================
# 8. END ROUND (eliminate players)
# ============================================
echo ""
echo "🔚 Ending round and eliminating players..."
curl -X POST "$BASE_URL/api/squid-game/end-round" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"squidGameId\": \"$TOURNAMENT_ID\"
  }" | jq .

# ============================================
# 9. GET USER HISTORY
# ============================================
echo ""
echo "📜 Getting user tournament history..."
curl -X GET "$BASE_URL/api/squid-game/history/my" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .

# ============================================
# NOTES
# ============================================
# 💡 Use this format to pretty-print responses:
#    | jq .
#
# 💡 Remove "| jq ." to see raw JSON:
#    curl ... 
#
# 💡 For testing multiple players, see SQUID_GAME_TESTING.js
#
# 💡 To test WebSocket, see SQUID_GAME_MODE.md (Frontend Integration Example)
