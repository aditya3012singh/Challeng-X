import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
// import Profile from './pages/Profile'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, profileLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // On mount, always attempt to restore session from cookie
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(fetchUserProfile()).catch(() => { });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <div className="text-[var(--color-primary)] text-xs uppercase tracking-widest font-mono">Authenticating...</div>
        </div>
      </div>
    );
  }

  // After auth resolves, check if user has an active battle in localStorage
  if (isAuthenticated) {
    const activeBattleId = localStorage.getItem("active_battle_id");
    const currentPath = window.location.pathname;
    const idePattern = /^\/battle\/[^/]+\/ide/;
    if (activeBattleId && !idePattern.test(currentPath)) {
      return <Navigate to={`/battle/${activeBattleId}/ide`} replace />;
    }
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, profileLoading } = useSelector((state) => state.auth);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/problems" element={

          <Problem />

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
        {/* <Route path='/profile/:userId' element={
          <ProtectedRoute>
            <Profile/>
          </ProtectedRoute>
        } /> */}
      </Routes>
    </Router>
  )
}

export default App
