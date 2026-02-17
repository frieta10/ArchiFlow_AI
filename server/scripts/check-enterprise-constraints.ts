
import { Client } from 'pg';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.resolve(rootDir, '.env') });

// Force connection to archiflow_enterprise
const connectionString = process.env.DATABASE_URL;

async function checkProjectsConstraint() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log(`Connected to ${client.database}`);

        const res = await client.query(`
            SELECT column_name, is_nullable, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'workspace_id';
        `);

        if (res.rows.length === 0) {
            console.log('Column workspace_id not found in projects table!');
        } else {
            console.table(res.rows);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkProjectsConstraint();
