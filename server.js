import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import locationRoute from './routes/locationRoute.js';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware to parse incoming requests as JSON
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Use location route
app.use('/api/locations', locationRoute);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
