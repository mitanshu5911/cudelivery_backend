import Chat from "../models/Chat.js";
import Request from "../models/Request.js";

export const getChat = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId)
      .select("hosteller acceptedBy");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const userId = req.user._id.toString();

    const isHosteller = request.hosteller.toString() === userId;
    const isDelivery = request.acceptedBy?.toString() === userId;

    if (!isHosteller && !isDelivery) {
      return res.status(403).json({ message: "Not allowed in this chat" });
    }

    const participants = [request.hosteller];
    if (request.acceptedBy) {
      participants.push(request.acceptedBy);
    }

    const chat = await Chat.findOneAndUpdate(
      { request: requestId },
      {
        $setOnInsert: {
          request: requestId,
          participants,
          messages: []
        }
      },
      {
        new: true,
        upsert: true
      }
    ).populate("messages.sender", "name");

    res.json(chat);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};