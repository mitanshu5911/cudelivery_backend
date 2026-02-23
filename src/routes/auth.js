import express from "express";
import passport from "passport";
import {
  register,
  login,
  googleCallback,
  getMe,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from "../controllers/authController.js";
import protect from '../middlewares/authMiddleware.js'
let url = process.env.FRONTEND_URL || "http://localhost:5173";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getMe);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/reset-password/verify/:token", verifyResetToken);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${url}/login`,
  }),
  googleCallback
);

export default router;