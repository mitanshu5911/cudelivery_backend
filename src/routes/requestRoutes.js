import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { roleCheck } from '../middlewares/roleMiddleware.js';
import { acceptRequest, cancelRequest, completeRequest, createRequest, deleteRequest, getMyRequests, getPendingRequests, markAsPicked, updateRequest } from '../controllers/requestController.js';

const router = express.Router();

router.post("/",protect,roleCheck("Hosteller"),createRequest);

router.get("/my",protect,roleCheck("Hosteller"),getMyRequests);

router.get('/pending',protect,roleCheck("DayScholar"),getPendingRequests);

router.patch("/:id",protect, roleCheck("Hosteller"), updateRequest);

router.patch("/:id/accept",protect,roleCheck("DayScholar"),acceptRequest);

router.patch("/:id/complete",protect,roleCheck("DayScholar"),completeRequest);

router.patch("/:id/picked", protect, roleCheck("DayScholar"), markAsPicked);

router.patch("/:id/cancel",protect,cancelRequest);

router.delete("/:id", protect, roleCheck("Hosteller"), deleteRequest);

export default router;