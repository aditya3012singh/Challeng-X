import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../store/api/auth.thunk";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login");
    }
  };

  return (
    <nav className="bg-[#1a1a1a] border-b border-gray-800 text-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-between items-center h-12">
          {/* Left Section - Logo & Navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 font-bold text-lg">
              {/* <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-sm">
                C
              </div> */}
              <span className="text-white font-serif ">CodeArena</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 text-sm">
              <Link 
                to="/" 
                className="px-3 py-1.5 text-gray-300 hover:text-white transition-colors"
              >
                Explore
              </Link>
              <Link 
                to="/problems" 
                className="px-3 py-1.5 text-white font-medium"
              >
                Problems
              </Link>
              <Link 
                to="/battles" 
                className="px-3 py-1.5 text-gray-300 hover:text-white transition-colors"
              >
                Contest
              </Link>
              <Link 
                to="/leaderboard" 
                className="px-3 py-1.5 text-gray-300 hover:text-white transition-colors"
              >
                Discuss
              </Link>
              
              {/* Dropdown Style Links */}
              {/* <button className="px-3 py-1.5 text-gray-300 hover:text-white transition-colors flex items-center">
                Interview
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button> */}
              
              {/* <button className="px-3 py-1.5 text-orange-400 hover:text-orange-300 transition-colors flex items-center font-medium">
                Store
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button> */}
            </div>
          </div>

          {/* Right Section - Search, Icons & User */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Search Bar */}
                <div className="hidden lg:flex items-center bg-[#2a2a2a] rounded-lg px-3 py-1.5 w-64">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search"
                    className="bg-transparent text-gray-300 text-sm outline-none flex-1 placeholder-gray-500"
                  />
                </div>

                {/* Notification Bell */}
                <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {/* Notification Badge */}
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Fire Icon with Count */}
                <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2c1.1 0 2 .9 2 2v5l3-3v10c0 3.3-2.7 6-6 6s-6-2.7-6-6c0-1.8.8-3.4 2-4.5V4c0-1.1.9-2 2-2h3z"/>
                  </svg>
                  <span className="text-sm">0</span>
                </button>

                {/* User Avatar & Premium */}
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 hover:bg-[#2a2a2a] rounded-lg px-2 py-1 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-orange-400 font-medium text-sm hidden lg:block">Premium</span>
                  </button>
                </div>

                {/* Logout Button - Hidden on mobile */}
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-gray-300 hover:text-white text-sm px-3 py-1.5 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Not Authenticated */}
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-white text-sm px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-400 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;