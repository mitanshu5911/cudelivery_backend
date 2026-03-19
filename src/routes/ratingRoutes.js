import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  submitRating,
  getDayScholarRatings,
} from "../controllers/ratingController.js";

const router = express.Router();

router.post("/:requestId", protect, submitRating);

router.get("/day-scholar/:userId", protect, getDayScholarRatings);


export default router;