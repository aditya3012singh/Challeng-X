import env from "../config/env.js";

const isProd = env.NODE_ENV === "production";

// Calculate Secure and SameSite based on environment
// 🛡️ CRITICAL: If using HTTP on EC2, Secure=true will block cookies.
// We allow Secure=false even in prod IF we detect it's not a secure context (though in code we usually rely on env)
// For now, let's make it conditional on a new var or just safer defaults.
const cookieSecure = isProd && !env.FRONTEND_URL.startsWith("http://"); 
const cookieSameSite = isProd ? (cookieSecure ? "none" : "lax") : "lax";

class CookieOptions {
  static accessCookieOptions = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    maxAge: 15 * 60 * 1000,          // 15 min
  };

  static refreshCookieOptions = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

export default CookieOptions;
