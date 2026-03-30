const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer = null;

async function connectDB() {
  const primaryUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mental_health";

  try {
    await mongoose.connect(primaryUri);
    process.env.MONGODB_URI = primaryUri;
    console.log(`MongoDB connected successfully at: ${primaryUri}`);
    return;
  } catch (primaryError) {
    const allowMemoryDb = process.env.ALLOW_MEMORY_DB !== "false";
    if (!allowMemoryDb) {
      throw primaryError;
    }

    console.warn(`Primary MongoDB unavailable (${primaryError.message}). Falling back to in-memory DB...`);
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    await mongoose.connect(memoryUri);
    process.env.MONGODB_URI = memoryUri;
    console.log(`In-memory MongoDB connected at: ${memoryUri}`);
  }
}

module.exports = connectDB;
