import Profile from "../models/Profile.js";
import { verifyIdCardImage } from "../services/idVerificationService.js";

export const createProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { phone, rollNumber, role } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "ID card image is required",
      });
    }

    const idCardUrl = req.file.path;

    
    const verificationResult = await verifyIdCardImage({
      imageUrl: idCardUrl,
      userName: req.user.name,
      rollNumber,
    });

    if (!verificationResult.verified) {
      return res.status(400).json({
        success: false,
        message: "ID card verification failed. Please upload a clear photo.",
        checks: verificationResult.checks,
      });
    }

    
    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists",
      });
    }

    if (!phone || !rollNumber || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

  
    let parsedDayScholarInfo;
    let parsedHostellerInfo;

    if (role === "DayScholar") {
      if (!req.body.dayScholarInfo) {
        return res.status(400).json({
          success: false,
          message: "Day scholar info is required",
        });
      }

      parsedDayScholarInfo =
        typeof req.body.dayScholarInfo === "string"
          ? JSON.parse(req.body.dayScholarInfo)
          : req.body.dayScholarInfo;
    }

    if (role === "Hosteller") {
      if (!req.body.hostellerInfo) {
        return res.status(400).json({
          success: false,
          message: "Hosteller info is required",
        });
      }

      parsedHostellerInfo =
        typeof req.body.hostellerInfo === "string"
          ? JSON.parse(req.body.hostellerInfo)
          : req.body.hostellerInfo;
    }

    
    const profile = await Profile.create({
      user: userId,
      phone,
      rollNumber,
      role,
      dayScholarInfo: role === "DayScholar" ? parsedDayScholarInfo : undefined,
      hostellerInfo: role === "Hosteller" ? parsedHostellerInfo : undefined,
      idCardUrl,
      profileVerified: true,
      verificationMethod: "ai",
    });

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("Create Profile Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Roll number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate(
      "user",
      "name email"
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const existingProfile = await Profile.findOne({ user: userId });
    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const { phone, rollNumber, role } = req.body;

    if (!phone || !rollNumber || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    
    const updateData = {
      phone,
      rollNumber,
      role,
      profileVerified: false,
      verificationMethod: "ai",
      verificationMessage: "",
    };

    let updateQuery = { $set: updateData };

    if (role === "DayScholar") {
      const parsedDayScholarInfo =
        typeof req.body.dayScholarInfo === "string"
          ? JSON.parse(req.body.dayScholarInfo)
          : req.body.dayScholarInfo;

      updateQuery.$set.dayScholarInfo = parsedDayScholarInfo;
      updateQuery.$unset = { hostellerInfo: "" };
    }

    if (role === "Hosteller") {
      const parsedHostellerInfo =
        typeof req.body.hostellerInfo === "string"
          ? JSON.parse(req.body.hostellerInfo)
          : req.body.hostellerInfo;

      updateQuery.$set.hostellerInfo = parsedHostellerInfo;
      updateQuery.$unset = { dayScholarInfo: "" };
    }


    if (req.file) {
      const idCardUrl = req.file.path;

      const verificationResult = await verifyIdCardImage({
        imageUrl: idCardUrl,
        userName: req.user.name,
        rollNumber,
      });

      if (!verificationResult.verified) {
        return res.status(400).json({
          success: false,
          message: "ID card verification failed",
          checks: verificationResult.checks,
        });
      }

      updateQuery.$set.idCardUrl = idCardUrl;
      updateQuery.$set.profileVerified = true;
    }

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      updateQuery,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });

  } catch (error) {
    console.error("Update Profile Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Roll number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};