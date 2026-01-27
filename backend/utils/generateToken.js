// src/utils/generateToken.js
import jwt from "jsonwebtoken";

// Permanent token for admin/worker
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

//  Temporary token for visitor (appointment only)
export const generateTempToken = (appointmentId, fullName) => {
  return jwt.sign({ appointmentId, fullName }, process.env.JWT_SECRET, {
    expiresIn: "1d", // valid for 1 day
  });
};
