import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../store/api/auth.thunk";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

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
        ctx.fillStyle = `rgba(255, 170, 0, ${p.o})`;
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
            ctx.strokeStyle = `rgba(255,170,0,${0.04 * (1 - dist / 120)})`;
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
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        :root {
          --gold: #FFAA00;
          --gold-dim: rgba(255,170,0,0.15);
          --gold-glow: rgba(255,170,0,0.08);
          --surface: rgba(10,10,10,0.85);
          --border: rgba(255,255,255,0.06);
          --border-focus: rgba(255,170,0,0.35);
          --text-muted: #3a3a3a;
          --text-dim: #555;
        }

        .login-root {
          min-height: 100vh;
          background: #030303;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .canvas-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        /* Radial glow blobs */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          z-index: 0;
        }
        .blob-1 {
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(255,170,0,0.04) 0%, transparent 70%);
          top: -200px; right: -200px;
        }
        .blob-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(255,170,0,0.025) 0%, transparent 70%);
          bottom: -150px; left: -100px;
        }

        /* Diagonal rule lines */
        .grid-lines {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.012;
          background-image:
            repeating-linear-gradient(
              -45deg,
              rgba(255,170,0,1) 0px,
              rgba(255,170,0,1) 1px,
              transparent 1px,
              transparent 80px
            );
        }

        /* Card */
        .card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          background: rgba(8,8,8,0.92);
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          padding: 52px 48px 48px;
          box-shadow:
            0 0 0 1px rgba(255,170,0,0.04),
            0 40px 80px rgba(0,0,0,0.6),
            0 0 120px rgba(255,170,0,0.03);
          transform: translateY(${mounted ? "0" : "20px"});
          opacity: ${mounted ? 1 : 0};
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.7s ease;
        }

        /* Gold corner accent */
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 48px; height: 2px;
          background: var(--gold);
        }
        .card::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 2px; height: 48px;
          background: var(--gold);
        }

        /* Logo */
        .logo-mark {
          width: 44px; height: 44px;
          background: var(--gold);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 17px;
          color: #000;
          letter-spacing: 0.05em;
          position: relative;
          flex-shrink: 0;
        }
        .logo-mark::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 1px solid rgba(255,170,0,0.2);
          pointer-events: none;
        }

        .logo-text-top {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          color: #fff;
          letter-spacing: 0.12em;
          line-height: 1;
        }
        .logo-text-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px;
          color: var(--gold);
          letter-spacing: 0.5em;
          line-height: 1;
          margin-top: 4px;
        }

        /* Section labels */
        .eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.45em;
          color: var(--gold);
          text-transform: uppercase;
        }

        /* Heading */
        .heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 42px;
          color: #fff;
          letter-spacing: 0.06em;
          line-height: 1;
          margin-top: 6px;
        }

        /* Divider */
        .divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, var(--gold) 0%, transparent 60%);
          opacity: 0.15;
          margin: 32px 0;
        }

        /* Input field */
        .field-group { position: relative; }

        .field-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.35em;
          color: #3a3a3a;
          text-transform: uppercase;
          display: block;
          margin-bottom: 10px;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 14px 18px;
          color: #e8e8e8;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 400;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: #2a2a2a; }
        .field-input:focus {
          border-color: rgba(255,170,0,0.3);
          background: rgba(255,170,0,0.02);
          box-shadow: 0 0 0 4px rgba(255,170,0,0.04), inset 0 1px 0 rgba(255,170,0,0.03);
        }

        /* Animated bottom bar */
        .field-bar {
          position: absolute;
          bottom: 0; left: 0;
          height: 1px;
          background: var(--gold);
          transition: width 0.35s cubic-bezier(0.4,0,0.2,1);
        }

        /* Error */
        .error-box {
          border: 1px solid rgba(239,68,68,0.2);
          background: rgba(239,68,68,0.04);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        .error-dot {
          width: 6px; height: 6px;
          background: #ef4444;
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulse-red 1.5s infinite;
        }
        .error-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          color: #ef4444;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        @keyframes pulse-red {
          0%,100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Submit button */
        .btn-primary {
          width: 100%;
          padding: 17px 24px;
          background: var(--gold);
          color: #000;
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .btn-primary:hover { background: #fff; }
        .btn-primary:active { transform: scale(0.985); }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Shimmer on hover */
        .btn-primary::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.45s ease;
        }
        .btn-primary:hover::after { left: 150%; }

        /* OR separator */
        .or-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 28px 0;
        }
        .or-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.04);
        }
        .or-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          color: #2a2a2a;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* OAuth buttons */
        .oauth-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .btn-oauth {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px 16px;
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.06);
          color: #888;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          position: relative;
          overflow: hidden;
        }
        .btn-oauth:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,170,0,0.2);
          color: #ccc;
        }

        /* Signup row */
        .signup-row {
          text-align: center;
          margin-top: 28px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #2a2a2a;
          text-transform: uppercase;
        }
        .signup-row a {
          color: #fff;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .signup-row a:hover {
          color: var(--gold);
          border-color: rgba(255,170,0,0.5);
        }

        /* Forgot password */
        .forgot-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #333;
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .forgot-link:hover { color: var(--gold); }

        /* Loading spinner dots */
        @keyframes dot-bounce {
          0%,80%,100% { transform: scale(0); opacity: 0; }
          40% { transform: scale(1); opacity: 1; }
        }
        .dot { display: inline-block; width: 4px; height: 4px; background: #000; border-radius: 50%; margin: 0 2px; animation: dot-bounce 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      <div className="login-root">
        {/* Ambient background */}
        <canvas ref={canvasRef} className="canvas-bg" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="grid-lines" />

        <div className="card">
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "36px", textDecoration: "none" }}>
            <div className="logo-mark">CA</div>
            <div>
              <div className="logo-text-top">CODE</div>
              <div className="logo-text-sub">ARENA</div>
            </div>
          </Link>

          {/* Header */}
          <div style={{ marginBottom: "36px" }}>
            <div className="eyebrow">Sign In</div>
            <div className="heading">Access the Arena</div>
          </div>

          <div className="divider" />

          {/* Error */}
          {error && (
            <div className="error-box">
              <div className="error-dot" />
              <div className="error-text">Auth Failed — {error.message || error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Email */}
            <div className="field-group">
              <label htmlFor="email" className="field-label ">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="field-input"
                placeholder="you@domain.com"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              />
              <div className="field-bar" style={{ width: focused === "email" ? "100%" : formData.email ? "30%" : "0%" }} />
            </div>

            {/* Password */}
            <div className="field-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label htmlFor="password" className="field-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot?</Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="field-input"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
              />
              <div className="field-bar" style={{ width: focused === "password" ? "100%" : formData.password ? "30%" : "0%" }} />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: "8px" }}>
              {loading ? (
                <>
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </>
              ) : (
                <>Authenticate <span style={{ opacity: 0.6 }}>→</span></>
              )}
            </button>
          </form>

          {/* OR */}
          <div className="or-row">
            <div className="or-line" />
            <span className="or-label">OR Continue With</span>
            <div className="or-line" />
          </div>

          {/* OAuth */}
          <div className="oauth-grid">
            <button
              type="button"
              className="btn-oauth"
              onClick={() => (window.location.href = "http://localhost:4000/api/auth/google")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="btn-oauth"
              onClick={() => (window.location.href = "http://localhost:4000/api/auth/github")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.73.084-.73 1.207.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </button>
          </div>

          {/* Sign up disabled in favor of OAuth */}
          <div className="signup-row" style={{ opacity: 0.5 }}>
            Secure Encrypted Session
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;