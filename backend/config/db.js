import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' || connectionString?.includes('neon')
    ? { rejectUnauthorized: false }
    : false
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
