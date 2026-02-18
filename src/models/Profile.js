import mongoose from "mongoose";

const dayScholarInfoSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
      trim: true,
    },
    availableTime: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const hostellerInfoSchema = new mongoose.Schema(
  {
    hostelName: {
      type: String,
      required: true,
      trim: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^[6-9]\d{9}$/, // Indian phone validation
    },

    role: {
      type: String,
      enum: ["DayScholar", "Hosteller"],
      required: true,
    },

    dayScholarInfo: {
      type: dayScholarInfoSchema,
      required: function () {
        return this.role === "DayScholar";
      },
    },

    hostellerInfo: {
      type: hostellerInfoSchema,
      required: function () {
        return this.role === "Hosteller";
      },
    },

    idCardUrl: {
      type: String,
      required: true,
    },

    profileVerified: {
      type: Boolean,
      default: false,
    },
    verificationMethod: {
      type: String,
      enum: ["ai", "manual"],
      default: "ai",
    },

    verificationMessage: {
      type: String, // reason if rejected
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Profile", profileSchema);
