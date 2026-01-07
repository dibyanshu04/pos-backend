const mongoose = require('mongoose');

const connectDb = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/inventory-service';

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log('[inventory-service] Connected to MongoDB');
};

module.exports = { connectDb };

