// middleware/visitorMiddleware.js
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

/**
 * Protect routes for temporary visitors.
 * Relies entirely on the JWT payload (no DB lookup).
 */
export const protectVisitor = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized — no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure this is a visitor token
    if (!decoded.tempVisitor) {
      res.status(403);
      throw new Error("Not authorized — not a visitor token");
    }

    // Attach decoded visitor info to request
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: "visitor",
    };

    next();
  } catch (err) {
    console.error("Visitor auth error:", err.message);
    res.status(401);
    throw new Error("Invalid or expired visitor token");
  }
});
