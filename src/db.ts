import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/hw7";
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
