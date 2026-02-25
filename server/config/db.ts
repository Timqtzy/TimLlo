import mongoose from 'mongoose';

let cached = false;

export async function connectDB() {
  if (cached || mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  await mongoose.connect(uri);
  cached = true;
  console.log('MongoDB connected');
}
