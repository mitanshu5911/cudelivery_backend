import "./config/env.js";
import express from 'express';
import connectDB from './config/db.js';
import auth from "./routes/auth.js";
import profileRoutes from "./routes/profile.routes.js";
import cors from "cors";
import passport from './config/passport.js';
import requestRoutes from './routes/requestRoutes.js'
import chatRoutes from "./routes/chatRoutes.js";
import expireOldRequests from "./utils/expireRequests.js";
import http from 'http';
import ratingRoutes from "./routes/ratingRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { initSocket } from "./socket/socketServer.js";

const app = express();
connectDB();
const server = http.createServer(app);
initSocket(server);
let url = process.env.FRONTEND_URL;
app.use(express.json());
app.use(cors(
    {
        origin: url,
        credentials: true
    }
));
app.use(passport.initialize());

//Routes
app.use("/api/auth",auth);
app.use("/api/profile",profileRoutes); 
app.use("/api/request",requestRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/contact", contactRoutes);

const port = process.env.PORT||5500;
server.listen(port,() =>{
    console.log("Server is started at PORT: ", port );
    expireOldRequests();
});