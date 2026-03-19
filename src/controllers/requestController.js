import mongoose from "mongoose";
import Request from "../models/Request.js";
import { getIO } from "../socket/socketServer.js";

const emitUpdate = async (requestId) => {
  const io = getIO();

  const freshRequest = await Request.findById(requestId)
    .populate("hosteller", "name")
    .populate("acceptedBy", "name");

  if (freshRequest) {
    io.emit("request_updated", freshRequest);
  }
};

/* =========================
   CREATE REQUEST
========================= */
export const createRequest = async (req, res) => {
  try {
    const activeRequests = await Request.countDocuments({
      hosteller: req.user._id,
      status: { $in: ["pending", "accepted", "picked"] }
    });

    if (activeRequests >= 3) {
      return res.status(400).json({ message: "Max 3 active requests allowed" });
    }

    const { items, deliveryLocation, deliveryFee, urgency, instructions } = req.body;

    const itemsTotal = items.reduce(
      (acc, item) => acc + item.estimatedPrice * item.quantity,
      0
    );

    const request = await Request.create({
      hosteller: req.user._id,
      items,
      deliveryLocation,
      itemsTotal,
      deliveryFee,
      grandTotal: itemsTotal + deliveryFee,
      urgency,
      instructions,
    });

    await emitUpdate(request._id);

    const populatedRequest = await Request.findById(request._id)
      .populate("hosteller", "name");

    res.status(201).json(populatedRequest);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   ACCEPT REQUEST
========================= */
export const acceptRequest = async (req, res) => {
  try {
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
      return res.status(400).json({ message: "Request not available" });
    }

    await emitUpdate(request._id);

    res.json({ message: "Accepted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   MARK AS PICKED
========================= */
export const markAsPicked = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request || request.status !== "accepted") {
      return res.status(400).json({ message: "Invalid state" });
    }

    request.status = "picked";
    request.pickedAt = new Date();

    await request.save();

    await emitUpdate(request._id);

    res.json({ message: "Picked" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   COMPLETE REQUEST
========================= */
export const completeRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request || request.status !== "picked") {
      return res.status(400).json({ message: "Invalid state" });
    }

    request.status = "completed";
    request.completedAt = new Date();

    await request.save();

    await emitUpdate(request._id);

    res.json({ message: "Completed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   CANCEL REQUEST
========================= */
export const cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Not found" });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({ message: "Cannot cancel" });
    }

    request.status = "pending";
    request.acceptedBy = null;
    request.acceptedAt = null;

    await request.save();

    await emitUpdate(request._id);

    res.json({ message: "Cancelled" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE REQUEST
========================= */
export const updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(400).json({ message: "Cannot update" });
    }

    Object.assign(request, req.body);

    const itemsTotal = request.items.reduce(
      (acc, item) => acc + item.estimatedPrice * item.quantity,
      0
    );

    request.itemsTotal = itemsTotal;
    request.grandTotal = itemsTotal + request.deliveryFee;

    await request.save();

    await emitUpdate(request._id);

    const freshRequest = await Request.findById(request._id)
      .populate("hosteller", "name")
      .populate("acceptedBy", "name");

    res.json({ message: "Updated", request: freshRequest });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE REQUEST
========================= */
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(400).json({ message: "Cannot delete" });
    }

    await request.deleteOne();

    const io = getIO();
    io.emit("request_deleted", { _id: req.params.id });

    res.json({ message: "Deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET PENDING
========================= */
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" })
      .populate("hosteller", "name")
      .sort({  urgency: -1,createdAt: -1 });

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET MY REQUESTS
========================= */
export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ hosteller: req.user._id })
      .populate("acceptedBy", "name")
      .populate("hosteller", "name")
      .sort({ createdAt: -1 });

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET MY DELIVERIES
========================= */
export const getMyDeliveries = async (req, res) => {
  try {
    const requests = await Request.find({
      acceptedBy: req.user._id
    }).populate("hosteller", "name")
    .populate("acceptedBy", "name")
    .sort({ acceptedAt: -1, createdAt: -1 });

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET BY ID
========================= */
export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("acceptedBy", "name");

    if (!request) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(request);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getWeeklyStats = async (req, res) => {
  try {
    // console.log("USER:", req.user);
    
    const userId = req.user._id;

    const now = new Date();

  
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay(); // 0 (Sun) - 6 (Sat)

    const diff = day === 0 ? -6 : 1 - day; // adjust for Monday
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

  
    const stats = await Request.aggregate([
      {
        $match: {
          acceptedBy: userId,
          acceptedAt: {
            $gte: startOfWeek,
            $lt: endOfWeek,
          },
        },
      },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$acceptedAt" }, // 1=Sun
        },
      },
      {
        $group: {
          _id: "$dayOfWeek",
          count: { $sum: 1 },
        },
      },
    ]);

    
    const daysMap = {
      1: "Sun",
      2: "Mon",
      3: "Tue",
      4: "Wed",
      5: "Thu",
      6: "Fri",
      7: "Sat",
    };

    const result = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
      (day) => ({
        day,
        count: 0,
      })
    );

    stats.forEach((item) => {
      const dayName = daysMap[item._id];

      const index = result.findIndex((d) => d.day === dayName);
      if (index !== -1) {
        result[index].count = item.count;
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};