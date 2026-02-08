// src/routes/appointments.js
import express from "express";
import {
  getAllAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  createAppointment,
} from "../controllers/appointmentController.js";

import { protectAny } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin/Worker routes
router.get("/", protectAny, getAllAppointments);
router.post("/", createAppointment);
router.put("/:id/status", protectAny, updateAppointmentStatus);
router.put("/:id/cancel", protectAny, cancelAppointment);

export default router;
