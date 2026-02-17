
import { query } from '../config/database';

async function addRoleColumn() {
    try {
        console.log('Adding role column to users table...');

        // Check if column exists first
        const schemaRes = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'role'
        `);

        if (schemaRes.rows.length === 0) {
            await query(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
            console.log('Role column added successfully.');
        } else {
            console.log('Role column already exists.');
        }

    } catch (err) {
        console.error('Error adding role column:', err);
    } finally {
        process.exit();
    }
}

addRoleColumn();
