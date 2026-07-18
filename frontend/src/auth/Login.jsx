import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { login } from "../../store/api/auth.thunk";
import { Eye, EyeOff, Lock, Mail, Swords } from "lucide-react";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo);
  }, [isAuthenticated, navigate, redirectTo]);

  // Particle canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.4 + 0.05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.o * 0.6})`;
        ctx.fill();
      });
      // Draw faint connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.03 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      navigate(redirectTo);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/github?redirectTo=${encodeURIComponent(redirectTo)}`;
  };

  return (
    <div className="relative bg-[#09090b] text-neutral-50 min-h-screen w-full overflow-x-hidden flex items-center justify-center font-[family:var(--font-body)]">
      {/* Particle Canvas Overlay */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Main Container */}
      <div className="flex flex-col md:flex-row w-full min-h-screen z-10">
        
        {/* Left Side: Esports Graphics Dashboard & Code widgets */}
        <div className="relative hidden md:flex md:w-1/2 bg-[#09090b] h-screen overflow-hidden flex-col justify-end p-16 select-none border-r border-white/5">
          {/* Cover Background Image */}
          <img
            alt="Dark code editor"
            className="object-cover opacity-15 absolute inset-0 w-full h-full pointer-events-none"
            src="https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
          />
          {/* Radial Ambient Dark Gradients */}
          <div className="bg-[radial-gradient(circle_at_30%_20%,rgba(18,18,18,0.9),transparent_70%)] absolute inset-0" />
          <div className="bg-gradient-to-br from-[#09090b]/80 via-transparent to-[#09090b]/90 absolute inset-0" />
          
          {/* Floating HUD code card 1 */}
          <div className="backdrop-blur-md shadow-2xl rotate-[-4deg] rounded-sm bg-[#18181b]/55 border border-white/5 absolute left-12 top-20 p-4 transition-transform hover:rotate-[-2deg] duration-300">
            <pre className="font-mono text-neutral-400 text-[10px] leading-relaxed">
              <code>{`function challenge() {
  const arena = new Battle();
  return arena.compile();
}`}</code>
            </pre>
          </div>

          {/* Floating HUD code card 2 */}
          <div className="backdrop-blur-md shadow-2xl rotate-[3deg] rounded-sm bg-[#18181b]/45 border border-white/5 absolute right-16 top-48 p-4 transition-transform hover:rotate-[1deg] duration-300">
            <pre className="font-mono text-neutral-400 text-[10px] leading-relaxed">
              <code>{`> deploy --arena
[ok] tests passed
[ok] rank +42`}</code>
            </pre>
          </div>

          {/* Floating HUD code card 3 */}
          <div className="backdrop-blur-md shadow-2xl rotate-[2deg] rounded-sm bg-[#18181b]/50 border border-white/5 absolute left-16 bottom-56 p-4 transition-transform hover:rotate-[0deg] duration-300">
            <pre className="font-mono text-neutral-400 text-[10px] leading-relaxed">
              <code>const winner = players.sort(byScore)[0];</code>
            </pre>
          </div>

          {/* Bottom Branding & Hype Headers */}
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white text-black font-black flex items-center justify-center text-xl" style={{ borderRadius: "2px" }}>
                X
              </div>
              <span className="font-[family:var(--font-heading)] font-black text-2xl tracking-tighter uppercase">
                ChallengX
              </span>
            </div>
            <h2 className="font-[family:var(--font-heading)] leading-tight max-w-md font-bold text-4xl leading-10 uppercase tracking-tight">
              Enter the Developer Arena
            </h2>
            <p className="max-w-sm font-[family:var(--font-body)] text-neutral-400 text-sm leading-5 tracking-tight">
              Compete in real-time coding battles, climb the leaderboard, and prove your skills in the survival arena.
            </p>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full md:w-1/2 bg-[#09090b] flex p-8 sm:p-16 justify-center items-center min-h-screen overflow-y-auto">
          <div className="max-w-md w-full shadow-2xl rounded-xl bg-[#18181b] border border-white/5 p-8 sm:p-10 flex flex-col gap-6">
            
            {/* Card Header */}
            <div className="text-center flex flex-col gap-2">
              <h1 className="font-[family:var(--font-heading)] font-bold text-2xl tracking-tight">
                Welcome back
              </h1>
              <p className="text-neutral-400 text-sm">
                Sign in to continue to your arena
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-xs text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>Auth Failed — {error.message || error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email Address */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-widest" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="top-1/2 -translate-y-1/2 size-4 text-neutral-500 absolute left-3" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-[#09090b] border border-white/5 px-3 py-2.5 pl-9 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="you@dev.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-widest" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="top-1/2 -translate-y-1/2 size-4 text-neutral-500 absolute left-3" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-[#09090b] border border-white/5 px-3 py-2.5 pl-9 pr-10 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="top-1/2 -translate-y-1/2 text-neutral-400 absolute right-3 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Form Options Row */}
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 rounded bg-[#09090b] border border-white/5 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <label className="text-xs text-neutral-400 cursor-pointer select-none" htmlFor="remember">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-xs text-neutral-400 hover:text-white transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit CTA */}
              <button 
                type="submit" 
                disabled={loading}
                className="mt-2 font-semibold py-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 w-full transition-all cursor-pointer flex items-center justify-center min-h-[40px] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="bg-white/5 flex-1 h-px" />
              <span className="text-neutral-500 text-xs leading-4 tracking-wider uppercase">
                or continue with
              </span>
              <div className="bg-white/5 flex-1 h-px" />
            </div>

            {/* Social Logins */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="bg-transparent border border-white/5 hover:bg-white/5 rounded-lg py-2.5 flex-1 gap-2 flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer"
              >
                {/* Google Icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={handleGithubLogin}
                className="bg-transparent border border-white/5 hover:bg-white/5 rounded-lg py-2.5 flex-1 gap-2 flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer"
              >
                {/* GitHub Icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.73.084-.73 1.207.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Secure Session Caption */}
            <div className="text-center text-[10px] uppercase tracking-[0.2em] text-neutral-600 mt-2">
              Secure Encrypted Arena Session
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
