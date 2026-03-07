import mongoose from "mongoose";
import Counter from "./Counter.js";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        enum: ["piece", "kg", "liter", "pack"],
        default: "piece"
    },
    estimatedPrice: {
        type: Number,
        required: true,
        min: 0
    }
});



const requestSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        // required: true
    },
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
        enum: ["pending", "accepted", "picked", "completed", "expired"],
        default: "pending"
    },
    acceptedAt: Date,
    completedAt: Date
},{timestamps: true}
);

requestSchema.pre("save", async function (next) {
    if(!this.orderId){
        
            const counter = await Counter.findOneAndUpdate(
                {name: "request"},
                {$inc: {seq: 1}},
                {new: true, upsert: true}
            );
            this.orderId = `REQ${counter.seq.toString().padStart(6, "0")}`;
         
        
    }
});

requestSchema.index({ status: 1 });
requestSchema.index({ hosteller: 1 });
requestSchema.index({ acceptedBy: 1 });

export default mongoose.model("Request", requestSchema);