import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hw7";

  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    } as any);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    // Не валим процесс — сервер поднимется, а Mongoose будет пытаться реконнектиться
  }
};
