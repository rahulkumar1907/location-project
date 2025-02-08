import express from 'express';
import axios from 'axios';
import Location from '../models/location.js';

const router = express.Router();

// Geocoding API URL
const GOOGLE_GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// Route to fetch location and store it
router.post('/save-location', async (req, res) => {
  console.log(req.body)
  const { latitude, longitude, ipAddress } = req.body;

  try {
    // Get the address from Google Geocoding API
    const response = await axios.get(GOOGLE_GEOCODING_URL, {
      params: {
        latlng: `${latitude},${longitude}`,
        key: process.env.GOOGLE_API_KEY,
      },
    });

    // Extract the  address
    const formattedAddress = response.data.results[0]?.formatted_address || 'Address not found';

    
    const newLocation = new Location({
      latitude,
      longitude,
      ipAddress,
      address: formattedAddress,
    });

    await newLocation.save();

    
    return res.status(201).json({
      success: true,
      message: 'Location saved successfully',
      data: newLocation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error saving location',
    });
  }
});

export default router;
