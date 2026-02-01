import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import { fetchUserProfile } from '../store/api/auth.thunk'
import './App.css'
import { Problem } from './pages/Problem'
import { ProblemDetail } from './pages/ProblemDetails'
import Ide from './pages/Ide'
import Battle from './pages/Battle'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, profileLoading } = useSelector((state) => state.auth);
  
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, profileLoading } = useSelector((state) => state.auth);

  // Fetch user profile on app load
  useEffect(() => {
    // Only fetch if not already authenticated and not currently loading
    if (!isAuthenticated && !profileLoading) {
      dispatch(fetchUserProfile());
    }
  }, []);

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
          <ProtectedRoute>
            <Problem/>
          </ProtectedRoute>
        } />
        <Route path='/problem/:id' element={
          <ProtectedRoute>
            <ProblemDetail/>
          </ProtectedRoute>
        } />
        <Route path='/battles' element={
          <ProtectedRoute>
            <Battle/>
          </ProtectedRoute>
        } />
        <Route path='/battle/:battleId/ide' element={
          <ProtectedRoute>
            <Ide/>
          </ProtectedRoute>
        } />
        
      </Routes>
    </Router>
  )
}

export default App
