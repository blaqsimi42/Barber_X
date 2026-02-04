import asyncHandler from "express-async-handler";
import Appointment from "../models/appointmentModel.js";
import Cut from "../models/cutModel.js";
import Visitor from "../models/visitorModel.js";
import ErrorResponse from "../utils/errorResponse.js";
import mongoose from "mongoose";
import { generateTempToken, generateToken } from "../utils/generateToken.js";

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
  const {
    fullName,
    email,
    phone,
    cutId,
    appointmentDate,
    appointmentTime,
    password,
  } = req.body;

  if (!fullName || !cutId || !appointmentDate || !appointmentTime) {
    throw new ErrorResponse("All fields are required", 400);
  }

  // Parse date-only strings (YYYY-MM-DD) as local date to avoid timezone shifts
  let appointmentDateObj;
  if (/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
    const [y, m, d] = appointmentDate.split("-").map(Number);
    appointmentDateObj = new Date(y, m - 1, d);
  } else {
    appointmentDateObj = new Date(appointmentDate);
  }

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
  // Validate time format H:MM or HH:MM and ensure valid hour/minute ranges
  if (!/^\d{1,2}:\d{2}$/.test(appointmentTime)) {
    throw new ErrorResponse(
      "Invalid appointmentTime format. Use H:MM or HH:MM",
      400,
    );
  }
  const [hourNum, minuteNum] = appointmentTime.split(":").map(Number);
  if (
    Number.isNaN(hourNum) ||
    Number.isNaN(minuteNum) ||
    hourNum < 0 ||
    hourNum > 23 ||
    minuteNum < 0 ||
    minuteNum > 59
  ) {
    throw new ErrorResponse("Invalid appointmentTime value", 400);
  }

  const cut = await Cut.findById(cutId);
  if (!cut) {
    throw new ErrorResponse("Cut not found", 404);
  }

  const appointmentTimeMinutes = timeToMinutes(appointmentTime);

  // If booking for today, ensure time is not in the past (give a small buffer)
  const now = new Date();
  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);
  const selectedLocal = new Date(appointmentDateObj);
  selectedLocal.setHours(0, 0, 0, 0);
  if (selectedLocal.getTime() === todayLocal.getTime()) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const minAllowed = currentMinutes + 1; // 1 minute buffer
    if (appointmentTimeMinutes < minAllowed) {
      throw new ErrorResponse(
        "Appointment time must be at least 1 minute from now",
        400,
      );
    }
  }

  // Transaction-safe bench calculation
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Query by date range (start of day → next day) to avoid exact Date equality / timezone issues
    const startOfDay = new Date(appointmentDateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(startOfDay);
    nextDay.setDate(startOfDay.getDate() + 1);

    const existingAppointments = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lt: nextDay },
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

    // ✅ Auto-register or fetch existing visitor
    let visitor = null;
    let visitorToken = null;

    if (email && phone && password) {
      // Try to find existing visitor
      visitor = await Visitor.findOne({ email }).session(session);

      if (!visitor) {
        // Create new visitor
        visitor = await Visitor.create(
          [
            {
              fullName,
              email,
              phone,
              password,
              role: "visitor",
            },
          ],
          { session },
        );
        visitor = visitor[0];
      }

      visitorToken = generateToken(visitor._id);
    }

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
          visitorId: visitor?._id || null,
        },
      ],
      { session },
    );

    // Link appointment to visitor if visitor exists
    if (visitor) {
      await Visitor.findByIdAndUpdate(
        visitor._id,
        { $push: { appointments: appointment[0]._id } },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    // ✅ Generate temporary token for visitor (backward compatibility)
    const tempToken = generateTempToken(appointment[0]._id, fullName);

    res.status(201).json({
      success: true,
      appointment: appointment[0],
      tempToken,
      visitor: visitor
        ? {
            _id: visitor._id,
            fullName: visitor.fullName,
            email: visitor.email,
            phone: visitor.phone,
            role: visitor.role,
          }
        : null,
      visitorToken, // ✅ Full JWT token for visitor dashboard login
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
    // record name (for display) and authoritative id/role for relations
    appointment.workerName =
      req.user?.name || req.worker?.name || req.admin?.name || "Unknown";
    appointment.completedAt = new Date();
    appointment.completedById = req.user?._id || null;
    appointment.completedByRole = req.role || null;
  } else {
    appointment.completedAt = null;
    appointment.completedById = null;
    appointment.completedByRole = null;
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
