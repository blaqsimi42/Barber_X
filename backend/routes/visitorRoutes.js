import express from "express";
import {
  registerVisitor,
  loginVisitor,
  getVisitorProfile,
  getVisitorAppointments,
  cancelVisitorAppointment,
  updateVisitorProfile,
  getVisitorBenchInfo,
} from "../controllers/visitorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerVisitor);
router.post("/login", loginVisitor);

// Protected routes (Visitor only)
router.get("/profile", protect, getVisitorProfile);
router.put("/profile", protect, updateVisitorProfile);
router.get("/appointments", protect, getVisitorAppointments);
router.put(
  "/cancel-appointment/:appointmentId",
  protect,
  cancelVisitorAppointment,
);
router.get("/bench-info/:appointmentId", protect, getVisitorBenchInfo);

export default router;
