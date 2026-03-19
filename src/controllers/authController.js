import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

let url = process.env.FRONTEND_URL;
//Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const emailNormalized = email.toLowerCase();
    let user = await User.findOne({ email: emailNormalized });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
    // console.log("Registered");
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({ error: error.message });
  }
};

//Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.authProvider !== "local") {
      return res.status(400).json({
        message: "Please login using Google",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: "Login Successfully",
      token,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//googleCallback
export const googleCallback = (req, res) => {
  console.log("User:", req.user);
  if (!req.user) {
    return res.redirect(`${url}/login`);
  }
  const token = generateToken(req.user._id);

  const redirectURL = `${url}/google-success?token=${token}`;

  res.redirect(redirectURL);
};

export const getMe = (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(req.user);
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "If account exists, email has been sent" });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        message: "You signed up with Google. Please login using Google."
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetURL = `${url}/reset-password/${resetToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset",
        html: `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
  
  <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#f97316,#ea580c); padding:20px; text-align:center;">
      <h1 style="color:white; margin:0;">CuDelivery</h1>
      <p style="color:#ffedd5; margin:5px 0 0;">Password Reset Request</p>
    </div>

    <!-- BODY -->
    <div style="padding:30px; color:#333;">

      <h2 style="margin-top:0;">Reset Your Password 🔐</h2>

      <p style="font-size:14px; line-height:1.6;">
        We received a request to reset your password. Click the button below to set a new password.
      </p>

      <!-- BUTTON -->
      <div style="text-align:center; margin:30px 0;">
        <a href="${resetURL}" 
          style="
            background:#f97316;
            color:white;
            padding:12px 24px;
            border-radius:8px;
            text-decoration:none;
            font-weight:bold;
            display:inline-block;
          ">
          Reset Password
        </a>
      </div>

      <p style="font-size:13px; color:#555;">
        This link is valid for <strong>10 minutes</strong>.
      </p>

      <p style="font-size:13px; color:#555;">
        If you didn’t request this, you can safely ignore this email.
      </p>

      <!-- FALLBACK LINK -->
      <p style="font-size:12px; color:#999; margin-top:20px;">
        Or copy and paste this link into your browser:<br/>
        <span style="word-break:break-all;">${resetURL}</span>
      </p>

    </div>

    <!-- FOOTER -->
    <div style="background:#0f172a; padding:20px; text-align:center; color:#94a3b8; font-size:12px;">
      <p style="margin:0;">© ${new Date().getFullYear()} CuDelivery</p>
      <p style="margin:5px 0 0;">Campus Delivery Platform</p>
    </div>

  </div>

</div>
`
      });

      res.json({ message: "Password reset email sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent. Please try again.", });
    }

  } catch (error) {
    console.error("Forgot Password Error:", error);

    res.status(500).json({ message: "Server error" });
  }
};


export const resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    if (!req.body.password) {
      return res.status(400).json({ message: "Password required" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export const verifyResetToken = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.json({ message: "Token is valid" });
  } catch (error) {
    console.error("Verify Reset Token Error :", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);



    if (user.authProvider === "google") {
      return res.status(400).json({
        message: "You signed up with Google. So, you can't able to change password"
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
