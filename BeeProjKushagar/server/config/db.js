const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri === 'in-memory') {
    console.log('⚡ Running in Zero-Config Store Mode (Local JSON Database active in /data/db.json).');
    console.log('💡 Note: You can link MongoDB Atlas anytime by setting MONGO_URI in server/.env');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Could not connect to MongoDB Atlas (${error.message}).`);
    console.log('⚡ Gracefully falling back to Zero-Config Local Store (no Atlas required).');
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
