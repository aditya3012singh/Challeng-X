# Code Execution Architecture — Old vs New

## The Problem: Cold Start

Every time a user submits code, it needs to run inside an isolated sandbox.  
CodeArena uses Docker images (`codearena-python`, `codearena-js`, etc.) for isolation.

---

## Old Way — Cold Container Per Test Case

```
User submits  →  HTTP POST  →  Submission queued in Redis (BullMQ)
                                       │
                                  Worker picks up job
                                       │
                              For EACH test case:
                              ┌─────────────────────────────────────┐
                              │  docker run --rm codearena-python   │  ← cold start ~1–3s
                              │    bash -c "python3 solution.py"    │
                              │                                     │
                              │  Code runs       (~10–50ms)         │
                              │  Container destroyed                │
                              └─────────────────────────────────────┘
                              Repeat for every test case
```

### Timeline (3 test cases)

```
TC1: [== cold start 2s ==][run 20ms][destroy]
TC2:                       [== cold start 2s ==][run 20ms][destroy]
TC3:                                             [== cold start 2s ==][run 20ms][destroy]
                                                                           Total: ~6s
```

### Problems
- Cold start **dominates** — 95%+ of time is Docker overhead, not code execution
- 3 test cases × 2s = 6s minimum per submission
- 10 test cases = 20s — user is waiting for nothing
- Resources wasted spinning up/destroying containers constantly

---

## New Way — Warm Container Pool

Containers are started **once** when the worker boots and stay alive.  
Each container runs a persistent **runner script** that accepts jobs via stdin.

```
Worker boots
  └─ python pool:  [🐳 warm] [🐳 warm] [🐳 warm]   ← started ONCE, stay alive
  └─ js pool:      [🐳 warm] [🐳 warm] [🐳 warm]
  └─ c pool:       [🐳 warm] [🐳 warm] [🐳 warm]
  └─ cpp pool:     [🐳 warm] [🐳 warm] [🐳 warm]

User submits  →  HTTP POST  →  Submission queued in Redis (BullMQ)
                                       │
                                  Worker picks up job
                                       │
                              Acquire a free warm container
                                       │
                              For EACH test case:
                              ┌─────────────────────────────────────┐
                              │  stdin  → {"code":"..","input":".."}│  ← ~0ms
                              │  runner executes code               │
                              │  stdout ← {"output":".."}           │
                              └─────────────────────────────────────┘
                              Release container back to pool
```

### Timeline (3 test cases)

```
TC1: [run 20ms]
TC2: [run 20ms]
TC3: [run 20ms]
                Total: ~60ms  (100× faster)
```

### Protocol: JSON Line over stdio

```
Host (Node.js)          Container (runner script)
      │                          │
      │── {"code":"...","input":"..."}\n ──▶│
      │                          │  executes
      │◀── {"output":"..."}\n ───│
      │                          │
      │── {"code":"...","input":"..."}\n ──▶│  (next job)
      │                          │
```

One JSON line in, one JSON line out. The container never exits between jobs.

---

## Concurrency

Pool size is set to match worker concurrency (`JUDGE_POOL_SIZE=3` by default, same as `concurrency: 5` in the worker).

```
5 submissions arrive simultaneously (all Python):

  Sub 1 → grabs Python container #1 → runs → done in 60ms → released
  Sub 2 → grabs Python container #2 → runs → done in 60ms → released
  Sub 3 → grabs Python container #3 → runs → done in 60ms → released
  Sub 4 → WAITS (pool full) → container #1 freed → runs → done in 60ms
  Sub 5 → WAITS (pool full) → container #2 freed → runs → done in 60ms

vs Old: 5 × (3 test cases × 2s cold start) = 30s for all 5
    New: 60ms for all 5 (pool of 3 handles them in two waves)
```

---

## File Structure

```
backend/
├── runners/
│   ├── python_runner.py   # Python warm container runner
│   ├── js_runner.js       # JavaScript warm container runner
│   ├── c_runner.py        # C warm container runner (compiles with gcc)
│   └── cpp_runner.py      # C++ warm container runner (compiles with g++)
│
└── src/services/
    └── judge.service.js   # WarmContainerPool + JudgeService (new)
```

The `runners/` directory is mounted read-only into every container at `/runners`.

---

## Safety Features

| Feature | Detail |
|---|---|
| **Network isolation** | `--network none` — no internet access from user code |
| **Memory cap** | `--memory 128m` per container |
| **CPU cap** | `--cpus 0.5` per container |
| **Soft timeout** | 8s timeout inside the runner subprocess |
| **Hard timeout** | 15s Node.js `SIGKILL` timer per job in case runner stalls |
| **Auto-restart** | Container crash → new container starts in 500ms, slot recovers |
| **Graceful shutdown** | `SIGTERM`/`SIGINT` kills all containers cleanly |

---

## Docker Image Requirements

| Image | Required tools |
|---|---|
| `codearena-python` | `python3` |
| `codearena-js` | `node` |
| `codearena-c` | `gcc`, `python3` (for the runner script) |
| `codearena-cpp` | `g++`, `python3` (for the runner script) |

> If `codearena-c` / `codearena-cpp` don't have `python3`, add it:
> ```dockerfile
> RUN apt-get update && apt-get install -y python3
> ```
> Then rebuild: `docker build -t codearena-c .`

---

## Configuration

| Env var | Default | Description |
|---|---|---|
| `JUDGE_POOL_SIZE` | `3` | Warm containers per language |

Increase for higher concurrency. Each slot uses ~128MB RAM and 0.5 CPU cores.  
`JUDGE_POOL_SIZE=5` = 20 containers total (4 languages × 5) = ~2.5GB RAM reserved.
