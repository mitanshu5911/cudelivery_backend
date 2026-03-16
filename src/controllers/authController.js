import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

let url = process.env.FRONTEND_URL || "https://cudelivery.onrender.com";
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

      const resetToken = crypto.randomBytes(32).toString("hex");

      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

      await user.save();

      const resetURL = `${url}/reset-password/${resetToken}`;
      try{
      await sendEmail({
        to: user.email,
        subject: "Password Reset",
        text: `You requested a password reset. Click the link to reset your password: ${resetURL} . It is valid only for 10 minutes. If you did not request this, please ignore this email.`,
      });

        res.json({ message: "Password reset email sent" });
    }catch(err){
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


export const resetPassword = async (req,res) =>{
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    try {
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if(!user){
            return res.status(400).json({message: "Invalid or expired token"});
        }
        if (!req.body.password) {
  return res.status(400).json({ message: "Password required" });
}
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({message: "Password reset successful"});

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const verifyResetToken = async (req,res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {$gt: Date.now()},
    })

    if(!user){
      return res.status(400).json({message: "Invalid or expired token"});
    }

    res.json({message: "Token is valid"});
  } catch (error) {
    console.error("Verify Reset Token Error :", error);
    res.status(500).json({message: "Server error"});
  }
};
