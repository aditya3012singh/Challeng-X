# Frontend Integration - Quick Checklist ✅

> Step-by-step guide to integrate async submissions in your frontend

## 📋 Pre-Migration Checklist

- [ ] Backend is updated with async submission system
- [ ] Redis is running
- [ ] Worker is running (`npm run worker`)
- [ ] Database migration completed (`npx prisma migrate dev`)
- [ ] Socket.IO is working (check browser console for connection)

---

## 🚀 Migration Steps

### Step 1: Verify New Files Exist ✅

All these files should already be created:

- [ ] `frontend/store/api/submission.thunk.js` (updated)
- [ ] `frontend/store/slices/submission.slice.js` (updated)
- [ ] `frontend/src/hooks/useSubmission.js` (NEW)
- [ ] `frontend/src/components/SubmissionStatus.jsx` (NEW)
- [ ] `frontend/src/examples/SubmissionExample.jsx` (NEW - for reference)
- [ ] `frontend/src/examples/IdeUpdated.jsx` (NEW - example implementation)
- [ ] `frontend/ASYNC_SUBMISSION_GUIDE.md` (NEW - full documentation)

---

### Step 2: Update Your Components

Choose the components where code submission happens:

#### Option A: Battle IDE (Ide.jsx)

**Current location:** `frontend/src/pages/Ide.jsx`

**What to update:**
1. Import the hook and component
2. Replace manual status management
3. Use SubmissionStatus component

**Reference:** See `frontend/src/examples/IdeUpdated.jsx` for complete example

---

#### Option B: Admin/Practice Page

Similar pattern - replace old submission logic with:

```jsx
import { useSubmission } from "../hooks/useSubmission";
import { SubmissionStatus } from "../components/SubmissionStatus";

const { submit, status } = useSubmission();

const handleSubmit = async () => {
    await submit({ code, language, problemId, battleId: null });
};
```

---

### Step 3: Test the Integration

- [ ] Start Redis: `redis-server`
- [ ] Start API: `cd backend && npm run dev`
- [ ] Start Worker: `cd backend && npm run worker`
- [ ] Start Frontend: `cd frontend && npm run dev`
- [ ] Submit code in browser
- [ ] Verify status shows: QUEUED → RUNNING → PASSED/FAILED
- [ ] Check browser console for socket connection
- [ ] Check worker console for job processing

---

## 🎯 Quick Integration Pattern

### Before (Old Way):
```jsx
const [status, setStatus] = useState("idle");
const dispatch = useDispatch();

const handleSubmit = async () => {
    setStatus("running");
    const result = await dispatch(submitCode(...)).unwrap();
    if (result.status === "PASSED") {
        setStatus("passed");
    }
};
```

### After (New Way):
```jsx
const { submit, status } = useSubmission();

const handleSubmit = async () => {
    await submit({ code, language, problemId, battleId });
    // Status updates automatically!
};

return <SubmissionStatus status={status} />;
```

---

## 🔍 What to Look For

### ✅ Success Indicators:

**Backend Console (Worker):**
```
🚀 Worker started, waiting for jobs... (concurrency: 5)
✅ Job abc-123 completed
```

**Frontend Console:**
```
🟢 Socket connected: socket-id-here
📡 Received submission result: { submissionId: "...", status: "PASSED" }
```

**UI:**
- Status badge shows "Queued" ⏳
- Changes to "Running" 🔄 with spinner
- Shows final result with test details ✅

---

### ❌ Common Issues:

| Issue | Solution |
|-------|----------|
| Status stuck on "QUEUED" | Check if worker is running |
| No socket connection | Check VITE_API_URL in frontend `.env` |
| Submission returns error | Check Redis connection in backend |
| Status never updates | Check socket event listeners |

---

## 📝 Files to Update

### Must Update:
1. **`Ide.jsx`** - Main battle IDE
2. Any other components that submit code

### Already Updated:
- ✅ `submission.thunk.js` - Has getSubmissionStatus
- ✅ `submission.slice.js` - Handles async states
- ✅ New hook and components created

---

## 🎨 UI Customization

The `SubmissionStatus` component can be styled:

```jsx
<SubmissionStatus 
    status={status} 
    className="mt-4 shadow-lg" 
/>
```

**Customize colors in:** `frontend/src/components/SubmissionStatus.jsx`

---

## 🧪 Manual Testing Checklist

- [ ] Submit Python code → See QUEUED status
- [ ] See status change to RUNNING
- [ ] See final PASSED/FAILED with test results
- [ ] Check execution time is displayed
- [ ] Try wrong code → See ERROR status
- [ ] Submit again → Previous status clears
- [ ] Check Network tab → POST returns immediately
- [ ] Check Socket tab → Receives "submissionResult" event

---

## 📚 Documentation

For detailed documentation, see:
- **Full Guide:** `frontend/ASYNC_SUBMISSION_GUIDE.md`
- **Example Usage:** `frontend/src/examples/SubmissionExample.jsx`
- **Updated IDE Example:** `frontend/src/examples/IdeUpdated.jsx`

---

## ✨ Next Steps

After successful integration:

1. [ ] Update other submission points (team battles, etc.)
2. [ ] Add error boundaries for better error handling
3. [ ] Customize SubmissionStatus styling to match your theme
4. [ ] Add analytics/logging for submission metrics
5. [ ] Consider adding submission history view

---

## 🆘 Need Help?

If you encounter issues:

1. Check the full guide: `ASYNC_SUBMISSION_GUIDE.md`
2. Look at working examples in `/examples` folder
3. Verify all services are running (Redis, API, Worker)
4. Check browser and terminal console for errors

---

**Happy integrating! 🚀**
