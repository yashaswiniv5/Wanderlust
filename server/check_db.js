const mongoose = require('mongoose');
const Destination = require('./models/Destination');
const connectDB = require('./config/db');
require('dotenv').config();

const checkDb = async () => {
    await connectDB();
    const count = await Destination.countDocuments();
    const docs = await Destination.find({}, 'name vectorId');
    console.log(`Total Destinations: ${count}`);
    console.log('Destinations:', docs);
    process.exit();
};

checkDb();
