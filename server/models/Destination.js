const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    type: { type: String, required: true }, // e.g., "Temple", "Restaurant", "Park"
    rating: { type: Number, default: 0 },
    priceTier: { type: String, enum: ['Free', '$', '$$', '$$$'], default: '$$' },
    openingHours: { type: String },
    description: { type: String },
    reviews: [{ type: String }],
    imageUrl: { type: String },
    vectorId: { type: String }, // ID in Pinecone
    isHiddenGem: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
