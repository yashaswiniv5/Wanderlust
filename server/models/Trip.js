const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    user: { type: String, default: 'anonymous' }, // Placeholder for user ID
    city: { type: String, required: true },
    summary: { type: String },
    itinerary: { type: Object, required: true }, // The generated day-wise plan
    packingList: { type: Object }, // Optional: saved packing list
    etiquette: { type: Array }, // Optional: saved etiquette
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
