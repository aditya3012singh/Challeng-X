import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { lazy, Suspense, useEffect } from 'react'
import { fetchUserProfile } from '../store/api/auth.thunk'
import { addNotification } from '../store/slices/notification.slice'
import { getSocket } from '../lib/socket'
import { Toaster } from 'react-hot-toast'
import './App.css'

const Login = lazy(() => import('./auth/Login'))
// Registration is now handled via OAuth on the login page
const ForgotPassword = lazy(() => import('./auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./auth/ResetPassword'))
const Home = lazy(() => import('./pages/Home'))
const Navbar = lazy(() => import('./components/Navbar'))
const MainLayout = lazy(() => import('./components/MainLayout'))
const Problem = lazy(() => import('./components/Problem').then(m => ({ default: m.Problem })))
const ProblemDetail = lazy(() => import('./components/ProblemDetails').then(m => ({ default: m.ProblemDetail })))
const BattleArena = lazy(() => import('./pages/BattleArena'))
const Battle = lazy(() => import('./pages/Battle').then(m => ({ default: m.Battle })))
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })))
const JoinRoom = lazy(() => import('./pages/JoinRoom'))
const FindMatch = lazy(() => import('./pages/FindMatch').then(m => ({ default: m.FindMatch })))
const TeamBattle = lazy(() => import('./pages/TeamBattle').then(m => ({ default: m.TeamBattle })))
const BattleRoom = lazy(() => import('./pages/BattleRoom').then(m => ({ default: m.BattleRoom })))
const SquidMode = lazy(() => import('./pages/SquidMode').then(m => ({ default: m.SquidMode })))
const Admin = lazy(() => import('./pages/Admin'))
const AdminContests = lazy(() => import('./pages/AdminContests'))
const SpectatorArena = lazy(() => import('./pages/SpectatorArena'))
const LiveArenas = lazy(() => import('./pages/LiveArenas'))
const Profile = lazy(() => import('./pages/Profile'))
const Contests = lazy(() => import('./pages/Contests'))
const ContestDetail = lazy(() => import('./pages/ContestDetail'))
const ContestArena = lazy(() => import('./pages/ContestArena'))
const Achievements = lazy(() => import('./pages/Achievements'))
const Footer = lazy(() => import('./components/Footer'))
const GlobalChat = lazy(() => import('./components/GlobalChat'))
const SocialLobby = lazy(() => import('./components/SocialLobby'))

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Global Socket Listener for Redirections
const GlobalSocketListener = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // 1. Handle dynamic import failures (stale build chunks)
    const handleModuleError = (e) => {
      const isModuleError = e.message?.includes('Failed to fetch dynamically imported module') || 
                          e.stack?.includes('Failed to fetch dynamically imported module') ||
                          e.name === 'ChunkLoadError';
      
      if (isModuleError) {
        console.warn('Stale build detected. Reloading for latest assets...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleModuleError, true);
    window.addEventListener('unhandledrejection', (e) => handleModuleError(e.reason));

    // 2. Original socket listeners
    if (!isAuthenticated || !user) return;

    const socket = getSocket();
    
    // Handle team battle invitations/pulls
    socket.on("team_battle_invite", (data) => {
      console.log("Global Pull Received:", data);
      
      // Store the active battle ID
      localStorage.setItem("active_battle_id", data.battleId);
      
      // Navigate to the battle room
      navigate(`/battle-room/${data.battleId}`, { replace: true });
    });

    socket.on("new_notification", (data) => {
      dispatch(addNotification(data));
    });

    return () => {
      socket.off("team_battle_invite");
      socket.off("new_notification");
    };
  }, [isAuthenticated, user, navigate]);

  return null;
};

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, profileLoading } = useSelector((state) => state.auth);

  // Global session restoration and OAuth token capture on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("accessToken");
    const urlRefreshToken = params.get("refreshToken");

    if (urlToken) {
      localStorage.setItem("accessToken", urlToken);
      if (urlRefreshToken) localStorage.setItem("refreshToken", urlRefreshToken);
      
      // Clean up URL for security
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Trigger profile fetch immediately since we now have a token
      dispatch(fetchUserProfile()).catch(() => { });
    } else if (!isAuthenticated) {
      // Normal refresh/fetch if no token in URL
      dispatch(fetchUserProfile()).catch(() => { });
    }
  }, [dispatch, isAuthenticated, location.search]);

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
  const isAuthRoute = location.pathname === "/login";
  const shouldBlockUI = profileLoading && !isAuthRoute;

  if (shouldBlockUI) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <div className="text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-[0.4em] font-mono">Connecting...</div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            borderRadius: '2px',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-primary)',
              secondary: '#000',
            },
          },
        }}
      />
      <GlobalSocketListener />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
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
              <BattleArena />
            </ProtectedRoute>
          } />
          <Route path='/leaderboard' element={<Leaderboard />} />

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
          <Route path='/admin-contests' element={
            <ProtectedRoute>
              <AdminContests />
            </ProtectedRoute>
          } />
          <Route path="/spectate/:battleId" element={
            <SpectatorArena />
          } />
          <Route path="/live" element={<LiveArenas />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/contests/:id" element={
            <ProtectedRoute>
              <ContestDetail />
            </ProtectedRoute>
          } />
          <Route path="/contest/:contestId/arena/:problemId" element={
            <ProtectedRoute>
              <ContestArena />
            </ProtectedRoute>
          } />
          <Route path="/achievements" element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          } />
        </Routes>
    </MainLayout>
  )
}

export default App
