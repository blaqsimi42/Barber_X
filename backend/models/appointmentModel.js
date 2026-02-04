import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    cutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cut",
      required: true,
    },

    cutName: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    appointmentTime: {
      type: String,
      required: true, // e.g "10:30"
    },

    benchNumber: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },

    workerName: {
      type: String,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
    // New: store who completed the appointment by id/role (more reliable than name-only)
    completedById: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    completedByRole: {
      type: String,
      enum: ["admin", "worker"],
      default: null,
    },
    // Optional visitor id if you later associate bookings with a visitor record
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true },
);

// Prevent double booking
appointmentSchema.index(
  { appointmentDate: 1, appointmentTime: 1 },
  { unique: true },
);

// Performance indexes
appointmentSchema.index({ fullName: 1 });

export default mongoose.model("Appointment", appointmentSchema);
