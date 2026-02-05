import asyncHandler from "express-async-handler";
import Visitor from "../models/visitorModel.js";
import Appointment from "../models/appointmentModel.js";
import ErrorResponse from "../utils/errorResponse.js";
import { generateToken } from "../utils/generateToken.js";

// ----------------------------
// @desc    Register Visitor (Auto-called on booking)
// @route   POST /api/visitors/register
// @access  Public
export const registerVisitor = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    throw new ErrorResponse("All fields are required", 400);
  }

  // Check if visitor already exists
  let visitor = await Visitor.findOne({ email });
  if (visitor) {
    return res.status(200).json({
      success: true,
      message: "Visitor already exists",
      visitor,
      token: generateToken(visitor._id),
    });
  }

  // Create new visitor
  visitor = await Visitor.create({
    fullName,
    email,
    phone,
    password,
  });

  const token = generateToken(visitor._id);

  res.status(201).json({
    success: true,
    message: "Visitor registered successfully",
    visitor: {
      _id: visitor._id,
      fullName: visitor.fullName,
      email: visitor.email,
      phone: visitor.phone,
      role: visitor.role,
    },
    token,
  });
});

// ----------------------------
// @desc    Visitor Login
// @route   POST /api/visitors/login
// @access  Public
export const loginVisitor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorResponse("Please provide email and password", 400);
  }

  const visitor = await Visitor.findOne({ email }).select("+password");
  if (!visitor) {
    throw new ErrorResponse("Invalid email or password", 401);
  }

  const isPasswordCorrect = await visitor.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ErrorResponse("Invalid email or password", 401);
  }

  const token = generateToken(visitor._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    visitor: {
      _id: visitor._id,
      fullName: visitor.fullName,
      email: visitor.email,
      phone: visitor.phone,
      role: visitor.role,
    },
    token,
  });
});

// ----------------------------
// @desc    Get Visitor Profile
// @route   GET /api/visitors/profile
// @access  Private (Visitor)
export const getVisitorProfile = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.user._id).populate("appointments");

  if (!visitor) {
    throw new ErrorResponse("Visitor not found", 404);
  }

  res.status(200).json({
    success: true,
    visitor,
  });
});

// ----------------------------
// @desc    Get Visitor Appointments
// @route   GET /api/visitors/appointments
// @access  Private (Visitor)
export const getVisitorAppointments = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.user._id).populate("appointments");

  if (!visitor) {
    throw new ErrorResponse("Visitor not found", 404);
  }

  res.status(200).json({
    success: true,
    appointments: visitor.appointments,
  });
});

// ----------------------------
// @desc    Cancel Visitor Appointment
// @route   PUT /api/visitors/cancel-appointment/:appointmentId
// @access  Private (Visitor)
export const cancelVisitorAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ErrorResponse("Appointment not found", 404);
  }

  // Verify visitor owns this appointment.
  // Support both registered visitors (req.user._id) and temporary tokens (req.user.id === appointmentId)
  const isRegisteredVisitor = !!req.user?._id;
  const isTempVisitor = !!req.user?.id && req.user.id === appointmentId;

  if (isRegisteredVisitor) {
    if (appointment.visitorId?.toString() !== req.user._id.toString()) {
      throw new ErrorResponse("Not authorized to cancel this appointment", 403);
    }
  } else if (!isTempVisitor) {
    throw new ErrorResponse("Not authorized to cancel this appointment", 403);
  }

  if (appointment.status === "cancelled") {
    throw new ErrorResponse("Appointment already cancelled", 400);
  }

  appointment.status = "cancelled";
  await appointment.save();

  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully",
    appointment,
  });
});

// ----------------------------
// @desc    Update Visitor Profile
// @route   PUT /api/visitors/profile
// @access  Private (Visitor)
export const updateVisitorProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;

  const visitor = await Visitor.findByIdAndUpdate(
    req.user._id,
    { fullName, phone },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    visitor,
  });
});

// ----------------------------
// @desc    Get Bench Info for Visitor (with their position)
// @route   GET /api/visitors/bench-info/:appointmentId
// @access  Private (Visitor)
export const getVisitorBenchInfo = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ErrorResponse("Appointment not found", 404);
  }

  // Verify visitor owns this appointment. Allow temp-token holders by matching the token's appointment id.
  const isRegisteredVisitor = !!req.user?._id;
  const isTempVisitor = !!req.user?.id && req.user.id === appointmentId;

  if (isRegisteredVisitor) {
    if (appointment.visitorId?.toString() !== req.user._id.toString()) {
      throw new ErrorResponse("Not authorized to view this appointment", 403);
    }
  } else if (!isTempVisitor) {
    throw new ErrorResponse("Not authorized to view this appointment", 403);
  }

  // Get all pending/completed appointments for same date, sorted by bench number
  const benchAppointments = await Appointment.find({
    appointmentDate: appointment.appointmentDate,
    status: { $in: ["pending", "completed"] },
  }).sort({ benchNumber: 1 });

  const visitorBenchPosition = benchAppointments.findIndex(
    (a) => a._id.toString() === appointmentId,
  );

  res.status(200).json({
    success: true,
    benchPosition: visitorBenchPosition + 1, // 1-indexed
    totalOnBench: benchAppointments.length,
    appointment,
  });
});
