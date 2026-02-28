import Profile from "../models/Profile.js";

export const roleCheck = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Not authenticated" });
            }

            const profile = await Profile.findOne({ user: req.user._id });

            if (!profile) {
                return res.status(403).json({ message: "Profile not found" });
            }

            if (!allowedRoles.includes(profile.role)) {
                return res.status(403).json({ message: "Access denied" });
            }

            req.profile = profile;

            next();

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}