import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { lazy, Suspense, useEffect } from 'react'
import { fetchUserProfile } from '../store/api/auth.thunk'
import './App.css'

const Login = lazy(() => import('./auth/Login'))
const Register = lazy(() => import('./auth/Register'))
const Home = lazy(() => import('./pages/Home'))
const Navbar = lazy(() => import('./components/Navbar'))
const Problem = lazy(() => import('./components/Problem').then(m => ({ default: m.Problem })))
const ProblemDetail = lazy(() => import('./components/ProblemDetails').then(m => ({ default: m.ProblemDetail })))
const Ide = lazy(() => import('./pages/Ide'))
const Battle = lazy(() => import('./pages/Battle').then(m => ({ default: m.Battle })))
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })))
const JoinRoom = lazy(() => import('./pages/JoinRoom'))
const FindMatch = lazy(() => import('./pages/FindMatch').then(m => ({ default: m.FindMatch })))
const TeamBattle = lazy(() => import('./pages/TeamBattle').then(m => ({ default: m.TeamBattle })))
const BattleRoom = lazy(() => import('./pages/BattleRoom').then(m => ({ default: m.BattleRoom })))
const SquidMode = lazy(() => import('./pages/SquidMode').then(m => ({ default: m.SquidMode })))
const Admin = lazy(() => import('./pages/Admin'))
const SpectatorArena = lazy(() => import('./pages/SpectatorArena'))
const LiveArenas = lazy(() => import('./pages/LiveArenas'))
const Profile = lazy(() => import('./pages/Profile'))
const Footer = lazy(() => import('./components/Footer'))

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, profileLoading } = useSelector((state) => state.auth);

  // Global session restoration on mount
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(fetchUserProfile()).catch(() => { });
    }
  }, [dispatch, isAuthenticated]);

  // Global Redirect for Active Battles
  useEffect(() => {
    if (isAuthenticated && !profileLoading) {
      const activeBattleId = localStorage.getItem("active_battle_id");
      const currentPath = location.pathname;
      const idePattern = /^\/battle\/[^/]+\/ide/;

      // Force return to battle ONLY if visiting landing page or trying to start new engagement
      const sensitivePaths = ["/", "/matchmaking", "/join-room", "/battles"];
      if (activeBattleId && sensitivePaths.includes(currentPath) && !idePattern.test(currentPath)) {
        navigate(`/battle/${activeBattleId}/ide`, { replace: true });
      }
    }
  }, [isAuthenticated, profileLoading, location.pathname, navigate]);

  // Determine if we should show the global "Synchronizing Node..." loader
  // We only show it for protected/landing routes while profile is fetching
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const shouldBlockUI = profileLoading && !isAuthRoute;

  if (shouldBlockUI) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <div className="text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-[0.4em] font-mono">Synchronizing Node...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <div className="text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-[0.4em] font-mono">Loading Node...</div>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={<Home />}
          />
          <Route path="/problems" element={
            <ProtectedRoute>
              <Problem />
            </ProtectedRoute>
          } />
          <Route path='/problem/:id' element={
            <ProtectedRoute>
              <ProblemDetail />
            </ProtectedRoute>
          } />
          <Route path='/battles' element={
            <ProtectedRoute>
              <Battle />
            </ProtectedRoute>
          } />
          <Route path='/battle/:battleId/ide' element={
            <ProtectedRoute>
              <Ide />
            </ProtectedRoute>
          } />
          <Route path='/leaderboard' element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />

          <Route path="/join-room" element={
            <ProtectedRoute>
              <JoinRoom />
            </ProtectedRoute>
          } />
          <Route path='/matchmaking' element={
            <ProtectedRoute>
              <FindMatch />
            </ProtectedRoute>
          } />
          <Route path='/team-battle' element={
            <ProtectedRoute>
              <TeamBattle />
            </ProtectedRoute>
          } />
          <Route path='/battle-room/:battleId' element={
            <ProtectedRoute>
              <BattleRoom />
            </ProtectedRoute>
          } />
          <Route path='/squid-game' element={
            <ProtectedRoute>
              <SquidMode />
            </ProtectedRoute>
          } />
          <Route path='/profile/:username' element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path='/squid-game/:gameId' element={
            <ProtectedRoute>
              <SquidMode />
            </ProtectedRoute>
          } />
          <Route path='/squid-game/:gameId/host' element={
            <ProtectedRoute>
              <SquidMode />
            </ProtectedRoute>
          } />
          <Route path='/admin' element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/spectate/:battleId" element={
            <SpectatorArena />
          } />
          <Route path="/live" element={
            <ProtectedRoute>
              <LiveArenas />
            </ProtectedRoute>
          } />
        </Routes>
        <Footer />
      </Suspense>
    </>
  )
}

export default App
