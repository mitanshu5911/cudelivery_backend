import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { getChat } from "../controllers/chatController.js";

const router = express.Router();

router.get("/:requestId", protect, getChat);

export default router;