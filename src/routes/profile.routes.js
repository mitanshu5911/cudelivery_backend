import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { createProfile, getMyProfile, updateProfile } from "../controllers/profile.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();
router.post("/create",protect,upload.single("idCard"),createProfile);

router.get("/get",protect,getMyProfile);

router.put("/update",protect,upload.single("idCard"),updateProfile);

export default router;