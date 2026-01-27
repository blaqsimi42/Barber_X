import express from "express";
import {
  createAdmin,
  loginAdmin,
  getWorkers,
} from "../controllers/adminController.js";
import { protectAdminOrWorker } from "../middleware/protectAdminOrWorker.js";

const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", loginAdmin);

// Protected route (admin only)
router.get("/workers", protectAdminOrWorker, getWorkers);

export default router;
