import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { resetPassword } from "../../store/api/auth.thunk";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await dispatch(resetPassword({ token, newPassword })).unwrap();
      setMessage(response.message);
      
      setTimeout(() => {
          navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Reset password failed:", err);
      setError(err.message || "Failed to process request");
    } finally {
      setLoading(false);
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
            <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Secure Access</div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)] text-center">New Password</h2>
          </div>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {error && (
              <div className="border border-red-500/20 bg-red-500/5 text-red-500 p-6 text-[10px] font-bold uppercase tracking-widest text-center" style={{ borderRadius: "2px" }}>
                ⚠ Error: {error}
              </div>
            )}
            
            {message && (
              <div className="border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 text-[var(--color-success)] p-6 text-[10px] font-bold uppercase tracking-widest text-center" style={{ borderRadius: "2px" }}>
                ✓ {message}
                <div className="text-[8px] text-slate-500 mt-2 lowercase tracking-normal">Redirecting to login via SSL...</div>
              </div>
            )}

            <div className="space-y-8">
              <div>
                <label htmlFor="newPassword" className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-[#050505] border border-white/10 px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  style={{ borderRadius: "2px" }}
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  required
                  minLength={6}
                  className="w-full bg-[#050505] border border-white/10 px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  style={{ borderRadius: "2px" }}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !!message}
                className="w-full py-6 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all transform active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: "2px" }}
              >
                {loading ? "Encrypting..." : "Update Password →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
