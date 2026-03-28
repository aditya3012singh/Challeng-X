import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../store/api/auth.thunk";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [validationError, setValidationError] = useState("");

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
    setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    try {
      await dispatch(
        register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();

      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-text-main)] flex items-center justify-center p-6 relative overflow-hidden font-[family:var(--font-body)]">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[var(--color-primary)] opacity-[0.012] blur-[180px] rounded-full"></div>
      </div>

      <div className="relative max-w-3xl w-full z-10">
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
            <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Register</div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">Create Account</h2>
          </div>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {(error || validationError) && (
              <div className="border border-red-500/20 bg-red-500/5 text-red-500 p-6 text-[10px] font-bold uppercase tracking-widest text-center" style={{ borderRadius: "2px" }}>
                ⚠ Registration Failed: {validationError || (error.message || error)}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Left Column: Identifying info */}
              <div className="space-y-8">
                <div>
                  <label htmlFor="username" className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full bg-[#050505] border border-white/10 px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                    style={{ borderRadius: "2px" }}
                    placeholder="e.g. johndoe"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

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
              </div>

              {/* Right Column: Security info */}
              <div className="space-y-8">
                <div>
                  <label htmlFor="password" className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full bg-[#050505] border border-white/10 px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                    style={{ borderRadius: "2px" }}
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full bg-[#050505] border border-white/10 px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                    style={{ borderRadius: "2px" }}
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all transform active:scale-95 shadow-xl"
                style={{ borderRadius: "2px" }}
              >
                {loading ? "Creating Account..." : "Sign Up →"}
              </button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest font-mono">
                <span className="bg-[#0a0a0a] px-4 text-slate-600">OR Protocols</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => window.location.href = 'http://localhost:4000/api/auth/google'}
                className="flex items-center justify-center gap-3 py-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all text-[9px] font-bold uppercase tracking-widest text-white"
                style={{ borderRadius: "2px" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => window.location.href = 'http://localhost:4000/api/auth/github'}
                className="flex items-center justify-center gap-3 py-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all text-[9px] font-bold uppercase tracking-widest text-white"
                style={{ borderRadius: "2px" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.73.084-.73 1.207.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                GitHub
              </button>
            </div>

            <div className="text-center">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                Already have an account?{" "}
                <Link to="/login" className="text-white hover:text-[var(--color-primary)] transition-colors underline underline-offset-4 decoration-white/10">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
