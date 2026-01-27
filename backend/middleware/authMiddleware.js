import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import Admin from "../models/adminModel.js";
import Worker from "../models/workerModel.js";

/**
 *  Generic token verification
 */
const verifyToken = asyncHandler(async (req) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.error("JWT Verification failed:", error.message);
    throw new Error("Invalid or expired token");
  }
});

/**
 * 🛡 Protect Admin Routes
 */
export const protectAdmin = asyncHandler(async (req, res, next) => {
  const userId = await verifyToken(req);

  const admin = await Admin.findById(userId).select("-password");
  if (!admin) {
    res.status(401);
    throw new Error("Admin not found or invalid token");
  }

  req.user = admin;
  req.role = "admin";
  next();
});

/**
 *  Protect Worker Routes
 */
export const protectWorker = asyncHandler(async (req, res, next) => {
  const userId = await verifyToken(req);

  const worker = await Worker.findById(userId).select("-password");
  if (!worker) {
    res.status(401);
    throw new Error("Worker not found or invalid token");
  }

  req.user = worker;
  req.role = "worker";
  next();
});

/**
 *  Optional: Combined middleware
 * Allows access if user is either admin or worker
 */
export const protectAny = asyncHandler(async (req, res, next) => {
  const userId = await verifyToken(req);

  let user = await Admin.findById(userId).select("-password");
  if (user) {
    req.user = user;
    req.role = "admin";
    return next();
  }

  user = await Worker.findById(userId).select("-password");
  if (user) {
    req.user = user;
    req.role = "worker";
    return next();
  }

  res.status(401);
  throw new Error("Not authorized — user not found");
});
