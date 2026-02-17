
import { Client } from 'pg';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.resolve(rootDir, '.env') });

async function checkMigrations() {
    // Force connection string since .env loading might be tricky for Prisma but pg handles it fine?
    // Using the one from .env: postgresql://postgres:root@127.0.0.1:5432/archiflow_enterprise?schema=public&sslmode=disable
    const connectionString = process.env.DATABASE_URL;
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('Connected to DB.');

        const res = await client.query('SELECT * FROM _prisma_migrations');
        console.table(res.rows);
    } catch (err) {
        if (err.code === '42P01') {
            console.log('_prisma_migrations table does not exist yet.');
        } else {
            console.error('Error:', err);
        }
    } finally {
        await client.end();
    }
}

checkMigrations();
