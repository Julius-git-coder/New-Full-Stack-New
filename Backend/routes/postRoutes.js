// Backend/routes/postRoutes.js
import express from "express";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  downloadPostFile,
} from "../controllers/postController.js";
import upload from "../middleware/uploadMiddleware.js";
import verifyToken, { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes - Anyone can view posts
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/:id/download", downloadPostFile);

// Protected routes - Only authenticated admins can manage posts
router.post("/", verifyToken, verifyAdmin, upload.single("file"), createPost);
router.put("/:id", verifyToken, verifyAdmin, upload.single("file"), updatePost);
router.delete("/:id", verifyToken, verifyAdmin, deletePost);

export default router;
