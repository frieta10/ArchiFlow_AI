
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
        console.log('Querying schema...');
        const resSchema = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);

        let output = 'Users table schema:\n';
        resSchema.rows.forEach(row => {
            output += `- ${row.column_name}: ${row.data_type}\n`;
        });

        const resData = await query('SELECT * FROM users LIMIT 1');
        output += '\nSample User Data:\n';
        if (resData.rows.length > 0) {
            output += JSON.stringify(resData.rows[0], null, 2);
        } else {
            output += 'No users found.';
        }

        // Write to file
        const fs = await import('fs');
        fs.writeFileSync(resolve(__dirname, 'schema.txt'), output);
        console.log('Schema written to schema.txt');
    } catch (err) {
        console.error('Error fetching schema:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
