// auth.middleware.js

import  jwt  from "jsonwebtoken";

// Protect routes
const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ message: "Unauthorized" });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

export default authMiddleware;