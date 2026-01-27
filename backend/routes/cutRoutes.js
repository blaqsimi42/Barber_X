import express from "express";
import multer from "multer";
import {
  createCut,
  getCuts,
  getMyCuts,
  updateCut,
  deleteCut,
} from "../controllers/cutController.js";
import { protectAdminOrWorker } from "../middleware/protectAdminOrWorker.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public
router.get("/", getCuts);

// Protected (Admin or Worker)
router.get("/mycuts", protectAdminOrWorker, getMyCuts);
router.post("/upload", protectAdminOrWorker, upload.single("image"), createCut);
router.put("/:id", protectAdminOrWorker, upload.single("image"), updateCut);
router.delete("/:id", protectAdminOrWorker, deleteCut);

export default router;
