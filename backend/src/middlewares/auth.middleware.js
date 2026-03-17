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
}

export default AuthMiddleware;