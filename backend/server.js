const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8000;
const RADAR_API_KEY = process.env.RADAR_API_KEY;
const DB_URL = process.env.MONGO_DB_URI;

mongoose.connect(DB_URL);

const couponSchema = new mongoose.Schema({
    title: String,
    address: String,
    location: {
        type: {
            type: String,
            enum: ['Point'], // Specify that it should be a Point
            required: true,
        },
        coordinates: {
            type: [Number], // Array of Numbers for [longitude, latitude]
            required: true,
        },
    },
    radius: Number,
});

couponSchema.index({ location: '2dsphere' }); // Add indexing for geospatial queries

const Coupon = mongoose.model('Coupon', couponSchema);


app.use(express.json());

app.post('/api/coupons', async (req, res) => {
    try {
        const { title, address, radius } = req.body;

        // Use Radar API to get coordinates from the provided address
        const coordinates = await getCoordinatesFromAddress(address);

        console.log(coordinates);

        const newCoupon = await Coupon.create({
            title,
            address,
            location: {
                type: 'Point',
                coordinates,
            },
            radius,
        });

        res.json(newCoupon);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/coupons', async (req, res) => {
    console.log('Request received:', req.query);

    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    try {
        console.log('Request received:', req.query);

    const coordinates = [parseFloat(longitude), parseFloat(latitude)]; // Ensure correct order

    const coupons = await Coupon.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates,
                },
                $maxDistance: 1000, // Adjust as needed
            },
        },
    });

    console.log('Coupons:', coupons);

    return res.json(coupons);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Function to get coordinates from Radar API using address
const getCoordinatesFromAddress = async (address) => {
    try {
        const response = await axios.get('https://api.radar.io/v1/geocode/forward', {
            params: {
                query: address,
            },
            headers: {
                Authorization: RADAR_API_KEY,
            },
        });

        return response.data.addresses[0].geometry.coordinates;
    } catch (error) {
        console.error('Error getting coordinates from address:', error);
        throw error;
    }
};

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
