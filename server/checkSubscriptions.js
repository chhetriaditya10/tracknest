import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './models/User.js';

const uri = process.env.MONGO_URL;
if (!uri) {
  console.error('No MONGO_URL configured in .env');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
  const users = await User.find({ subscriptionStatus: { $ne: 'none' } }).select('username email subscriptionStatus plan subscriptionId subscriptionEndDate');
  console.log(JSON.stringify(users, null, 2));
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
