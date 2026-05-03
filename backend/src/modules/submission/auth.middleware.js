// auth.middleware.js

import jwt from "jsonwebtoken";

class AuthMiddleware {
  // Protect routes
  static handle(req, res, next) {
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = decoded; // { userId, role }
      next();
    } catch (err) {
      return res.status(401).json({ message: "Token expired or invalid" });
    }
  }

  // Optional auth: Doesn't block if token is missing
  static optional(req, res, next) {
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next();

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      // Even if token is invalid, we proceed as guest
      next();
    }
  }

  // Admin only check
  static adminOnly(req, res, next) {
    if (req.user && req.user.role === "ADMIN") {
      next();
    } else {
      return res.status(403).json({ message: "Forbidden: Admin access only" });
    }
  }
}

export default AuthMiddleware;
