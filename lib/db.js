import { validateEnv } from './config/env';
validateEnv();
import mongoose from 'mongoose';

let rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-leads-platform';

// In Node 18+, 'localhost' defaults to IPv6 '::1'. Normalize to 127.0.0.1 for local MongoDB to avoid ECONNREFUSED on Windows.
if (rawUri.includes('//localhost')) {
  rawUri = rawUri.replace('//localhost', '//127.0.0.1');
}

const MONGODB_URI = rawUri;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }
  cached.conn = null;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error('[Database Connection Error]:', e.message);
    if (e.message.includes('ECONNREFUSED') || e.message.includes('Server selection timed out')) {
      throw new Error(
        'Database connection failed (connect ECONNREFUSED 127.0.0.1:27017). Please ensure MongoDB is running locally (run: net start MongoDB), or provide your cloud MongoDB Atlas connection string in .env.local (MONGODB_URI).'
      );
    }
    throw e;
  }

  return cached.conn;
}

export default connectDB;
