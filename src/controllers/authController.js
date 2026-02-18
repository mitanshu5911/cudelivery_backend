import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import generateToken from "../utils/generateToken.js";

//Register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        res.status(201).json({ message: "User registered successfully" });
        console.log("Registered");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
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
            token
        });
         console.log("User:", user);
         console.log("Token:", token);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//googleCallback
export const googleCallback = (req, res) => {

  console.log("User:", req.user);
  const token = generateToken(req.user._id);
  
  const redirectURL = `http://localhost:5173/google-success?token=${token}`;

  res.redirect(redirectURL);

};

export const getMe = (req, res) => {
  res.json(req.user);
};