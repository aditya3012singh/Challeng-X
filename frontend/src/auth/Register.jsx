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

      <div className="relative max-w-md w-full z-10">
        <div className="premium-card p-12 lg:p-16 shadow-2xl" style={{ borderRadius: "2px" }}>
          <div className="text-center mb-12">
            <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Establishing Identity // Register</div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">New Operative</h2>
          </div>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {(error || validationError) && (
              <div className="border border-red-500/20 bg-red-500/5 text-red-500 p-6 text-[10px] font-bold uppercase tracking-widest text-center" style={{ borderRadius: "2px" }}>
                ⚠ Registration Exception: {validationError || (error.message || error)}
              </div>
            )}

            <div className="space-y-8">
              <div>
                <label htmlFor="username" className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4">
                  Operator Designation
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full bg-[#050505] border border-white/10 px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  style={{ borderRadius: "2px" }}
                  placeholder="USERNAME_X"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4">
                  Communication Node
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-[#050505] border border-white/10 px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  style={{ borderRadius: "2px" }}
                  placeholder="OPERATOR@CORE.ARENA"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4">
                  Secure Key Generation
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
                  Confirm Strategy Key
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

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all transform active:scale-95 shadow-xl"
                style={{ borderRadius: "2px" }}
              >
                {loading ? "Initializing Identity..." : "Authorize Access →"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                Authorized operative?{" "}
                <Link to="/login" className="text-white hover:text-[var(--color-primary)] transition-colors underline underline-offset-4 decoration-white/10">
                  Enter Portal
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
