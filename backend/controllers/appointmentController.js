import asyncHandler from "express-async-handler";
import Appointment from "../models/appointmentModel.js";
import ErrorResponse from "../utils/errorResponse.js";

// Allowed statuses
const allowedStatuses = ["pending", "completed", "cancelled"];

// Helper: convert "HH:MM" to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

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

  // Calculate bench numbers dynamically based on date and time order
  const appointmentsWithBench = appointments.map((app) => {
    const appObj = app.toObject();

    // Count how many pending appointments are on the same day with earlier time
    const sameDate = appointments.filter((a) => {
      const aDate = new Date(a.appointmentDate);
      const appDate = new Date(app.appointmentDate);
      aDate.setHours(0, 0, 0, 0);
      appDate.setHours(0, 0, 0, 0);
      return aDate.getTime() === appDate.getTime() && a.status === "pending";
    });

    sameDate.sort(
      (a, b) =>
        timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime),
    );

    const benchIndex = sameDate.findIndex(
      (a) => a._id.toString() === app._id.toString(),
    );
    appObj.benchNumber = benchIndex >= 0 ? benchIndex + 1 : 0;

    return appObj;
  });

  res.json(appointmentsWithBench);
});

// ----------------------------
// @desc    Get appointments by customer name (admin or worker)
// @route   GET /api/appointments/my/:name
// @access  Admin/Worker
export const getAppointmentsByName = asyncHandler(async (req, res) => {
  const name = req.user?.name || req.user?.fullName || req.params.name;

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

  // Get all appointments to calculate bench number
  const allAppointments = await Appointment.find();

  // Calculate bench numbers dynamically
  const appointmentsWithBench = appointments.map((app) => {
    const appObj = app.toObject();

    // Count how many pending appointments are on the same day with earlier time
    const sameDate = allAppointments.filter((a) => {
      const aDate = new Date(a.appointmentDate);
      const appDate = new Date(app.appointmentDate);
      aDate.setHours(0, 0, 0, 0);
      appDate.setHours(0, 0, 0, 0);
      return aDate.getTime() === appDate.getTime() && a.status === "pending";
    });

    sameDate.sort(
      (a, b) =>
        timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime),
    );

    const benchIndex = sameDate.findIndex(
      (a) => a._id.toString() === app._id.toString(),
    );
    appObj.benchNumber = benchIndex >= 0 ? benchIndex + 1 : 0;

    return appObj;
  });

  res.json(appointmentsWithBench);
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
// @access  Admin/Worker
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
