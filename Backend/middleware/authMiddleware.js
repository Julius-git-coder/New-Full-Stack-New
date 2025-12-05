// Backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";

// Verify token middleware
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "Invalid token. User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Verify admin role middleware
export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(403).json({ error: "Access denied." });
  }
};

// Default export for backward compatibility
export default verifyToken;
