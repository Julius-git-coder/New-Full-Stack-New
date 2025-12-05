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
router.get("/posts", getAllPosts);

// Public route - Get single post
router.get("/posts/:id", getPostById);

// Protected routes (require authentication)
router.use(verifyToken);

// Create post with file upload
router.post("/posts", upload.single("file"), createPost);

// Update post with optional file upload
router.put("/posts/:id", upload.single("file"), updatePost);

// Delete post
router.delete("/posts/:id", deletePost);

// Download/view post file
router.get("/posts/:id/download", downloadPostFile);

export default router;
