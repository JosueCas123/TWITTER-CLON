import express from 'express';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv'
import connectMongoDB from './db/connectMongomDB.js';

const app = express();
dotenv.config();

const PORT = 4000;

app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});
