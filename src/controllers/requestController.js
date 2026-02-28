import mongoose from "mongoose";
import Request from "../models/Request.js";

export const createRequest = async (req, res) => {
  try {
    const { items, deliveryLocation, deliveryFee, urgency, instructions } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    for (const item of items) {
      if (
        !item.name ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0 ||
        typeof item.estimatedPrice !== "number" ||
        item.estimatedPrice <= 0
      ) {
        return res.status(400).json({ message: "Invalid item data" });
      }
    }

    if (typeof deliveryFee !== "number" || deliveryFee < 0) {
      return res.status(400).json({ message: "Invalid delivery fee" });
    }

    if (!deliveryLocation || typeof deliveryLocation !== "string") {
      return res.status(400).json({ message: "Delivery location is required" });
    }

    const itemsTotal = items.reduce(
      (acc, item) => acc + item.estimatedPrice * item.quantity,
      0
    );

    const grandTotal = itemsTotal + deliveryFee;

    const request = await Request.create({
      hosteller: req.user._id,
      items,
      deliveryLocation,
      itemsTotal,
      deliveryFee,
      grandTotal,
      urgency,
      instructions,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const activeCount = await Request.countDocuments({
      acceptedBy: req.user._id,
      status: { $in: ["accepted", "picked"] }
    });

    if (activeCount >= 3) {
      return res.status(400).json({
        message: "You already have 3 active deliveries"
      });
    }

    const request = await Request.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "pending",
        hosteller: { $ne: req.user._id }
      },
      {
        status: "accepted",
        acceptedBy: req.user._id,
        acceptedAt: new Date()
      },
      { new: true }
    );

    if (!request) {
      return res.status(400).json({
        message: "Request not available, already accepted, or cannot accept your own request"
      });
    }

    res.json({
      message: "Request accepted successfully",
      request
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" })
      .populate("hosteller", "name")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await Request.findById(req.params.id);

    if (!request || request.status !== "picked") {
      return res.status(400).json({ message: "Invalid request state" });
    }

    if (
      !request.acceptedBy ||
      request.acceptedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "completed";
    request.completedAt = new Date();

    await request.save();

    res.json({ message: "Request completed", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ hosteller: req.user._id })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAcceptedRequests = async (req, res) => {
  try {
    const requests = await Request.find({ acceptedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (
      request.hosteller.toString() === req.user._id.toString() &&
      request.status === "pending"
    ) {
      request.status = "cancelled";
      await request.save();
      return res.json({ message: "Request cancelled by hosteller" });
    }

    if (
      request.acceptedBy &&
      request.acceptedBy.toString() === req.user._id.toString() &&
      request.status === "accepted"
    ) {
      request.status = "pending";
      request.acceptedBy = null;
      request.acceptedAt = null;
      await request.save();
      return res.json({ message: "Request cancelled by DayScholar" });
    }

    return res.status(400).json({ message: "Cannot cancel this request" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsPicked = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await Request.findById(req.params.id);

    if (!request || request.status !== "accepted") {
      return res.status(400).json({ message: "Invalid request state" });
    }

    if (
      !request.acceptedBy ||
      request.acceptedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "picked";
    request.pickedAt = new Date();

    await request.save();

    res.json({ message: "Request marked as picked", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.hosteller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be deleted",
      });
    }

    await request.deleteOne();

    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.hosteller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be updated",
      });
    }

    const { items, deliveryLocation, deliveryFee, urgency, instructions } = req.body;

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items must be a non-empty array" });
      }

      for (const item of items) {
        if (
          !item.name ||
          typeof item.quantity !== "number" ||
          item.quantity <= 0 ||
          typeof item.estimatedPrice !== "number" ||
          item.estimatedPrice <= 0
        ) {
          return res.status(400).json({ message: "Invalid item data" });
        }
      }

      request.items = items;

      request.itemsTotal = items.reduce(
        (acc, item) => acc + item.estimatedPrice * item.quantity,
        0
      );
    }

    if (deliveryFee !== undefined) {
      if (typeof deliveryFee !== "number" || deliveryFee < 0) {
        return res.status(400).json({ message: "Invalid delivery fee" });
      }
      request.deliveryFee = deliveryFee;
    }

    if (deliveryLocation !== undefined) {
      if (!deliveryLocation || typeof deliveryLocation !== "string") {
        return res.status(400).json({ message: "Invalid delivery location" });
      }
      request.deliveryLocation = deliveryLocation;
    }

    if (urgency !== undefined) request.urgency = urgency;
    if (instructions !== undefined) request.instructions = instructions;

    request.grandTotal =
      (request.itemsTotal || 0) + (request.deliveryFee || 0);

    await request.save();

    res.json({ message: "Request updated successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};