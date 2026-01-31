# CodeArena Authentication System - Complete Implementation

## ✅ Implemented Features

### Backend:
1. **Login endpoint** - `/auth/login` - Returns user data + sets cookies
2. **Register endpoint** - `/auth/register` - Creates new user
3. **Logout endpoint** - `/auth/logout` - Clears cookies and database tokens
4. **Profile endpoint** - `/auth/profile` - Returns authenticated user data
5. **Refresh token endpoint** - `/auth/refresh` - Rotates access/refresh tokens

### Frontend:
1. **Auto profile fetching** - Fetches user on app load
2. **Token refresh interceptor** - Auto-refreshes expired tokens
3. **Logout functionality** - Clears state and calls backend
4. **Protected routes** - Redirects unauthenticated users
5. **Loading states** - Shows loading during auth operations

## 🔐 Authentication Flow

### Login Flow:
```
User submits credentials
  ↓
Backend validates
  ↓
Sets httpOnly cookies (accessToken, refreshToken)
  ↓
Returns user data
  ↓
Frontend stores user in Redux
  ↓
Redirects to home
```

### Auto Profile Fetch (On App Load):
```
App loads
  ↓
Checks if cookies exist (via /auth/profile)
  ↓
If valid: Sets user + isAuthenticated = true
  ↓
If invalid: Shows login page
```

### Token Refresh (Automatic):
```
API request fails with 401
  ↓
Interceptor catches error
  ↓
Calls /auth/refresh
  ↓
Backend rotates tokens (new access + refresh)
  ↓
Retries original request
  ↓
If refresh fails: Redirects to login
```

### Logout Flow:
```
User clicks logout
  ↓
Frontend calls /auth/logout
  ↓
Backend clears cookies + DB refresh token
  ↓
Frontend clears Redux state
  ↓
Redirects to login
```

## 🔄 Token Rotation & Security

### Refresh Token Rotation:
- Each refresh generates **new** access + refresh tokens
- Old refresh token is invalidated immediately
- **Token reuse detection** - If old refresh token used, all sessions revoked
- Refresh tokens hashed in database (bcrypt)

### Cookie Security:
- **httpOnly** - Prevents XSS attacks
- **sameSite: 'lax'** - CSRF protection
- **secure: true** (production) - HTTPS only
- **maxAge** - Access: 15min, Refresh: 7 days

## 📂 File Structure

### Backend:
```
src/
├── controllers/auth.controller.js    # login, register, logout, getProfile, refreshToken
├── services/auth.service.js          # loginService, registerService, refreshTokenService
├── routes/auth.route.js              # /login, /register, /logout, /profile, /refresh
├── middlewares/auth.middleware.js    # Verifies accessToken
└── utils/
    ├── cookies.js                    # Cookie options
    └── jwt.js                        # Token generation/verification
```

### Frontend:
```
src/
├── App.jsx                           # Profile fetch on load + routing
├── components/Navbar.jsx             # Logout button + user display
├── pages/
│   ├── Login.jsx                     # Login form
│   ├── Register.jsx                  # Registration form
│   └── Home.jsx                      # Protected home with user data
└── store/
    ├── api/auth.thunk.js             # login, register, logoutUser, fetchUserProfile, refreshAccessToken
    ├── slices/auth.slice.js          # Auth reducer with all thunks
    └── store.js                      # Redux store
lib/axios.js                          # Axios with refresh interceptor
```

## 🚀 Usage Examples

### Login:
```javascript
import { useDispatch } from "react-redux";
import { login } from "../store/api/auth.thunk";

const dispatch = useDispatch();
await dispatch(login({ email, password })).unwrap();
// User data available in Redux state
```

### Logout:
```javascript
import { logoutUser } from "../store/api/auth.thunk";

await dispatch(logoutUser()).unwrap();
// Cookies cleared, state reset
```

### Access User Data:
```javascript
import { useSelector } from "react-redux";

const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

if (isAuthenticated) {
  console.log(user.username, user.email, user.role);
}
```

### Protected Component:
```javascript
const { isAuthenticated } = useSelector((state) => state.auth);

if (!isAuthenticated) return <Navigate to="/login" />;
return <YourProtectedContent />;
```

## 🔧 API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/login` | No | Login user, set cookies |
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/logout` | Yes | Logout, clear cookies |
| GET | `/auth/profile` | Yes | Get current user data |
| POST | `/auth/refresh` | No* | Refresh access token |

*Requires refresh token cookie

## ⚡ Token Lifecycle

### Access Token:
- **Lifespan:** 15 minutes
- **Storage:** httpOnly cookie
- **Usage:** All authenticated API requests
- **Refresh:** Automatically via interceptor

### Refresh Token:
- **Lifespan:** 7 days
- **Storage:** httpOnly cookie + hashed in DB
- **Usage:** Get new access token
- **Rotation:** New token on each refresh

## 🛡️ Security Features

1. ✅ **httpOnly cookies** - No JavaScript access
2. ✅ **Token rotation** - Fresh tokens on refresh
3. ✅ **Token reuse detection** - Revokes all sessions
4. ✅ **Password hashing** - bcrypt (10 rounds)
5. ✅ **Account lockout** - 5 failed attempts = 15min lock
6. ✅ **JWT expiry** - Short-lived access tokens
7. ✅ **CORS protection** - withCredentials + sameSite
8. ✅ **Auto logout** - On token refresh failure

## 📝 Environment Variables

### Backend (.env):
```env
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
```

### Frontend (.env):
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## 🎯 Key Benefits

1. **Stateless frontend** - No token management needed
2. **Secure** - httpOnly cookies prevent XSS
3. **Auto-refresh** - Seamless user experience
4. **Token rotation** - Enhanced security
5. **Profile persistence** - Auto-login on refresh
6. **Error handling** - Graceful fallbacks

## 🚧 Future Enhancements

- Add password reset flow
- Implement email verification
- Add 2FA/MFA support
- Session management dashboard
- Remember me functionality
- Multiple device sessions

## 📚 References

- Redux Toolkit: https://redux-toolkit.js.org/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- OWASP Cookie Security: https://owasp.org/www-community/controls/SecureCookieAttribute
