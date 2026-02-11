# 🚀 CodeArena Backend - Complete Documentation

A comprehensive competitive coding platform backend with real-time battles, team competitions, and gamified tournament experiences.

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Architecture Overview](#-architecture-overview)
3. [API Endpoints](#-api-endpoints)
4. [Database Schema](#-database-schema)
5. [Real-time Features](#-real-time-features)
6. [Game Modes](#-game-modes)
7. [Authentication & Security](#-authentication--security)
8. [Development Guide](#-development-guide)
9. [Deployment](#-deployment)
10. [Testing](#-testing)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+
- **npm** 9+
- **Docker Desktop** (running)
- **PostgreSQL** database (local or cloud)

### Setup

1. **Clone & Install**
```bash
git clone <your-repo-url>
cd backend
npm install
```

2. **Build Docker Runner**
```bash
npm run docker:build
```

3. **Configure Environment**
```bash
# Create .env file
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_ACCESS_SECRET=supersecretkey123
JWT_REFRESH_SECRET=anothersecret456
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

4. **Database Setup**
```bash
npx prisma migrate dev
npx prisma db seed
```

5. **Start Server**
```bash
npm run dev
```

Server runs at **http://localhost:4000**

---

## 🏗️ Architecture Overview

### Directory Structure
```
backend/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # HTTP server & Socket.io setup
│   ├── config/             # Database & configuration
│   ├── controllers/        # Request handlers (10 files)
│   ├── services/           # Business logic (13 files)
│   ├── routes/             # API routes (10 files)
│   ├── middlewares/        # Auth & validation middleware
│   ├── utils/              # Helper utilities
│   ├── validation/         # Input validation schemas
│   └── constants/          # Game configuration constants
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seed.js             # Sample data seeding
├── docker/                 # Docker containers for code execution
└── scripts/               # Utility scripts
```

### Technology Stack
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Real-time**: Socket.io
- **Caching**: Redis
- **Validation**: Zod
- **Code Execution**: Docker sandboxes
- **Security**: bcrypt, CORS, rate limiting

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login with cookies |
| POST | `/register` | User registration |
| POST | `/logout` | User logout |
| GET | `/profile` | Get user profile |
| POST | `/refresh` | Refresh access token |
| GET | `/user/:userId` | Get public profile |

### Problems (`/api/problem`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create` | Create new problem (admin) |
| GET | `/list` | Get all problems |
| GET | `/:id` | Get problem details with test cases |

### Test Cases (`/api/testcase`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add/:id` | Add test cases to problem |

### Battles (`/api/battle`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create` | Create 1v1 battle |
| GET | `/:battleCode` | Get battle details |
| POST | `/:battleCode/join` | Join battle |
| POST | `/:battleCode/submit` | Submit solution |
| POST | `/:battleCode/start` | Start battle |

### Team Battles (`/api/team-battle`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create` | Create team battle |
| GET | `/available` | Get available battles |
| POST | `/join` | Join battle with code |
| POST | `/:battleCode/start` | Start team battle |
| POST | `/:battleCode/submit` | Submit solution |

### Teams (`/api/team`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create` | Create team |
| GET | `/my` | Get user's teams |
| POST | `/:teamCode/join` | Join team |
| GET | `/:teamCode` | Get team details |

### Squid Game (`/api/squid-game`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create tournament |
| POST | `/join` | Join tournament |
| GET | `/:id` | Get tournament status |
| POST | `/start` | Start tournament |
| POST | `/submit` | Submit solution |
| POST | `/end-round` | End round & eliminate |
| GET | `/:id/leaderboard` | Get leaderboard |
| GET | `/history/my` | User tournament history |

### Matchmaking (`/api/matchmaking`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/find` | Find opponent |
| GET | `/status` | Get matchmaking status |
| POST | `/cancel` | Cancel search |

### Leaderboard (`/api/leaderboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get global leaderboard |
| GET | `/teams` | Get team leaderboard |

### Submissions (`/api/submissions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Submit code solution |
| GET | `/my` | Get user submissions |

---

## 🗄️ Database Schema

### Core Models

#### User
```prisma
model User {
  id                String   @id @default(uuid())
  username          String   @unique
  email             String   @unique
  password          String
  role              Role     @default(USER)
  
  // Authentication
  refreshTokenHash  String?
  tokenVersion      Int      @default(0)
  failedLoginCount  Int      @default(0)
  lockUntil         DateTime?
  
  // Stats
  rankPoints        Int      @default(1000)
  wins              Int      @default(0)
  losses            Int      @default(0)
  
  // Relations
  battlesAsPlayer1  Battle[]
  battlesAsPlayer2  Battle[]
  teamMemberships   TeamMember[]
  teamsCreated      Team[]
  submissions       Submission[]
  // ... more relations
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

#### Problem
```prisma
model Problem {
  id          String     @id @default(uuid())
  title       String
  description String
  difficulty  Difficulty
  
  timeLimitMs Int       @default(2000)
  testcases  TestCase[]
  battles     Battle[]
  
  createdAt   DateTime @default(now())
}
```

#### Battle
```prisma
model Battle {
  id         String       @id @default(uuid())
  battleCode String       @unique
  
  player1    User         @relation("player1")
  player1Id  String
  player2    User?        @relation("player2")
  player2Id  String?
  
  problem    Problem      @relation(fields: [problemId], references: [id])
  problemId  String
  
  status     BattleStatus @default(WAITING)
  winnerId   String?
  
  startedAt  DateTime?
  endedAt    DateTime?
  
  createdAt  DateTime @default(now())
}
```

### Advanced Models

#### Team & Team Battles
- **Team**: Create teams with unique codes
- **TeamMember**: Manage team memberships
- **TeamBattle**: Multi-team competitions
- **TeamBattleMatch**: Individual 1v1 matches within team battles

#### Squid Game Tournament
- **SquidGame**: Main tournament entity
- **SquidGameParticipant**: Tournament players
- **SquidGameRound**: Individual rounds with problems
- **SquidGameSubmission**: Player solutions with scoring
- **SquidGameLeaderboard**: Round-by-round rankings

---

## 📡 Real-time Features

### Socket.io Events

#### Battle Events
```javascript
// Join battle room
socket.emit('joinBattle', battleCode);

// Receive battle updates
socket.on('battle:player_joined', data);
socket.on('battle:started', data);
socket.on('battle:submission', data);
socket.on('battle:ended', data);
```

#### Squid Game Events
```javascript
// Tournament events
socket.on('squid_game:player_joined', data);
socket.on('squid_game:submission_received', data);
socket.on('squid_game:leaderboard_updated', data);
socket.on('squid_game:round_started', data);
socket.on('squid_game:round_ended', data);
socket.on('squid_game:players_eliminated', data);
socket.on('squid_game:tournament_completed', data);
```

#### Matchmaking Events
```javascript
socket.on('matchmaking:found', data);
socket.on('matchmaking:cancelled', data);
```

---

## 🎮 Game Modes

### 1. 1v1 Battles
- **Real-time coding duels**
- **Share battle codes** for easy joining
- **Live code execution** with Docker sandboxes
- **Automatic winner determination**
- **Spectator support**

### 2. Team Battles
- **Multi-team competitions**
- **Join code system** for dynamic team matching
- **Individual member pairings**
- **Team-based scoring**
- **Live leaderboard**

### 3. Squid Game Mode 🦑
- **50-player elimination tournament**
- **5 rounds with increasing difficulty**
- **Progressive time limits** (20→10 minutes)
- **Automatic elimination** (bottom X% each round)
- **Real-time leaderboard updates**
- **Comprehensive scoring system**

#### Tournament Flow
```
REGISTRATION → ROUND 1 (EASY, 20min) → ROUND 2 (EASY, 18min)
    ↓
50 players → 40 players → 30 players → 20 players → 10 players → 1 WINNER
```

#### Scoring System
- **PASSED**: 100-150 points (base + time bonus)
- **PARTIAL**: Up to 50 points (based on test cases)
- **FAILED/ERROR**: 0 points

### 4. Matchmaking System
- **Automatic opponent finding**
- **Skill-based pairing**
- **Real-time notifications**
- **Cancel and re-queue support**

---

## 🔐 Authentication & Security

### JWT Token System
- **Access tokens**: 15 minutes (HTTP-only cookies)
- **Refresh tokens**: 7 days (HTTP-only cookies)
- **Token rotation**: Automatic refresh on expiry
- **Secure storage**: No localStorage usage

### Security Features
- **Password hashing** with bcrypt
- **Account lockout** after failed attempts
- **CORS protection** for frontend
- **Input validation** with Zod schemas
- **Rate limiting** on sensitive endpoints
- **XSS protection** via HTTP-only cookies

### User Roles
- **USER**: Standard player access
- **ADMIN**: Full system access (problem management)

---

## 🛠️ Development Guide

### Code Execution System
```javascript
// Docker-based code execution
const judgeService = {
  executeCode: (language, code, input) => {
    // Runs in isolated Docker container
    // Returns: { output, status, executionTime, memory }
  }
};
```

### Caching Strategy
- **Redis** for problem lists and leaderboards
- **TTL**: 1 hour for cached data
- **Invalidation**: On problem updates/submissions

### Error Handling
- **Centralized error middleware**
- **Consistent error responses**
- **Proper HTTP status codes**
- **Logging for debugging**

### Validation
```javascript
// Zod schema example
const createProblemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  timeLimitMs: z.number().min(1).optional()
});
```

---

## 🚀 Deployment

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# JWT Secrets
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Server
NODE_ENV="production"
PORT=4000

# Redis
REDIS_URL="redis://localhost:6379"

# Frontend URL
FRONTEND_URL="https://yourdomain.com"
```

### Docker Setup
```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS builder
# ... build steps

FROM node:20-alpine AS runtime
# ... runtime setup
```

### Production Checklist
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Set up log aggregation
- [ ] Enable rate limiting
- [ ] Scale Docker containers

---

## 🧪 Testing

### Manual Testing
```bash
# Test authentication
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test problem creation
curl -X POST http://localhost:4000/api/problem/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Problem","description":"...","difficulty":"EASY"}'
```

### Automated Testing
```bash
# Run tests (when implemented)
npm test

# Test Docker execution
npm run docker:test
```

### WebSocket Testing
```javascript
// Connect to Socket.io
const socket = io('http://localhost:4000');

// Test battle events
socket.emit('joinBattle', 'ABC123');
socket.on('battle:player_joined', (data) => {
  console.log('Player joined:', data);
});
```

---

## 📊 Performance & Scaling

### Database Optimization
- **Indexes** on frequently queried fields
- **Connection pooling** with Prisma
- **Read replicas** for scaling (future)

### Caching Strategy
- **Redis** for session storage
- **Problem cache** for faster loading
- **Leaderboard cache** with TTL

### Real-time Scaling
- **Socket.io rooms** for efficient broadcasting
- **Event throttling** to prevent spam
- **Connection limits** per user

---

## 🔧 Configuration

### Game Constants
```javascript
// Battle configuration
const BATTLE_CONFIG = {
  TIME_LIMIT: 10 * 60 * 1000, // 10 minutes
  MAX_CODE_LENGTH: 10000,
  SUPPORTED_LANGUAGES: ['python', 'javascript', 'java']
};

// Squid Game configuration
const SQUID_GAME_CONFIG = {
  MAX_PLAYERS: 50,
  TOTAL_ROUNDS: 5,
  ELIMINATION_RATES: [0.2, 0.25, 0.33, 0.5, 0.9],
  TIME_LIMITS: [20, 18, 15, 12, 10] // minutes
};
```

### Docker Containers
- **Python Runner**: For Python code execution
- **Node.js Runner**: For JavaScript execution
- **Java Runner**: For Java execution (future)

---

## 📈 Monitoring & Logging

### Logging Strategy
```javascript
// Structured logging
const logger = {
  info: (message, meta) => console.log(JSON.stringify({ level: 'info', message, meta })),
  error: (message, error) => console.error(JSON.stringify({ level: 'error', message, error }))
};
```

### Metrics to Track
- **API response times**
- **Database query performance**
- **Socket.io connection counts**
- **Code execution success rates**
- **User engagement metrics**

---

## 🤝 Contributing

### Code Standards
- **ESLint** for code quality
- **Prettier** for formatting
- **TypeScript** ready (future migration)
- **Git hooks** for pre-commit checks

### Development Workflow
1. Create feature branch
2. Implement with tests
3. Update documentation
4. Submit pull request
5. Code review and merge

---

## 📚 Additional Documentation

### API Examples
See individual endpoint documentation for detailed examples and error handling.

### WebSocket Integration
Refer to Socket.io event documentation for real-time feature implementation.

### Database Schema
Complete schema available in `prisma/schema.prisma`.

### Game Logic
Detailed game mechanics in respective service files.

---

## 🎯 Future Enhancements

### Planned Features
- **Multi-language support** (Java, C++, etc.)
- **Custom problem editor** with rich text
- **Video streaming** for battle spectating
- **AI-powered problem generation**
- **Mobile API endpoints**
- **Analytics dashboard**

### Technical Improvements
- **TypeScript migration**
- **Microservices architecture**
- **GraphQL API**
- **Event sourcing**
- **CQRS pattern**

---

## 📞 Support

### Common Issues
- **Docker not running**: Start Docker Desktop
- **Database connection**: Check DATABASE_URL
- **Port conflicts**: Change PORT in .env
- **CORS errors**: Verify frontend URL

### Debugging
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check database connection
npx prisma db pull

# Test Docker containers
docker ps
```

---

## 📄 License

This project is licensed under the ISC License.

---

**Built with ❤️ for the competitive coding community**

**Last Updated**: February 2026
