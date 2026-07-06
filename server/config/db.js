const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log("⚠️ Application starting in MOCK MODE (Database disconnected)");
    // process.exit(1); // Do not exit, allow mock mode
  }
};

module.exports = connectDB;
