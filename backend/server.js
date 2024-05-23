import express from 'express';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv'
import connectMongoDB from './db/connectMongomDB.js';
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config();
app.use(express.json()); // to parse 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const PORT = 4000;

app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});
