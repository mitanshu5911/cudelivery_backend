import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
{
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: true,
    unique: true
  },

  hosteller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  dayScholar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  review: {
    type: String,
    trim: true,
    maxlength: 300
  }

},
{ timestamps: true }
);

export default mongoose.model("Rating", ratingSchema);