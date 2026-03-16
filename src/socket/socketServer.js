import { Server } from "socket.io";
import Chat from "../models/Chat.js";
import Request from "../models/Request.js";

let io;

export const initSocket = (server) => {

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {

    console.log("Socket connected:", socket.id);

    // Join chat room based on request
    socket.on("join_request_room", (requestId) => {
      socket.join(requestId);
    });

    socket.on("send_message", async (data) => {

      const { requestId, senderId, text } = data;

      try {

        if (!text || !text.trim()) return;

        const request = await Request.findById(requestId);

        if (!request) return;

        // 🚨 NEW IMPROVEMENT
        // Allow chat only when request is accepted or picked
        if (request.status !== "accepted" && request.status !== "picked") {
          return;
        }

        const allowed =
          request.hosteller.toString() === senderId ||
          (request.acceptedBy &&
            request.acceptedBy.toString() === senderId);

        if (!allowed) return;

        // Ensure chat exists (atomic upsert)
        const chat = await Chat.findOneAndUpdate(
          { request: requestId },
          {
            $setOnInsert: {
              request: requestId,
              participants: [request.hosteller, request.acceptedBy],
              messages: []
            }
          },
          {
            new: true,
            upsert: true
          }
        );

        const message = {
          sender: senderId,
          text: text.trim()
        };

        chat.messages.push(message);

        await chat.save();

        const populated = await chat.populate(
          "messages.sender",
          "name"
        );

        const lastMessage =
          populated.messages[populated.messages.length - 1];

        // Broadcast message to request room
        io.to(requestId).emit("receive_message", lastMessage);

      } catch (error) {

        console.error("Socket message error:", error);

      }

    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

  });

};

export const getIO = () => io;