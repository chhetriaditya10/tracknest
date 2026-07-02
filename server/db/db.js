import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const localFallbackUri = "mongodb://127.0.0.1:27017/tracknest";

mongoose.connection.on("connected", () => {
  console.log("mongoose connection state:", mongoose.connection.readyState);
});

mongoose.connection.on("disconnected", () => {
  console.warn("mongoose disconnected, readyState:", mongoose.connection.readyState);
});

mongoose.connection.on("error", (err) => {
  console.error("mongoose connection error:", err.message);
});

const connectToDb = async () => {
  const connectOptions = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  };

  if (process.env.MONGO_URL) {
    try {
      await mongoose.connect(process.env.MONGO_URL, connectOptions);
      console.log("✅ Connected to MongoDB");
      return;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error.message);
    }
  } else {
    console.warn("⚠️ No MONGO_URL configured.");
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      await mongoose.connect(localFallbackUri, connectOptions);
      console.log("✅ Connected to local MongoDB fallback");
      return;
    } catch (error) {
      console.error("❌ Local MongoDB fallback failed:", error.message);
    }
  }

  console.warn(
    "⚠️ Database unavailable. API routes will respond with 503 until MongoDB is configured."
  );
};

export default connectToDb;
