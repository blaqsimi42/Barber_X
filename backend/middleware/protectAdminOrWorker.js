import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Worker from "../models/workerModel.js";

// Allow either admin OR worker to access route
export const protectAdminOrWorker = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try to find admin first
      const admin = await Admin.findById(decoded.id).select("-password");
      if (admin) {
        req.user = admin;
        req.role = "admin";
        return next();
      }

      // If not admin, try worker
      const worker = await Worker.findById(decoded.id);
      if (worker) {
        req.user = worker;
        req.role = "worker";
        return next();
      }

      res.status(401);
      throw new Error("Not authorized: user not found");
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }
});
