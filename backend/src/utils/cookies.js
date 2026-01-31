const isProd = process.env.NODE_ENV === "production";

export const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,                 // ❗ false on localhost
  sameSite: isProd ? "none" : "lax",
  maxAge: 15 * 60 * 1000,          // 15 min
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
