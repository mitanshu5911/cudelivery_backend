import Rating from "../models/Rating.js";
import Request from "../models/Request.js";

export const submitRating = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rating, review } = req.body;

    const request = await Request.findById(requestId);
    if(await Rating.findOne({ request: requestId })){
       return res.status(404).json({ message: "Rating is aleary done" });
    }

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    if (request.status !== "completed")
      return res.status(400).json({ message: "Delivery not completed yet" });

    if (request.hosteller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    if (!request.acceptedBy)
      return res.status(400).json({ message: "No delivery partner assigned" });



    const existing = await Rating.findOne({ request: requestId });

    if (existing)
      return res.status(400).json({ message: "Rating already submitted" });

    const newRating = await Rating.create({
      request: requestId,
      hosteller: request.hosteller,
      dayScholar: request.acceptedBy,
      rating,
      review
    });

    res.status(201).json(newRating);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDayScholarRatings = async (req, res) => {
  try {
    const { userId } = req.params;

    const ratings = await Rating.find({ dayScholar: userId })
      .populate("hosteller", "name")
      .sort({ createdAt: -1 });

    const total = ratings.length;

    const avg = total
      ? (ratings.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
      : 0;

    res.json({
      averageRating: avg,
      totalRatings: total,
      ratings
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

