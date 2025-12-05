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
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route - Get all published posts
router.get("/", getAllPosts);

// Public route - Get single post
router.get("/:id", getPostById);

// Download/view post file (public for now, can be protected)
router.get("/:id/download", downloadPostFile);

// Protected routes (require authentication)
router.post("/", verifyToken, upload.single("file"), createPost);
router.put("/:id", verifyToken, upload.single("file"), updatePost);
router.delete("/:id", verifyToken, deletePost);

export default router;
