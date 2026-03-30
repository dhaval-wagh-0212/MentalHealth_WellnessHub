const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mental_health";
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected successfully at: ${mongoUri}`);
}

module.exports = connectDB;
