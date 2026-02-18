import express from "express";
import passport from "passport";
import {
  register,
  login,
  googleCallback,
  getMe
} from "../controllers/authController.js";
import protect from '../middlewares/authMiddleware.js'
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getMe);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login",
  }),
  googleCallback
);

export default router;