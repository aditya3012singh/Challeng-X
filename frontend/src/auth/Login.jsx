import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../store/api/auth.thunk";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-text-main)] flex items-center justify-center p-6 relative overflow-hidden font-[family:var(--font-body)]">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[var(--color-primary)] opacity-[0.012] blur-[180px] rounded-full"></div>
      </div>

      <div className="relative max-w-md w-full z-10">
        <div className="premium-card p-12 lg:p-16 shadow-2xl" style={{ borderRadius: "2px" }}>
          <div className="flex flex-col items-center mb-12">
            <Link to="/" className="flex items-center gap-3 group mb-8 scale-125">
              <div className="w-10 h-10 bg-[var(--color-primary)] text-black flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(255,170,0,0.2)] transition-all" style={{ borderRadius: "2px" }}>
                CA
              </div>
              <div className="text-left">
                <span className="text-lg font-bold tracking-tight text-white block leading-none">CODE</span>
                <span className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] block leading-none mt-1">ARENA</span>
              </div>
            </Link>
            <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Sign In</div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">Welcome Back</h2>
          </div>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {error && (
              <div className="border border-red-500/20 bg-red-500/5 text-red-500 p-6 text-[10px] font-bold uppercase tracking-widest text-center" style={{ borderRadius: "2px" }}>
                ⚠ Login Failed: {error.message || error}
              </div>
            )}

            <div className="space-y-8">
              <div>
                <label htmlFor="email" className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-[#050505] border border-white/10 px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  style={{ borderRadius: "2px" }}
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#050505] border border-white/10 px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  style={{ borderRadius: "2px" }}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all transform active:scale-95 shadow-xl"
                style={{ borderRadius: "2px" }}
              >
                {loading ? "Signing In..." : "Sign In →"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                Don't have an account?{" "}
                <Link to="/register" className="text-white hover:text-[var(--color-primary)] transition-colors underline underline-offset-4 decoration-white/10">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
