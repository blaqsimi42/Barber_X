// src/routes/appointments.js
import express from "express";
import {
  bookAppointment,
  getAllAppointments,
  getAppointmentsByName,
  updateAppointmentStatus,
  cancelAppointment,
} from "../controllers/appointmentController.js";

import {  protectAny } from "../middleware/authMiddleware.js";
import { protectVisitor } from "../middleware/visitorMiddleware.js";

const router = express.Router();

// ----------------------------
// PUBLIC ROUTE: Book appointment → returns temp token
router.post("/", bookAppointment);

// ----------------------------
// VISITOR ROUTES (temp token required)
router.get("/visitor/my-appointments", protectVisitor, getAppointmentsByName);
router.put("/visitor/:id/cancel", protectVisitor, cancelAppointment);

// ----------------------------
// ADMIN ROUTES
router.get("/", protectAny, getAllAppointments);
router.put("/:id/status", protectAny, updateAppointmentStatus); // Admin or Worker
router.get("/my/:name", protectAny,protectVisitor, getAppointmentsByName); // Admin/Worker view

export default router;
