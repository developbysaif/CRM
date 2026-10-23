import { validateEnv } from './config/env';
validateEnv();
import mongoose from 'mongoose';

let rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-leads-platform';

// In Node 18+, 'localhost' defaults to IPv6 '::1'. Normalize to 127.0.0.1 for local MongoDB to avoid ECONNREFUSED on Windows.
if (rawUri.includes('localhost:27017')) {
  rawUri = rawUri.replace('localhost:27017', '127.0.0.1:27017');
}

const MONGODB_URI = rawUri;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('[Database Connection Error]:', e.message);
    if (e.message.includes('ECONNREFUSED') || e.message.includes('Server selection timed out')) {
      throw new Error(
        'Database connection failed. Please ensure MongoDB is running locally (run: mongod), or provide your cloud MongoDB Atlas connection string in .env.local (MONGODB_URI).'
      );
    }
    throw e;
  }

  return cached.conn;
}

export default connectDB;
