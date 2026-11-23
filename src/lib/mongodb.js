import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/motorcycle_shirdel';

// کش اتصال تا در Hot-Reload و Serverless چند بار وصل نشویم
let cached = global._araMongoose;
if (!cached) {
  cached = global._araMongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
