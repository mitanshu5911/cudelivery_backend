import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema(
{
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: true,
    unique: true
  },

  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  messages: {
  type: [messageSchema],
  default: []
  }
},
{ timestamps: true }
);

export default mongoose.model("Chat", chatSchema);