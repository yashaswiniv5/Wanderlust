const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Trip = require('../models/Trip');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Mock In-Memory Storage
let mockTrips = [];

// @route POST /api/trips/save
// @desc Save a generated itinerary
router.post('/save', async (req, res) => {
    try {
        const tripData = {
            ...req.body,
            user: 'anonymous', // For MVP
            createdAt: new Date()
        };

        if (!isDbConnected()) {
            const newTrip = { ...tripData, _id: `mock_trip_${Date.now()}` };
            mockTrips.push(newTrip);
            return res.status(201).json(newTrip);
        }

        const newTrip = new Trip(tripData);
        await newTrip.save();
        res.status(201).json(newTrip);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route GET /api/trips
// @desc Get saved trips
router.get('/', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json(mockTrips);
        }
        const trips = await Trip.find({ user: 'anonymous' }).sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route DELETE /api/trips/:id
// @desc Delete a trip
router.delete('/:id', async (req, res) => {
    try {
        if (!isDbConnected()) {
            mockTrips = mockTrips.filter(t => t._id !== req.params.id);
            return res.json({ message: 'Trip deleted (mock)' });
        }
        await Trip.findByIdAndDelete(req.params.id);
        res.json({ message: 'Trip deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
