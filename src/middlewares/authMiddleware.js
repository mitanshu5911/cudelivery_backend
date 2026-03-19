import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const protect = async(req, res, next) => {
    
    let token;

    // console.log("AUTH HEADER:", req.headers.authorization);

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }

    if(!token){
        return res.status(401).json({message: "No token, authorization denied"});
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        next();
    } catch (error) {
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({message: "Token expired, login again"});
        }
        return res.status(401).json({message:"Invalid token"});
    }
};

export default protect;