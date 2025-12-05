import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  downloadFile,
} from "../controllers/userController.js";
import upload from "../middleware/uploadMiddleware.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(verifyToken);

// Get all users - Changed from /users to /
router.get("/", getAllUsers);

// Get single user - Changed from /users/:id to /:id
router.get("/:id", getUserById);

// Create user with file upload - Changed from /users to /
router.post("/", upload.single("file"), createUser);

// Update user with optional file upload - Changed from /users/:id to /:id
router.put("/:id", upload.single("file"), updateUser);

// Delete user - Changed from /users/:id to /:id
router.delete("/:id", deleteUser);

// Download user's file - Changed from /users/:id/download to /:id/download
router.get("/:id/download", downloadFile);

export default router;
