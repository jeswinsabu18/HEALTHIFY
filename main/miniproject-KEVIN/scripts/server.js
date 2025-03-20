import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { MONGO_URI } from './config.js'; // Import the MongoDB URI from config.js

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', "*"], // Allow both your frontend origins
  credentials: true, // Allow cookies & auth headers
};

app.use(cors(corsOptions));
// app.use(cookieParser()); // ✅ Middleware for cookies
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI)
.then(() => console.log('✅ MongoDB Connected', MONGO_URI))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define the /api/addUserToMongo endpoint
app.post('/api/addUserToMongo', async (req, res) => {
    try {
        const { email, fullName, birthdate, gender, weight, height } = req.body;
        console.log('Received data:', req.body); // Log the received data

        if (!email || !fullName || !birthdate || !gender || !weight || !height) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Check if the email already exists in the database
        const db = mongoose.connection.db;
        const collection = db.collection('user_data');
        const existingUser = await collection.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists.' });
        }

        // Insert new user details into MongoDB
        await collection.insertOne({ email, fullName, birthdate, gender, weight, height });

        res.status(201).json({ message: '✅ User data successfully added to MongoDB.' });
    } catch (error) {
        console.error('MongoDB Error:', error);
        res.status(500).json({ error: '❌ Failed to add data to MongoDB.' });
    }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});