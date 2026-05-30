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

let cleanConnectionString = connectionString;
if (cleanConnectionString && cleanConnectionString.includes('?')) {
  const [base, query] = cleanConnectionString.split('?');
  const params = query.split('&').filter((p) => !p.startsWith('sslmode='));
  cleanConnectionString = base + (params.length > 0 ? '?' + params.join('&') : '');
}

const pool = new Pool({
  connectionString: cleanConnectionString,
  ssl: process.env.NODE_ENV === 'production' || cleanConnectionString?.includes('neon')
    ? { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
    : false
});

// Intercept pool.query to add automatic retry for transient database/network errors
const originalQuery = pool.query.bind(pool);
pool.query = async function (...args) {
  // If the last argument is a callback function, forward it directly to avoid breaking pg internals
  if (typeof args[args.length - 1] === 'function') {
    return originalQuery(...args);
  }

  const maxRetries = 3;
  const initialDelay = 1000; // ms

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await originalQuery(...args);
    } catch (error) {
      const isTransient = 
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'EPIPE' ||
        error.syscall === 'read' ||
        error.syscall === 'connect' ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('getaddrinfo') ||
        error.message?.includes('connection') ||
        error.message?.includes('terminating connection');

      if (isTransient && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i); // exponential backoff
        console.warn(`[DB WARNING] Transient query failure (${error.code || error.message}). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

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
