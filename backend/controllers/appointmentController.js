import asyncHandler from "express-async-handler";
import Appointment from "../models/appointmentModel.js";
import Cut from "../models/cutModel.js";
import ErrorResponse from "../utils/errorResponse.js";
import mongoose from "mongoose";
import { generateTempToken } from "../utils/generateToken.js";

// Allowed statuses
const allowedStatuses = ["pending", "completed", "cancelled"];

// Helper: convert "HH:MM" to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// ----------------------------
// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Public (visitor)
export const bookAppointment = asyncHandler(async (req, res) => {
  const { fullName, cutId, appointmentDate, appointmentTime } = req.body;

  if (!fullName || !cutId || !appointmentDate || !appointmentTime) {
    throw new ErrorResponse("All fields are required", 400);
  }

  const appointmentDateObj = new Date(appointmentDate);
  if (isNaN(appointmentDateObj.getTime())) {
    throw new ErrorResponse("Invalid appointmentDate", 400);
  }

  // ✅ Prevent selecting past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset time
  const selectedDate = new Date(appointmentDate);
  selectedDate.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    throw new ErrorResponse("Appointment date cannot be in the past", 400);
  }

  // Validate time format HH:MM
  if (!/^\d{2}:\d{2}$/.test(appointmentTime)) {
    throw new ErrorResponse("Invalid appointmentTime format. Use HH:MM", 400);
  }

  const cut = await Cut.findById(cutId);
  if (!cut) {
    throw new ErrorResponse("Cut not found", 404);
  }

  const appointmentTimeMinutes = timeToMinutes(appointmentTime);

  // Transaction-safe bench calculation
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingAppointments = await Appointment.find({
      appointmentDate: appointmentDateObj,
      status: "pending",
    }).session(session);

    const existingTimes = existingAppointments.map((a) =>
      timeToMinutes(a.appointmentTime),
    );

    if (existingTimes.length > 0) {
      const latestTime = Math.max(...existingTimes);
      if (appointmentTimeMinutes <= latestTime) {
        throw new ErrorResponse(
          `Time taken. Choose a time later than ${String(
            Math.floor(latestTime / 60),
          ).padStart(2, "0")}:${String(latestTime % 60).padStart(2, "0")}`,
          400,
        );
      }
    }

    const benchCount = existingAppointments.filter(
      (a) => timeToMinutes(a.appointmentTime) < appointmentTimeMinutes,
    ).length;

    const benchNumber = benchCount + 1;

    const appointment = await Appointment.create(
      [
        {
          fullName,
          cutId,
          cutName: cut.name,
          price: cut.price,
          appointmentDate: appointmentDateObj,
          appointmentTime,
          benchNumber,
          status: "pending",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // ✅ Generate temporary token for visitor
    const tempToken = generateTempToken(appointment[0]._id, fullName);

    res.status(201).json({
      appointment: appointment[0],
      tempToken,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// ----------------------------
// @desc    Get all appointments (admin)
// @route   GET /api/appointments
// @access  Admin
export const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find();

  appointments.sort((a, b) => {
    const dateA = new Date(a.appointmentDate);
    const dateB = new Date(b.appointmentDate);

    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;

    return timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime);
  });

  res.json(appointments);
});

// ----------------------------
// @desc    Get appointments by customer name (admin or worker)
// @route   GET /api/appointments/my/:name
// @access  Admin/Worker/Public (visitor token)
export const getAppointmentsByName = asyncHandler(async (req, res) => {
  const name = req.visitor?.fullName || req.params.name;

  const appointments = await Appointment.find({
    fullName: { $regex: new RegExp(`^${name}$`, "i") },
  });

  appointments.sort((a, b) => {
    const dateA = new Date(a.appointmentDate);
    const dateB = new Date(b.appointmentDate);

    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;

    return timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime);
  });

  res.json(appointments);
});

// ----------------------------
// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Admin or Worker
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    throw new ErrorResponse("Invalid status", 400);
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new ErrorResponse("Appointment not found", 404);
  }

  appointment.status = status;

  if (status === "completed") {
    appointment.workerName =
      req.user?.name || req.worker?.name || req.admin?.name || "Unknown";
    appointment.completedAt = new Date();
  } else {
    appointment.completedAt = null;
  }

  await appointment.save();

  res.json({
    message:
      status === "completed"
        ? `Appointment marked as completed by ${appointment.workerName}`
        : `Appointment status updated to '${status}'`,
    appointment,
  });
});

// ----------------------------
// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Visitor / Customer / Public
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ErrorResponse("Appointment not found", 404);
  }

  if (appointment.status === "cancelled") {
    throw new ErrorResponse("Appointment is already cancelled", 400);
  }

  if (appointment.status === "completed") {
    throw new ErrorResponse("Completed appointments cannot be cancelled", 400);
  }

  appointment.status = "cancelled";
  await appointment.save();

  res.json({ message: "Appointment cancelled successfully", appointment });
});
