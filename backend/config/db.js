import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv from backend directory (../.env) or project root (../../.env)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('\n================================================================');
  console.error('ERROR: DATABASE_URL environment variable is undefined.');
  console.error('Please make sure you have created a `.env` file containing:');
  console.error('DATABASE_URL=postgresql://username:password@host:port/database');
  console.error('either in the root folder or the backend/ folder.');
  console.error('================================================================\n');
}

const { Pool } = pg;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' || connectionString?.includes('neon')
    ? { rejectUnauthorized: false }
    : false
});

export const runMigrations = async () => {
  try {
    const migrationPath = path.join(__dirname, '../db/migrations/001_init.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(sql);
    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Database migration failed:', error);
    throw error;
  }
};

export default pool;
