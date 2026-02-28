import "./config/env.js";
import express from 'express';
import connectDB from './config/db.js';
import auth from "./routes/auth.js";
import profileRoutes from "./routes/profile.routes.js";
import cors from "cors";
import passport from './config/passport.js';
import requestRoutes from './routes/requestRoutes.js'

const app = express();
connectDB();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

//Routes
app.use("/api/auth",auth);
app.use("/api/profile",profileRoutes); 
app.use("/api/request",requestRoutes);
const port = process.env.PORT||5500;
app.listen(port,() =>{
    console.log("Server is started at PORT: ", port );
})