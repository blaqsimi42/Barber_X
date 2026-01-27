import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import cutRoutes from "./routes/cutRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:5173", // local Vite dev
  "https://barber-x-henna.vercel.app", // production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy does not allow access from ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/cuts", cutRoutes);
app.use("/api/appointments", appointmentRoutes);

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`${err.message} ❌`);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`),
);
