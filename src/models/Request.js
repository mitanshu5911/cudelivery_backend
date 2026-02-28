import mongoose, { trusted } from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit: {
        type: String,
        enum: ["piece", "kg", "g", "liter", "ml", "pack"],
        default: "piece"
    },
    estimatedPrice: {
        type: Number,
        required: true,
        min: 0
    }
});

const requestSchema = new mongoose.Schema({
    hosteller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    items: {
        type: [itemSchema],
        required: true
    },
    deliveryLocation: {
        type: String,
        required: true
    },
    itemsTotal: {
        type: Number,
        required: true,
    },
    deliveryFee: {
        type: Number, 
        required: true,
    },
    grandTotal:{
        type:Number,
        required: true
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low"
    },
    instructions: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "picked", "completed", "cancelled"],
        default: "pending"
    },
    acceptedAt: Date,
    completedAt: Date
},{timestamps: true}
);

requestSchema.index({ status: 1 });
requestSchema.index({ hosteller: 1 });
requestSchema.index({ acceptedBy: 1 });

export default mongoose.model("Request", requestSchema);