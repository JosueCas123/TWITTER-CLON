import path from 'path';
import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors';
import connectMongoDB from './db/connectMongomDB.js';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/posts.route.js';
import notificationRoutes from './routes/notification.route.js';

import { v2 as cloudinary} from 'cloudinary';



dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
    });
const app = express();
 app.use(express.json({limit:"5mb"})); // to parse 
app.use(express.urlencoded({ extended: true }));
const __dirname = path.resolve();
app.use(cookieParser());


// const dominiosPermitidos = ["http://localhost:3000"]

// const corsOptions = {
//     origin: function(origin, callback){
//         if (dominiosPermitidos.indexOf(origin) !== -1 ) {
//             callback(null, true)
//         }else{
//             callback(new Error('No permitido por cors'))
//         }
//     }
// }

app.use(cors())

const PORT =process.env.PORT || 4000;

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notification', notificationRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});
