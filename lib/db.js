import { validateEnv } from './config/env.js';
validateEnv();
import mongoose from 'mongoose';

/**
 * Sanitizes raw MongoDB URI strings to eliminate common environment variable pitfalls:
 * - Accidental surrounding double/single quotes or backticks (e.g. from copy-pasting into Vercel)
 * - Leading variable name (e.g. user pasted "MONGODB_URI=mongodb+srv://..." into Vercel value field)
 * - Leading/trailing spaces or tabs
 * - Missing scheme for MongoDB Atlas URLs (e.g. "user:pass@cluster.mongodb.net/dbname")
 * - Missing scheme for local URLs (e.g. "127.0.0.1:27017/ai-leads-platform")
 * - Resolving localhost to 127.0.0.1 to avoid Node 18+ IPv6 (::1) ECONNREFUSED on Windows
 */
export function sanitizeMongoUri(raw) {
  if (!raw || typeof raw !== 'string') {
    return 'mongodb://127.0.0.1:27017/ai-leads-platform';
  }

  let uri = raw.trim();

  // Strip leading/trailing double quotes, single quotes, backticks
  uri = uri.replace(/^["'`]+|["'`]+$/g, '').trim();

  // Strip key prefix if the entire KEY=VALUE was pasted into Vercel's value field
  if (/^(MONGODB_URI|DATABASE_URL)\s*=\s*/i.test(uri)) {
    uri = uri.replace(/^(MONGODB_URI|DATABASE_URL)\s*=\s*/i, '').trim();
  }

  // Strip quotes again in case they were inside: MONGODB_URI="mongodb+srv://..."
  uri = uri.replace(/^["'`]+|["'`]+$/g, '').trim();

  // If empty or literal placeholder word
  if (!uri || ['undefined', 'null', 'none', 'false', 'placeholder'].includes(uri.toLowerCase())) {
    return 'mongodb://127.0.0.1:27017/ai-leads-platform';
  }

  // Detect if user entered a project name or phrase instead of a connection string (e.g. "leads pro")
  const hostPart = uri.replace(/^mongodb(\+srv)?:\/\//i, '').split('/')[0].split('?')[0];
  if (hostPart.includes(' ') || (!hostPart.includes('.') && !hostPart.includes(':') && hostPart !== 'localhost')) {
    throw new Error(
      `Invalid MONGODB_URI in environment: "${raw.trim()}". You entered a project name instead of a database connection string. MONGODB_URI must be a cloud MongoDB Atlas URI (starting with mongodb+srv://) or local MongoDB (mongodb://127.0.0.1:27017/crm).`
    );
  }

  // Local connection without scheme
  if (uri.startsWith('localhost') || uri.startsWith('127.0.0.1')) {
    uri = 'mongodb://' + uri;
  }

  // Atlas cluster connection without scheme
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    if (uri.includes('.mongodb.net')) {
      uri = 'mongodb+srv://' + uri;
    } else {
      uri = 'mongodb://' + uri;
    }
  }

  // Node 18+ IPv6 ::1 localhost avoidance
  if (uri.includes('//localhost')) {
    uri = uri.replace('//localhost', '//127.0.0.1');
  }

  return uri;
}

function getMongoUri() {
  const rawEnvUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  return sanitizeMongoUri(rawEnvUri);
}

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

    let targetUri;
    try {
      targetUri = getMongoUri();
    } catch (parseErr) {
      throw parseErr;
    }

    cached.promise = mongoose.connect(targetUri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error('[Database Connection Error]:', e.message);

    if (e.message.includes('Invalid scheme') || e.message.includes('MongoParseError') || e.message.includes('Invalid MONGODB_URI')) {
      throw new Error(
        'Invalid MongoDB connection string. If deployed on Vercel, check Project Settings -> Environment Variables -> MONGODB_URI. It must start with "mongodb+srv://" (e.g. mongodb+srv://username:password@cluster.mongodb.net/dbname), not a project name.'
      );
    }

    if (e.message.includes('ENOTFOUND') || e.message.includes('getaddrinfo')) {
      throw new Error(
        `Database connection failed (${e.message}). The MongoDB host could not be found. Please check your MONGODB_URI in Vercel Project Settings — ensure it is a valid cloud MongoDB Atlas URI (starting with mongodb+srv://), not a project or company name.`
      );
    }

    if (e.message.includes('ECONNREFUSED') || e.message.includes('Server selection timed out')) {
      throw new Error(
        'Database connection failed. Please ensure MongoDB is running locally (run: net start MongoDB), or provide your cloud MongoDB Atlas connection string in .env.local or Vercel (MONGODB_URI).'
      );
    }
    throw e;
  }

  return cached.conn;
}

export default connectDB;
