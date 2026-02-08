// src/utils/generateToken.js
import jwt from "jsonwebtoken";

// Permanent token for admin/worker
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
