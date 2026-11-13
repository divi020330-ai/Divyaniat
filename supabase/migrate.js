const path = require('path');
const fs = require('fs');

// Try requiring dotenv and pg from backend node_modules
const backendModules = path.join(__dirname, '..', 'backend', 'node_modules');
const dotenv = require(path.join(backendModules, 'dotenv'));
const pg = require(path.join(backendModules, 'pg'));

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const { Client } = pg;

async function run() {
  console.log('🚀 Running Supabase Direct Setup & Migration...');
  console.log('📡 Supabase URL:', process.env.SUPABASE_URL);

  const sqlFilePath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  // Direct PostgreSQL Connection using Supabase pooler
  const connString = process.env.DATABASE_URL;
  if (connString) {
    try {
      console.log('🔄 Connecting to Supabase Cloud PostgreSQL...');
      const client = new Client({
        connectionString: connString,
        ssl: { rejectUnauthorized: false }
      });
      await client.connect();
      console.log('✅ Connected to Supabase PostgreSQL!');
      console.log('📜 Executing schema & initial seeds...');
      await client.query(sql);
      console.log('🎉 Supabase PostgreSQL Migration completed successfully!');
      await client.end();
      return;
    } catch (err) {
      console.log('⚠️ Direct DB connection notice:', err.message);
    }
  }

  console.log('Note: SQL schema file is located at /supabase/migrations/001_initial_schema.sql');
}

run();
