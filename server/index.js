const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initPinecone } = require('./services/vectorDb');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();
initPinecone();

// Routes
app.get('/', (req, res) => {
    res.json({ message: "WanderLust AI Backend is Running 🚀" });
});

app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/itinerary', require('./routes/itinerary'));
app.use('/api/trips', require('./routes/trips'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
