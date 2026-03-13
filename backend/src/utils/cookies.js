import env from "../config/env.js";

const isProd = env.NODE_ENV === "production";
const cookieSameSite = (isProd ? "none" : "lax");
const cookieSecure = isProd;

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
