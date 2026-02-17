
import { Client } from 'pg';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.resolve(rootDir, '.env') });

async function verifyConnection() {
    const connectionString = process.env.DATABASE_URL;
    console.log(`Testing connection string: ${connectionString}`);

    if (!connectionString) {
        console.error('DATABASE_URL is missing in .env');
        process.exit(1);
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('Connected successfully via connection string!');
        const res = await client.query('SELECT current_database(), current_schema()');
        console.log('Context:', res.rows[0]);
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await client.end();
    }
}

verifyConnection();
