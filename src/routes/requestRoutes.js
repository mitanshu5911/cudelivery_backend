import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { roleCheck } from "../middlewares/roleMiddleware.js";

import {
  createRequest,
  getMyRequests,
  getPendingRequests,
  getMyDeliveries,
  getWeeklyStats,
  acceptRequest,
  markAsPicked,
  completeRequest,
  cancelRequest,
  updateRequest,
  deleteRequest,
  getRequestById,
} from "../controllers/requestController.js";

const router = express.Router();

router.get("/weekly-stats", protect, getWeeklyStats);

router.get("/my-requests", protect, roleCheck("Hosteller"), getMyRequests);
router.get("/pending", protect, roleCheck("DayScholar"), getPendingRequests);
router.get("/my-deliveries", protect, roleCheck("DayScholar"), getMyDeliveries);

router.post("/", protect, roleCheck("Hosteller"), createRequest);

router.patch("/:id/accept", protect, roleCheck("DayScholar"), acceptRequest);
router.patch("/:id/picked", protect, roleCheck("DayScholar"), markAsPicked);
router.patch("/:id/complete", protect, roleCheck("DayScholar"), completeRequest);
router.patch("/:id/cancel", protect, cancelRequest);
router.patch("/:id", protect, roleCheck("Hosteller"), updateRequest);

router.delete("/:id", protect, roleCheck("Hosteller"), deleteRequest);

router.get("/:id", protect, roleCheck("Hosteller"), getRequestById);

export default router;