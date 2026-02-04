import asyncHandler from "express-async-handler";
import Admin from "../models/adminModel.js";
import Worker from "../models/workerModel.js";
import Appointment from "../models/appointmentModel.js";
import { generateToken } from "../utils/generateToken.js";

/**
 * @desc    Register worker using adminCode
 * @route   POST /api/workers/register
 * @access  Public (uses adminCode validation)
 */
export const registerWorker = asyncHandler(async (req, res) => {
  const { name, email, password, adminCode } = req.body;

  if (!name || !email || !password || !adminCode) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const workerExists = await Worker.findOne({ email });
  if (workerExists) {
    res.status(400);
    throw new Error("Worker already exists");
  }

  const admin = await Admin.findOne({ adminCode });
  if (!admin) {
    res.status(400);
    throw new Error("Invalid admin code");
  }

  const worker = await Worker.create({
    name,
    email,
    password,
    admin: admin._id,
  });

  res.status(201).json({
    _id: worker._id,
    name: worker.name,
    email: worker.email,
    admin: admin.name,
    role: worker.role,
    token: generateToken(worker._id),
  });
});

/**
 * @desc    Worker login
 * @route   POST /api/workers/login
 * @access  Public
 */
export const loginWorker = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const worker = await Worker.findOne({ email });
  if (worker && (await worker.matchPassword(password))) {
    res.json({
      _id: worker._id,
      name: worker.name,
      email: worker.email,
      admin: worker.admin,
      role: worker.role,
      token: generateToken(worker._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

/**
 * @desc    Get all colleagues (workers under the same admin)
 * @route   GET /api/workers/colleagues
 * @access  Private (Worker)
 */
export const getColleagues = asyncHandler(async (req, res) => {
  // Ensure user is a worker
  if (req.role !== "worker") {
    res.status(403);
    throw new Error("Only workers can access this route");
  }

  // Find all workers under the same admin, exclude current user
  const colleagues = await Worker.find({
    admin: req.user.admin,
    _id: { $ne: req.user._id },
  }).select("-password"); // don’t expose password

  res.json({
    success: true,
    count: colleagues.length,
    colleagues,
  });
});

/**
 * @desc    Update worker profile
 * @route   PUT /api/workers/profile
 * @access  Private (Worker only)
 */
export const updateWorkerProfile = asyncHandler(async (req, res) => {
  if (req.role !== "worker") {
    res.status(403);
    throw new Error("Access denied. Workers only.");
  }

  const worker = await Worker.findById(req.user._id);

  if (!worker) {
    res.status(404);
    throw new Error("Worker not found");
  }

  // Keep old name to update any related appointment records
  const oldName = worker.name;

  // Update allowed fields only
  worker.name = req.body.name || worker.name;
  worker.email = req.body.email || worker.email;

  if (req.body.password) {
    worker.password = req.body.password;
  }

  const updatedWorker = await worker.save();

  // If the worker changed their name, update appointments that recorded the old name
  if (req.body.name && req.body.name !== oldName) {
    await Appointment.updateMany(
      { workerName: oldName },
      { $set: { workerName: updatedWorker.name } },
    );
  }

  res.status(200).json({
    _id: updatedWorker._id,
    name: updatedWorker.name,
    email: updatedWorker.email,
    admin: updatedWorker.admin,
    role: updatedWorker.role,
    token: generateToken(updatedWorker._id),
  });
});
