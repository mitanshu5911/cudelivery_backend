import { Server } from "socket.io";
import Chat from "../models/Chat.js";
import Request from "../models/Request.js";
import User from "../models/User.js";


let io;

export const initSocket = (server) => {

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {

    console.log("Socket connected:", socket.id);


    const userId = socket.handshake.auth?.userId;
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`✅ Joined room: user_${userId}`);
    }

    socket.on("join_request_room", (requestId) => {
      socket.join(`request_${requestId}`);
    });

    socket.on("send_message", async ({ requestId, text }) => {
      try {
        if (!text?.trim()) return;

        const request = await Request.findById(requestId);
        if (!request) return;

        const allowed =
          request.hosteller.toString() === userId ||
          request.acceptedBy?.toString() === userId;

        if (!allowed) return;

        const chat = await Chat.findOneAndUpdate(
          { request: requestId },
          {
            $setOnInsert: {
              request: requestId,
              participants: [request.hosteller, request.acceptedBy],
              messages: []
            }
          },
          { new: true, upsert: true }
        );

        const senderUser = await User.findById(userId).select("name");

        const message = {
          sender: senderUser._id,
          text,
          timestamp: new Date()
        };

        chat.messages.push(message);
        await chat.save();

        const populatedMessage = {
          sender: {
            _id: senderUser._id,
            name: senderUser.name
          },
          text,
          timestamp: message.timestamp
        };


        io.to(`request_${requestId}`).emit("new_message", {
          requestId,
          message: populatedMessage
        });

      } catch (err) {
        console.error("Chat error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

  });

};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};