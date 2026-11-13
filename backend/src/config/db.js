const { Pool } = require('pg');
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

let pgPool = null;
let supabaseClient = null;
let isMongoConnected = false;

// Initialize Supabase Client if credentials are provided
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('⚡ Supabase Client initialized with Service Role Key.');
  } catch (err) {
    console.error('⚠️ Could not initialize Supabase Client:', err.message);
  }
}

// Initialize PostgreSQL Pool if DATABASE_URL or SUPABASE_DB_URL is available
if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
  try {
    const connStr = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    pgPool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000
    });
    console.log('⚡ PostgreSQL pool configured.');
  } catch (err) {
    console.error('⚠️ Could not configure PostgreSQL pool:', err.message);
  }
}

// Connect to MongoDB if MONGODB_URI is provided
const connectMongoDB = async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      isMongoConnected = true;
      console.log('🍃 MongoDB connected successfully.');
    } catch (err) {
      console.warn('⚠️ MongoDB connection attempt failed, will use Postgres / Mock store:', err.message);
    }
  }
};

module.exports = {
  getPgPool: () => pgPool,
  getSupabase: () => supabaseClient,
  isMongoConnected: () => isMongoConnected,
  connectMongoDB
};
