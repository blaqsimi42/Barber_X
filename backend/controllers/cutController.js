import asyncHandler from "express-async-handler";
import Cut from "../models/cutModel.js";
import cloudinary from "../config/cloudinary.js";
import ErrorResponse from "../utils/errorResponse.js";

/**
 * @desc    Create a new cut
 * @route   POST /api/cuts/upload
 * @access  Admin or Worker
 */
export const createCut = asyncHandler(async (req, res) => {
  const { name, price } = req.body;

  // Validate
  if (!req.file) throw new ErrorResponse("Image is required", 400);
  if (!name || !price)
    throw new ErrorResponse("Both name and price are required", 400);

  const uploadFolder =
    req.role === "admin" ? "barber_cuts/admins" : "barber_cuts/workers";

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: uploadFolder },
    async (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        throw new ErrorResponse("Image upload failed", 500);
      }

      try {
        const cut = await Cut.create({
          name,
          price,
          imageUrl: result.secure_url,
          imagePublicId: result.public_id,
          uploadedBy: req.user._id,
          uploadedByRole: req.role,
          uploadedByName: req.user.name,
        });

        res.status(201).json({
          success: true,
          data: cut,
        });
      } catch (err) {
        console.error("DB save error:", err.message);
        throw new ErrorResponse("Failed to save cut", 400);
      }
    }
  );

  uploadStream.end(req.file.buffer);
});

/**
 * @desc    Get all cuts (public)
 * @route   GET /api/cuts
 * @access  Public
 */
export const getCuts = asyncHandler(async (req, res) => {
  const cuts = await Cut.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    count: cuts.length,
    data: cuts,
  });
});

/**
 * @desc    Get cuts uploaded by logged-in user
 * @route   GET /api/cuts/mycuts
 * @access  Admin or Worker
 */
export const getMyCuts = asyncHandler(async (req, res) => {
  const cuts = await Cut.find({ uploadedBy: req.user._id }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    uploader: req.user.name,
    total: cuts.length,
    data: cuts,
  });
});

/**
 * @desc    Update a cut
 * @route   PUT /api/cuts/:id
 * @access  Admin or Worker (own cuts only)
 */
export const updateCut = asyncHandler(async (req, res) => {
  const { name, price } = req.body;
  const cut = await Cut.findById(req.params.id);

  if (!cut) throw new ErrorResponse("Cut not found", 404);

  // Ensure only the owner can update
  if (cut.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ErrorResponse("You can only update your own cuts", 403);
  }

  if (name) cut.name = name;
  if (price) cut.price = price;

  // Handle new image if provided
  if (req.file) {
    if (cut.imagePublicId) {
      await cloudinary.uploader.destroy(cut.imagePublicId);
    }

    const uploadFolder =
      req.role === "admin" ? "barber_cuts/admins" : "barber_cuts/workers";

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: uploadFolder },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(req.file.buffer);
    });

    cut.imageUrl = result.secure_url;
    cut.imagePublicId = result.public_id;
  }

  const updatedCut = await cut.save();

  res.json({
    success: true,
    data: updatedCut,
  });
});

/**
 * @desc    Delete a cut
 * @route   DELETE /api/cuts/:id
 * @access  Admin or Worker (own cuts, admin can delete all)
 */
export const deleteCut = asyncHandler(async (req, res) => {
  const cut = await Cut.findById(req.params.id);
  if (!cut) throw new ErrorResponse("Cut not found", 404);

  const isOwner = cut.uploadedBy.toString() === req.user._id.toString();
  if (req.role !== "admin" && !isOwner) {
    throw new ErrorResponse("You can only delete your own cuts", 403);
  }

  // Delete from Cloudinary
  if (cut.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(cut.imagePublicId);
      console.log("✅ Cloudinary image deleted:", cut.imagePublicId);
    } catch (err) {
      console.error("⚠️ Cloudinary deletion failed:", err.message);
    }
  }

  // Delete cut from DB
  await Cut.findByIdAndDelete(req.params.id); // ✅ safer alternative

  res.json({
    success: true,
    message: "Cut and image deleted successfully",
  });
});
