import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root or backend
const envPath = fs.existsSync(path.join(__dirname, '..', '.env'))
  ? path.join(__dirname, '..', '.env')
  : path.join(__dirname, '..', 'backend', '.env');

dotenv.config({ path: envPath });

const { Client } = pg;

async function runMigration() {
  console.log('🚀 Starting Supabase PostgreSQL Migration...');

  // Support direct DATABASE_URL or connection parameters or Supabase service role
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL or SUPABASE_DB_URL is not defined in .env');
    console.log(`
ℹ️  How to configure:
1. Open your Supabase Dashboard -> Project Settings -> Database.
2. Copy the "URI" connection string (Transaction or Session pooler, e.g. postgresql://postgres.[project-ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres).
3. Set DATABASE_URL="your-connection-string" in .env
4. Re-run: npm run migrate:supabase
    `);
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully to Supabase PostgreSQL database.');

    const sqlFilePath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Migration SQL file not found at: ${sqlFilePath}`);
    }

    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('📜 Executing 001_initial_schema.sql...');

    await client.query(sql);

    console.log('🎉 Migration & Seed applied successfully!');
    console.log('Tables created: users, departments, doctors, patients, doctor_availability, appointments, medical_records, prescriptions, notifications, audit_logs.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
