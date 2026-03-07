import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { roleCheck } from '../middlewares/roleMiddleware.js';
import { acceptRequest, cancelRequest, completeRequest, createRequest, deleteRequest, getMyDeliveries, getMyRequests, getPendingRequests, getRequestById, markAsPicked, updateRequest } from '../controllers/requestController.js';

const router = express.Router();

router.post("/",protect,roleCheck("Hosteller"),createRequest);

router.get("/my-requests",protect,roleCheck("Hosteller"),getMyRequests);

router.get('/pending',protect,roleCheck("DayScholar"),getPendingRequests);

router.patch("/:id",protect, roleCheck("Hosteller"), updateRequest);

router.patch("/:id/accept",protect,roleCheck("DayScholar"),acceptRequest);

router.patch("/:id/complete",protect,roleCheck("DayScholar"),completeRequest);

router.patch("/:id/picked", protect, roleCheck("DayScholar"), markAsPicked);

router.patch("/:id/cancel",protect,cancelRequest);

router.delete("/:id", protect, roleCheck("Hosteller"), deleteRequest);

router.get("/my-deliveries", protect,roleCheck("DayScholar"),getMyDeliveries);

router.get("/:id", protect, roleCheck("Hosteller"), getRequestById);
export default router;