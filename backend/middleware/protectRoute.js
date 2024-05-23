import User from "../model/user.models.js";
import jwt from 'jsonwebtoken'; 

export const protectRoute = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized. Please login first.' });
        }
        
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized. Please login first.' });
        }

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized. Please login first.' });
        }


        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware",error.message);
        res.status(401).json({ message: 'error interno del servidor.' });
    }


};