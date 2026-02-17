
import { query } from '../config/database';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Manually load .env from root if needed
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../../');
dotenv.config({ path: resolve(rootDir, '.env') });

async function checkSchema() {
    try {
        console.log('Querying diagrams schema...');
        const resSchema = await query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'diagrams';
        `);

        let output = 'Schema Info:\n';
        resSchema.rows.forEach(row => {
            output += `[${row.table_name}] ${row.column_name}: ${row.data_type}\n`;
        });

        console.log(output);
    } catch (err) {
        console.error('Error fetching schema:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
