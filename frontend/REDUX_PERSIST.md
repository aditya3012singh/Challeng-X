# Redux Persist Setup

## Overview
Redux Persist is configured to automatically save and restore user authentication state across browser sessions, eliminating the need for manual localStorage management.

## Configuration

### Persisted State
Located in `store/store.js`:

```javascript
const persistConfig = {
    key: "auth",
    storage,
    whitelist: ["user", "isAuthenticated"], // Only these fields are persisted
};
```

**What gets persisted:**
- ✅ `user` - User profile data
- ✅ `isAuthenticated` - Authentication status

**What doesn't get persisted:**
- ❌ `loading` - Loading states (always start fresh)
- ❌ `error` - Error messages (don't carry over)

## How It Works

### 1. State Persistence
When auth state changes:
```
User logs in → Redux state updates → Automatically saved to localStorage
```

### 2. State Restoration
On page load:
```
Browser refresh → PersistGate waits → Rehydrates auth state → App renders
```

### 3. Storage Location
Data is stored in browser's localStorage under the key `persist:auth`:
```json
{
  "user": {
    "id": "123",
    "username": "john",
    "email": "john@example.com"
  },
  "isAuthenticated": true
}
```

## Benefits

### ✅ No Flash of Unauthenticated Content
- User stays logged in across page refreshes
- No redirect to login page on refresh
- Seamless user experience

### ✅ Automatic Synchronization
- No manual localStorage.setItem() calls needed
- No manual JSON.parse() needed
- Redux state is the single source of truth

### ✅ Selective Persistence
- Only persist what's needed
- Reduce storage size
- Avoid persisting temporary states

## Usage

### Clearing Persisted Data (Logout)
The logout action automatically clears persisted state:

```javascript
dispatch(logoutUser())
  .unwrap()
  .then(() => {
    // State is cleared, localStorage is purged
    navigate('/login');
  });
```

### Manual Purge (Development)
To manually clear persisted data:

```javascript
import { persistor } from '../store/store.js';

// Purge all persisted state
persistor.purge();
```

Or from browser console:
```javascript
localStorage.removeItem('persist:auth');
```

## Security Considerations

### ✅ Safe to Persist
- User profile data (non-sensitive)
- Authentication status boolean
- User preferences

### ❌ Never Persist
- Access tokens (use httpOnly cookies instead) ✅ Already implemented
- Refresh tokens (use httpOnly cookies instead) ✅ Already implemented
- Passwords or credentials
- Sensitive personal data

**Note:** This app uses httpOnly cookies for token management, which is more secure than localStorage tokens.

## Middleware Configuration

Redux Persist middleware is configured to ignore serialization warnings:

```javascript
middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        },
    }),
```

## Storage Drivers

Current: **localStorage** (persists indefinitely until cleared)

Alternative options:
- `sessionStorage` - Clears on tab close
- `redux-persist-cookie-storage` - Use cookies instead
- `localForage` - IndexedDB with fallback

To change storage:
```javascript
import sessionStorage from 'redux-persist/lib/storage/session';

const persistConfig = {
    key: "auth",
    storage: sessionStorage, // Change here
};
```

## Testing

### Test Persistence
1. Login to the app
2. Open DevTools → Application → Local Storage
3. See `persist:auth` with user data
4. Refresh page
5. User remains logged in ✅

### Test Purge
1. Logout
2. Check Local Storage - `persist:auth` should be removed
3. Refresh page
4. Should redirect to login ✅

## Troubleshooting

### Issue: State not persisting
- Check browser's localStorage quota
- Ensure localStorage is not disabled
- Check persistConfig whitelist

### Issue: Stale data after update
```javascript
// Migrate to new version
const persistConfig = {
    key: "auth",
    storage,
    version: 2, // Increment version
    migrate: createMigrate({
        // Migration logic here
    }),
};
```

### Issue: PersistGate loading forever
- Check persistor export in store.js
- Ensure PersistGate has loading prop
- Check console for errors

## Best Practices

1. **Only persist essential data** - Don't persist entire state tree
2. **Use whitelist over blacklist** - Explicit is better than implicit
3. **Don't persist loading states** - Always start fresh
4. **Don't persist errors** - They should be transient
5. **Version your persisted state** - For breaking changes
6. **Test logout flow** - Ensure state is properly cleared

## Related Files
- `store/store.js` - Redux Persist configuration
- `src/main.jsx` - PersistGate wrapper
- `store/slices/auth.slice.js` - Auth state definition

## Resources
- [Redux Persist Docs](https://github.com/rt2zz/redux-persist)
- [Storage Engines](https://github.com/rt2zz/redux-persist#storage-engines)
- [Migration Guide](https://github.com/rt2zz/redux-persist/blob/master/docs/migrations.md)
