import asyncHandler from "express-async-handler";
import Admin from "../models/adminModel.js";
import Worker from "../models/workerModel.js";
import Appointment from "../models/appointmentModel.js";
import { generateToken } from "../utils/generateToken.js";
// Format admin response
const formatAdminResponse = (admin) => ({
  _id: admin._id,
  name: admin.name,
  email: admin.email,
  adminCode: admin.adminCode,
  role: admin.role,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
  token: generateToken(admin._id),
});

// Generate random admin code
const generateAdminCode = () =>
  "ADM-" + Math.random().toString(36).substring(2, 8).toUpperCase();

/**
 * @desc    Create admin
 * @route   POST /api/admin/create
 * @access  Public (secure with global passkey)
 */
export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, passkey } = req.body;

  const GLOBAL_PASSKEY = "ADMINCREATE123";
  if (passkey !== GLOBAL_PASSKEY) {
    res.status(401);
    throw new Error("Invalid admin passkey");
  }

  const adminExists = await Admin.findOne({ email });
  if (adminExists) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  const adminCode = generateAdminCode();

  const admin = await Admin.create({
    name,
    email,
    password,
    adminCode,
  });

  if (admin) {
    res.status(201).json(formatAdminResponse(admin));
  } else {
    res.status(400);
    throw new Error("Invalid admin data");
  }
});

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public
 */
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    res.status(200).json(formatAdminResponse(admin));
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

/**
 * @desc    Get all workers under logged-in admin
 * @route   GET /api/admin/workers
 * @access  Private (Admin only)
 */
export const getWorkers = asyncHandler(async (req, res) => {
  if (req.role !== "admin") {
    res.status(403);
    throw new Error("Access denied. Admins only.");
  }

  const workers = await Worker.find({ admin: req.user._id }).select("-__v");

  res.status(200).json({
    admin: req.user.name,
    totalWorkers: workers.length,
    workers,
  });
});

/**
 * @desc    Update admin profile
 * @route   PUT /api/admin/profile
 * @access  Private (Admin only)
 */
export const updateAdminProfile = asyncHandler(async (req, res) => {
  if (req.role !== "admin") {
    res.status(403);
    throw new Error("Access denied. Admins only.");
  }

  const admin = await Admin.findById(req.user._id);

  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  // Keep old name to update any related appointment records
  const oldName = admin.name;

  // Update allowed fields only
  admin.name = req.body.name || admin.name;
  admin.email = req.body.email || admin.email;

  if (req.body.password) {
    admin.password = req.body.password;
  }

  const updatedAdmin = await admin.save();

  // If admin changed their name, update any appointments completed by them
  if (req.body.name && req.body.name !== oldName) {
    await Appointment.updateMany(
      { workerName: oldName },
      { $set: { workerName: updatedAdmin.name } },
    );
  }

  res.status(200).json(formatAdminResponse(updatedAdmin));
});
