import mongoose from "mongoose";
import Request from "../models/Request.js";
import Profile from "../models/Profile.js";

export const createRequest = async (req, res) => {
 
  try {

     const activeRequests = await Request.countDocuments({
  hosteller: req.user._id,
  status: { $in: ["pending", "accepted", "picked"] }
});

if (activeRequests >= 3) {
  return res.status(400).json({
    message: "You already have 3 active requests"
  });
}


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

// export const getPendingRequests = async (req, res) => {
//   try {
//     const requests = await Request.find({ status: "pending" })
//       .populate("hosteller", "name")
//       .sort({ createdAt: -1 });

//     const populatedRequests = await Promise.all(
//       requests.map(async (request) => {
//         const profile = await Profile.findOne({
//           user: request.hosteller._id,
//         }).select("hostellerInfo role");

//         return {
//           ...request.toObject(),
//           hostellerProfile: profile,
//         };
//       })
//     );
//     res.json(populatedRequests);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.aggregate([
      {
        $match: { status: "pending" }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: {
          from: "users",
          localField: "hosteller",
          foreignField: "_id",
          as: "hosteller"
        }
      },
      {
        $unwind:{
          path: "$hosteller",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "profiles",
          localField: "hosteller._id",
          foreignField: "user",
          as: "hostellerProfile"
        }
      },
      {
        $unwind: {
          path: "$hostellerProfile",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          items: 1,
          deliveryLocation: 1,
          itemsTotal: 1,
          deliveryFee: 1,
          grandTotal: 1,
          urgency: 1,
          instructions: 1,
          status: 1,
          createdAt: 1,
          orderId: 1,
          "hosteller._id": 1,
          "hosteller.name": 1,
          "hostellerProfile.hostellerInfo": 1,
          "hostellerProfile.role": 1
        }
      }
    ]);

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
      .populate("acceptedBy", "name")
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
      request.status === "accepted"
    ) {
      request.status = "pending";
      // request.status = "cancelled";
request.acceptedBy = null;
request.acceptedAt = null;
      await request.save();
      return res.json({ message: "Request cancelled by hosteller",request });
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
      return res.json({ message: "Request cancelled by DayScholar" , request});
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

  if (request.status === "expired") {
    return res.status(400).json({
      message: "Request expired and cannot be modified",
    });

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

    
    if (request.status === "expired") {
      return res.status(400).json({
        message: "Request expired and cannot be modified",
      });
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
          !item.name?.trim() ||
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
      if (!deliveryLocation?.trim()) {
        return res.status(400).json({ message: "Invalid delivery location" });
      }
      request.deliveryLocation = deliveryLocation;
    }

    if (urgency !== undefined) request.urgency = urgency;
    if (instructions !== undefined) request.instructions = instructions;

    request.grandTotal =
      (request.itemsTotal || 0) + (request.deliveryFee || 0);

    await request.save();

    res.json({
      message: "Request updated successfully",
      request,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyDeliveries = async (req, res) => {
  try {
    const requests = await Request.find({
      acceptedBy: req.user._id,
      status: { $in: ["accepted", "picked", "completed"] }
    }).populate("hosteller", "name").sort({ acceptedAt: -1 });

    const populatedRequests = await Promise.all(
      requests.map(async (request) => {
        const profile = await Profile.findOne({
          user: request.hosteller._id,
        }).select("hostellerInfo role");

        return {
          ...request.toObject(),
          hostellerProfile: profile,
        };
      })
    );
    res.json(populatedRequests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getRequestById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await Request.findById(req.params.id)
      .populate("acceptedBy", "name");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    
    if (request.hosteller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(request);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};