export const accessCookieOptions = {
  httpOnly: true,
  secure: true,      // true in prod
  sameSite: "strict",
  maxAge: 15 * 60 * 1000, // 15 min
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
