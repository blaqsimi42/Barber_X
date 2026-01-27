import mongoose from "mongoose";

const cutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Cut name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Cut price is required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    imagePublicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Uploader ID is required"],
      refPath: "uploadedByRole", // Dynamic reference to either Admin or Worker
    },
    uploadedByRole: {
      type: String,
      required: [true, "Uploader role is required"],
      enum: ["admin", "worker"], // Only these roles allowed
    },
    uploadedByName: {
      type: String,
      required: [true, "Uploader name is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cut", cutSchema);
