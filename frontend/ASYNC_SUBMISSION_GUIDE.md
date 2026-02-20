# Frontend Integration Guide - Async Submissions

> Complete guide for integrating the async BullMQ submission system in the frontend

## 📋 Overview

The backend now uses **async code submissions** with BullMQ. Instead of waiting for code execution results, the API:
1. ✅ Returns immediately with a `submissionId` (status: QUEUED)
2. ⚙️ Processes submission in background worker
3. 📡 Sends real-time updates via **Socket.IO**
4. 🔄 Frontend can also **poll** for status updates

---

## 🏗️ Architecture

```
User submits code
    ↓
POST /api/submissions/submit (returns immediately)
    ↓
Frontend receives: { submissionId, status: "QUEUED" }
    ↓
Frontend starts:
  - Polling (every 2s)
  - Socket.IO listener
    ↓
Backend worker processes submission
    ↓
Backend emits: socket.emit("submissionResult", { submissionId, status, passedTests, totalTests })
    ↓
Frontend receives real-time update
    ↓
Display results to user
```

---

## 📁 Files Created/Updated

### Backend Files
- ✅ `backend/prisma/schema.prisma` - Added QUEUED, RUNNING statuses + passedTests/totalTests fields
- ✅ `backend/worker/worker.js` - Updated concurrency to 5, added Socket.IO emission
- ✅ `backend/src/services/submission.service.js` - Returns submissionId immediately
- ✅ `backend/src/controllers/submission.controller.js` - Added getSubmissionStatus endpoint
- ✅ `backend/src/routes/submission.route.js` - Added GET /submissions/:id route

### Frontend Files (NEW)
- ✅ `frontend/store/api/submission.thunk.js` - Added getSubmissionStatus thunk
- ✅ `frontend/store/slices/submission.slice.js` - Updated to handle async states
- ✅ `frontend/src/hooks/useSubmission.js` - Custom hook for submissions (polling + socket)
- ✅ `frontend/src/components/SubmissionStatus.jsx` - UI component for status display
- ✅ `frontend/src/examples/SubmissionExample.jsx` - Example usage

---

## 🚀 How to Use

### 1. Import the Hook & Component

```jsx
import { useSubmission } from "../hooks/useSubmission";
import { SubmissionStatus } from "../components/SubmissionStatus";
```

### 2. Use in Your Component

```jsx
function CodeEditor({ problemId }) {
    const [code, setCode] = useState("");
    const { submit, loading, error, status, reset } = useSubmission();

    const handleSubmit = async () => {
        try {
            await submit({
                code,
                language: "python",
                problemId,
                battleId: null, // Optional
            });
            // Submission queued! Status will update automatically
        } catch (err) {
            console.error("Error:", err);
        }
    };

    return (
        <div>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} />
            <button onClick={handleSubmit} disabled={loading}>
                Submit Code
            </button>
            
            {/* Real-time status updates */}
            <SubmissionStatus status={status} />
        </div>
    );
}
```

---

## 🎯 Hook API Reference

### `useSubmission()`

Returns an object with:

#### State Properties
- `currentSubmission` - Current submission data (submissionId, status, message)
- `submissionStatus` - Latest status from polling/socket (id, status, passedTests, totalTests, executionTimeMs)
- `loading` - Boolean indicating if submission is being sent
- `error` - Error message if submission failed
- `status` - Formatted status object with:
  - `status` - Current status string (QUEUED, RUNNING, PASSED, FAILED, ERROR)
  - `isComplete` - Boolean (true if PASSED/FAILED/ERROR)
  - `isProcessing` - Boolean (true if QUEUED/RUNNING)
  - `passedTests` - Number of passed test cases
  - `totalTests` - Total number of test cases
  - `executionTimeMs` - Execution time in milliseconds

#### Action Methods
- `submit({ code, language, problemId, battleId })` - Submit code for execution
- `reset()` - Clear submission state
- `startPolling(submissionId)` - Manually start polling (usually automatic)
- `stopPolling()` - Stop polling

---

## 🎨 SubmissionStatus Component

### Props
- `status` - Status object from `useSubmission()` hook
- `className` - Additional CSS classes (optional)

### Features
- 🟡 **QUEUED** - Shows "in queue" with animated progress
- 🔵 **RUNNING** - Shows "running tests" with spinner
- 🟢 **PASSED** - Shows success with test results
- 🔴 **FAILED/ERROR** - Shows failure with details
- 📊 **Progress Bar** - Visual representation of test pass rate
- ⏱️ **Execution Time** - Displays time taken

---

## 🔄 Submission Status Flow

```
┌─────────┐
│ QUEUED  │ → Submission added to queue
└────┬────┘
     ↓
┌─────────┐
│ RUNNING │ → Worker executing test cases
└────┬────┘
     ↓
┌──────────────────┐
│ PASSED / FAILED  │ → Final result
│    / ERROR       │
└──────────────────┘
```

---

## 📡 Socket.IO Events

### Listening to Events

The `useSubmission` hook automatically listens for:

**Event:** `submissionResult`

**Payload:**
```javascript
{
    submissionId: "uuid",
    userId: "user-uuid",
    battleId: "battle-uuid" | null,
    status: "PASSED" | "FAILED" | "ERROR",
    passedTests: 5,
    totalTests: 5,
    executionTimeMs: 1234
}
```

### Manual Socket Usage (if needed)

```jsx
import { getSocket } from "../../lib/socket";

const socket = getSocket();

socket.on("submissionResult", (data) => {
    console.log("Submission complete:", data);
    // Handle the result
});
```

---

## 🔧 Integration in Existing Components

### Example: Update `Ide.jsx` (Battle IDE)

**Before:**
```jsx
const handleSubmit = async () => {
    const result = await dispatch(submitBattleCode({ battleId, code, language })).unwrap();
    setStatus("submitted");
    setMessage("✅ Code submitted!");
};
```

**After:**
```jsx
import { useSubmission } from "../hooks/useSubmission";
import { SubmissionStatus } from "../components/SubmissionStatus";

function BattleIde() {
    const { submit, status } = useSubmission();
    const { battleId, problemId } = useParams();

    const handleSubmit = async () => {
        await submit({ code, language, problemId, battleId });
        // Status updates automatically via socket + polling
    };

    return (
        <div>
            {/* Code editor */}
            <CodeEditor code={code} onChange={setCode} />
            <button onClick={handleSubmit}>Run Code</button>
            
            {/* Real-time status */}
            <SubmissionStatus status={status} />
            
            {/* Proceed when passed */}
            {status?.status === "PASSED" && (
                <button onClick={proceedToNextRound}>
                    Next Round →
                </button>
            )}
        </div>
    );
}
```

---

## 🧪 Testing the Integration

### 1. Start Backend Services

```bash
# Terminal 1 - Redis
redis-server

# Terminal 2 - API Server
cd backend
npm run dev

# Terminal 3 - Worker
cd backend
npm run worker
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Submission Flow

1. Go to code editor
2. Submit code
3. Should see status: **QUEUED** ⏳
4. Should transition to: **RUNNING** 🔄
5. Should show final result: **PASSED** ✅ or **FAILED** ❌
6. Check test results and execution time

### 4. Verify in Console

**Frontend Console:**
```
📤 POST /api/submissions/submit
📡 Received submission result: { submissionId, status: "PASSED", ... }
```

**Backend Console (Worker):**
```
✅ Job abc123 completed
```

---

## ⚡ Performance Tips

### Polling Interval
Default: **2 seconds**

Adjust in `useSubmission.js`:
```javascript
pollingIntervalRef.current = setInterval(async () => {
    // ...
}, 2000); // Change this value
```

### Stop Polling on Complete
Polling automatically stops when status is `PASSED`, `FAILED`, or `ERROR`.

### Socket.IO Priority
If Socket.IO event arrives before polling, it immediately stops polling (more efficient).

---

## 🐛 Troubleshooting

### Issue: Status not updating

**Check:**
1. ✅ Redis is running
2. ✅ Worker is running (`npm run worker`)
3. ✅ Socket.IO connected (check console for "🟢 Socket connected")
4. ✅ REDIS_URL in backend `.env`

### Issue: Submission stays in QUEUED

**Check:**
1. Worker logs for errors
2. Redis connection in worker
3. Database connection

### Issue: Socket events not received

**Check:**
1. Frontend socket connection: `getSocket()` in console
2. Backend `.env` has correct PORT
3. CORS settings in backend

---

## 📚 Additional Resources

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Example Usage](./src/examples/SubmissionExample.jsx)

---

## 🎉 Summary

You now have a fully async submission system with:
- ✅ Instant API responses
- ✅ Real-time updates via Socket.IO
- ✅ Fallback polling mechanism
- ✅ Beautiful UI components
- ✅ Easy-to-use React hook
- ✅ Horizontal scalability (add more workers)

Happy coding! 🚀
