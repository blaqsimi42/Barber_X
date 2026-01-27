import express from "express";
import {
  registerWorker,
  loginWorker,
  getColleagues,
} from "../controllers/workerController.js";
import { protectWorker } from "../middleware/authMiddleware.js";

const router = express.Router();

// Worker registration (with admin code)
router.post("/register", registerWorker);

// Worker login
router.post("/login", loginWorker);

// ✅ Get colleagues (same admin)
router.get("/colleagues", protectWorker, getColleagues);

export default router;
