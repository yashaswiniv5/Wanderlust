const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const { generateEmbedding } = require('../services/ai');
const { queryVectors, upsertVectors } = require('../services/vectorDb');
const mockDestinations = require('../data/mockDestinations');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route POST /api/destinations/add
router.post('/add', async (req, res) => {
    if (!isDbConnected()) return res.status(503).json({ message: "DB not connected (Mock Mode)" });

    try {
        const { name, city, country, type, description, reviews } = req.body;
        const textToEmbed = `${name} ${description} ${type} ${reviews ? reviews.join(" ") : ""}`;
        const embedding = await generateEmbedding(textToEmbed);
        const vectorId = `dest_${Date.now()}`;

        const newDest = new Destination({ ...req.body, vectorId });
        await newDest.save();

        if (embedding.length > 0) {
            await upsertVectors([{
                id: vectorId,
                values: embedding,
                metadata: {
                    mongoId: newDest._id.toString(),
                    name: newDest.name,
                    city: newDest.city,
                    description: newDest.description
                }
            }]);
        }
        res.status(201).json(newDest);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route GET /api/destinations/search
router.get('/search', async (req, res) => {
    try {
        const { q, city } = req.query;

        if (!q) return res.status(400).json({ message: "Query required" });

        // Mock Mode Check
        if (!isDbConnected()) {
            console.log("Serving Mock Search Results");
            // Simple keyword filter on mock data
            const results = mockDestinations.filter(d =>
                d.name.toLowerCase().includes(q.toLowerCase()) ||
                d.description.toLowerCase().includes(q.toLowerCase()) ||
                (d.type && d.type.toLowerCase().includes(q.toLowerCase())) ||
                (d.reviews && d.reviews.some(r => r.toLowerCase().includes(q.toLowerCase())))
            );
            // If "peaceful" or "zen" is in query, prioritize temples/nature in mock logic
            if (q.toLowerCase().includes('peaceful') || q.toLowerCase().includes('zen')) {
                return res.json(mockDestinations.filter(d => d.type === 'Temple' || d.type === 'Nature' || d.type === 'Onsen'));
            }

            return res.json(results.length > 0 ? results : mockDestinations.slice(0, 5));
        }

        const embedding = await generateEmbedding(q);
        const results = await queryVectors(embedding, 10);

        if (!results.matches || results.matches.length === 0) {
            // Fallback Text Search if vector fails
            const textDestinations = await Destination.find({
                $or: [
                    { description: { $regex: q, $options: 'i' } },
                    { name: { $regex: q, $options: 'i' } }
                ]
            }).limit(10);
            return res.json(textDestinations);
        }

        const vectorIds = results.matches.map(match => match.id);
        const destinations = await Destination.find({ vectorId: { $in: vectorIds } });

        res.json(destinations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

const multer = require('multer');
const { analyzeImage } = require('../services/ai');

const upload = multer({ storage: multer.memoryStorage() });

// @route POST /api/destinations/vibe-search
router.post('/vibe-search', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image required" });
        }

        // 1. Analyze Image to get "Vibe" description
        const vibeDescription = await analyzeImage(req.file.buffer, req.file.mimetype);
        console.log("Vibe Description:", vibeDescription);

        // 2. Mock Mode Check (if DB not connected)
        if (!isDbConnected()) {
            // Simple mock response
            return res.json({
                vibeDescription,
                destinations: mockDestinations.slice(0, 5)
            });
        }

        // 3. Generate Embedding for the description
        const embedding = await generateEmbedding(vibeDescription);

        // 4. Query Pinecone for similar vibes
        const results = await queryVectors(embedding, 10);

        if (!results.matches || results.matches.length === 0) {
            return res.json({ vibeDescription, destinations: [] });
        }

        // 5. Fetch full destination details from MongoDB
        const vectorIds = results.matches.map(match => match.id);
        const destinations = await Destination.find({ vectorId: { $in: vectorIds } });

        res.json({ vibeDescription, destinations });

    } catch (error) {
        console.error("Vibe Search Error:", error);
        res.status(500).json({ message: 'Server Error during Vibe Search' });
    }
});

// @route GET /api/destinations
router.get('/', async (req, res) => {
    if (!isDbConnected()) {
        // Handle mock filtering if needed
        let results = mockDestinations;
        if (req.query.isHiddenGem === 'true') {
            results = results.filter(d => d.isHiddenGem);
        }
        return res.json(results);
    }

    try {
        const { city, isHiddenGem } = req.query;
        let query = {};

        if (city) query.city = city;
        if (isHiddenGem === 'true') query.isHiddenGem = true;

        const dests = await Destination.find(query);
        res.json(dests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
