# CodeArena

A competitive coding platform backend with Python sandbox execution using Docker.

---

## Prerequisites

- **Node.js** 20+  
- **npm** 9+  
- **Docker Desktop** (running)  
- **PostgreSQL** database (local or cloud)

---

## Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd <repo-folder>
```

2. **Install dependencies**

```bash
npm install
```

3. **Build Docker runner for code execution**

```bash
npm run docker:build
```

This builds the python-runner image used for sandboxed code execution.

4. **Configure environment variables**

Create a .env file in the root:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_ACCESS_SECRET=supersecretkey123
JWT_REFRESH_SECRET=anothersecret456
NODE_ENV=development
```

5. **Seed the database**

```bash
npx prisma db seed
```

Populates the database with sample users, problems, and test cases.

6. **Start the backend**

```bash
npm run dev
```

The backend runs at http://localhost:4000