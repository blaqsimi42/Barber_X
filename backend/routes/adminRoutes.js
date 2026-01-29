import express from "express";
import {
  createAdmin,
  loginAdmin,
  getWorkers,
  updateAdminProfile, // 👈 ADDITION
} from "../controllers/adminController.js";
import { protectAdminOrWorker } from "../middleware/protectAdminOrWorker.js";

const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", loginAdmin);

// Protected route (admin only)
router.get("/workers", protectAdminOrWorker, getWorkers);

// ✅ NEW: Update admin profile (admin only)
router.put("/profile", protectAdminOrWorker, updateAdminProfile);

export default router;
