import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder:"id-cards",
        allowed_formats:["jpg","jpeg","png"],
        resource_type:"image",
    },
});

const upload = multer({
    storage,
    limits:{
        fileSize: 10 * 1024 * 1024, // 5MB
    },
});

export default upload;