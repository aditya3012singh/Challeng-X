const isProd = process.env.NODE_ENV === "production";
const cookieSameSite = process.env.COOKIE_SAMESITE || (isProd ? "none" : "lax");
const cookieSecure = process.env.COOKIE_SECURE === "true" || isProd;

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
