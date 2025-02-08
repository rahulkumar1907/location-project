import express from 'express';
import axios from 'axios';
import Location from '../models/location.js';

const router = express.Router();

// Geocoding API URL
const GOOGLE_GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// Validation function
function validateLocation(lat, lon, ipAddress) {
  // Validate Latitude (must be a number between -90 and 90)
  if (typeof(lat)!=="number"||lat === null || lat === undefined || isNaN(lat) || lat < -90 || lat > 90) {
      return "Invalid Latitude: Must be a number between -90 and 90.";
  }

  // Validate Longitude (must be a number between -180 and 180)
  if (typeof(lon)!=="number"||lon === null || lon === undefined || isNaN(lon) || lon < -180 || lon > 180) {
      return "Invalid Longitude: Must be a number between -180 and 180.";
  }

  // Validate IP Address (must be a non-empty string and valid IP format)
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipAddress === null || ipAddress === undefined || ipAddress.trim() === "" || !ipRegex.test(ipAddress)) {
      return "Invalid IP Address: Must be a valid non-empty IP address (e.g., 192.168.0.1).";
  }

  // If all checks pass
  return null; // No errors
}

// Route to fetch location and store it
router.post('/save-location', async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body cannot be empty" });
  }
  const { latitude, longitude, ipAddress } = req.body;
  // Validate latitude, longitude, and ipAddress
  const validationError = validateLocation(latitude, longitude, ipAddress);

  // If validation fails, return an error response
  if (validationError) {
      return res.status(400).json({ error: validationError });
  }
  

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
