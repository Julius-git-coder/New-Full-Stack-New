// Backend/routes/userRoutes.js
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
import verifyToken, { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All user management routes require authentication and admin privileges
router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", upload.single("file"), createUser);
router.put("/:id", upload.single("file"), updateUser);
router.delete("/:id", deleteUser);
router.get("/:id/download", downloadFile);

export default router;
