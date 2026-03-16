import Chat from "../models/Chat.js";
import Request from "../models/Request.js";

export const getChat = async (req, res) => {

  try {

    const { requestId } = req.params;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const allowed =
      request.hosteller.toString() === req.user._id.toString() ||
      (request.acceptedBy &&
        request.acceptedBy.toString() === req.user._id.toString());

    if (!allowed) {
      return res.status(403).json({ message: "Not allowed in this chat" });
    }

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
).populate("messages.sender", "name");
   

    res.json(chat);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};