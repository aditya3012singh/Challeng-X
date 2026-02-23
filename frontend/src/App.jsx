import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import Login from './auth/Login'
import Register from './auth/Register'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import { fetchUserProfile } from '../store/api/auth.thunk'
import './App.css'
import { Problem } from './components/Problem'
import { ProblemDetail } from './components/ProblemDetails'
import Ide from './pages/Ide'
import { Battle } from './pages/Battle'
import { Leaderboard } from './pages/Leaderboard'
import JoinRoom from './pages/JoinRoom'
import { FindMatch } from './pages/FindMatch'
import { TeamBattle } from './pages/TeamBattle'
import { BattleRoom } from './pages/BattleRoom'
import { SquidMode } from './pages/SquidMode'
import Admin from './pages/Admin'

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
      <Navbar />
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
        <Route path='/squid-mode' element={
          <ProtectedRoute>
            <SquidMode />
          </ProtectedRoute>
        } />
        <Route path='/admin' element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App
