import Database from "../config/db.js";
import bcrypt from "bcrypt";
import JwtService from "../utils/jwt.js";
import crypto from "crypto";

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

      const user = await Database.client.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role: "USER", // 👈 enforce default
        },
      });

      // Issuing tokens for auto-login
      const accessToken = JwtService.generateAccessToken({
        id: user.id,
        role: user.role,
      });

      const refreshToken = JwtService.generateRefreshToken({ id: user.id });
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      await Database.client.user.update({
        where: { id: user.id },
        data: { refreshTokenHash },
      });

      return {
        message: "Registration successful",
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      // Prisma unique constraint error
      if (error.code === "P2002") {
        const target = error.meta?.target || [];
        const isEmail = target.includes("email");
        const isUsername = target.includes("username");

        let message = "Registration conflict";
        if (isEmail) message = "Email already in use";
        else if (isUsername) message = "Username already in use";

        const err = new Error(message);
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

    const { default: CookieOptions } = await import("../utils/cookies.js");

    res
      .cookie("accessToken", newAccessToken, CookieOptions.accessCookieOptions)
      .cookie("refreshToken", newRefreshToken, CookieOptions.refreshCookieOptions)
      .json({ message: "Token refreshed", accessToken: newAccessToken });
  }
  static async forgotPasswordService(email) {
    const user = await Database.client.user.findUnique({ where: { email } });
    if (!user) {
      // Return a success message anyway so we don't leak registered emails
      return { message: "If an account with that email exists, a reset link has been sent." };
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token for database
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Expiry: 15 minutes from now
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Save token and expiry
    await Database.client.user.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: tokenExpiry,
      },
    });

    // Mock Email Service - Logging to Console for Development
    console.log(`\n======================================================`);
    console.log(`[EMAIL MOCK] Forgot Password Request for ${email}`);
    console.log(`Click this link to reset password:`);
    console.log(`http://localhost:5173/reset-password/${resetToken}`);
    console.log(`======================================================\n`);

    // In a real production app, you would integrate Nodemailer or AWS SES here
    
    return {
       message: "If an account with that email exists, a reset link has been sent.",
       devTokenHint: resetToken // Exposing solely so we can auto-fill this in local development frontend
    };
  }

  static async resetPasswordService(token, newPassword) {
    // Re-hash the provided token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await Database.client.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gte: new Date() }, // ensure it hasn't expired
      },
    });

    if (!user) {
      throw new Error("Token is invalid or has expired");
    }

    // Hash the new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear the reset fields
    await Database.client.user.update({
      where: { id: user.id },
      data: {
        password: newHashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: "Password has been successfully reset" };
  }
}

export default AuthService;



// logout, reset password, reset named user, etc. can be added similarly