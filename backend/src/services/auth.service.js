import Database from "../config/db.js";
import bcrypt from "bcrypt";
import JwtService from "../utils/jwt.js";

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

class AuthService {
  static async loginService(email, password) {

  const user = await Database.client.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  // 🔒 account locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error("Account locked. Try later.");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    await Database.client.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: { increment: 1 },
        lockUntil:
          user.failedLoginCount + 1 >= MAX_ATTEMPTS
            ? new Date(Date.now() + LOCK_TIME)
            : null,
      },
    });
    throw new Error("Invalid credentials");
  }

  // ✅ reset failures
  await Database.client.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockUntil: null },
  });

  const accessToken = JwtService.generateAccessToken({
    id: user.id,
    role: user.role,
  });

  const refreshToken = JwtService.generateRefreshToken({ id: user.id });

  // 🔁 token rotation (store hash)
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await Database.client.user.update({
    where: { id: user.id },
    data: { refreshTokenHash },
  });

  return { accessToken, refreshToken, user };
  }

  static async registerService(email, username, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await Database.client.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: "USER", // 👈 enforce default
      },
    });

    return { message: "Registration successful" };
  } catch (error) {
    // Prisma unique constraint error
    if (error.code === "P2002") {
      const err = new Error("Email already in use");
      err.status = 409;
      throw err;
    }
    throw error;
  }
  }

  static async refreshTokenService(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  let payload;
  try {
    payload = JwtService.verifyRefreshToken(token);
  } catch {
    return res.sendStatus(401);
  }

  const user = await Database.client.user.findUnique({
    where: { id: payload.id },
  });

  if (!user || !user.refreshTokenHash) {
    return res.sendStatus(403);
  }

  // 🚨 REUSE DETECTION
  const tokenMatches = await bcrypt.compare(
    token,
    user.refreshTokenHash
  );

  if (!tokenMatches) {
    // 🔥 Token reuse detected
    await Database.client.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: null,
        tokenVersion: { increment: 1 }, // invalidate ALL tokens
      },
    });

    return res.status(403).json({
      message: "Refresh token reuse detected. Session revoked.",
    });
  }

  // 🔄 Rotate tokens
  const newAccessToken = JwtService.generateAccessToken({
    id: user.id,
    role: user.role,
  });

  const newRefreshToken = JwtService.generateRefreshToken({
    id: user.id,
    tokenVersion: user.tokenVersion,
  });

  const newHash = await bcrypt.hash(newRefreshToken, 10);

  await Database.client.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: newHash },
  });

  const { accessCookieOptions, refreshCookieOptions } = await import("../utils/cookies.js");

  res
    .cookie("accessToken", newAccessToken, accessCookieOptions)
    .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
    .json({ message: "Token refreshed" });
  }
}

export default AuthService;



// logout, reset password, reset named user, etc. can be added similarly