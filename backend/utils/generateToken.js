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
  // Include a marker so visitor middleware can identify temp tokens
  return jwt.sign(
    { id: appointmentId, name: fullName, tempVisitor: true },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d", // valid for 1 day
    },
  );
};
