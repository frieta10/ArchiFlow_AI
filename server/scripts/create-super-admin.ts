
import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

async function createSuperAdmin() {
    try {
        const email = 'admin@archiflow.ai';
        console.log(`Creating super admin user (${email})...`);

        // Check if user exists
        const userRes = await query('SELECT * FROM users WHERE email = $1', [email]);

        if (userRes.rows.length > 0) {
            console.log('User already exists. Updating role to admin...');
            await query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
            console.log('User role updated to admin.');
        } else {
            console.log('User does not exist. Creating new admin user...');
            const id = uuidv4();
            // Since password isn't used yet, we can store a dummy hash or implement hashing later.
            // For now, using a placeholder.
            await query(`
                INSERT INTO users (id, email, name, password_hash, role, status, created_at)
                VALUES ($1, $2, $3, $4, 'admin', 'active', NOW())
            `, [id, email, 'Super Admin', 'hashed_placeholder']);
            console.log(`Super admin created with ID: ${id}`);
        }

    } catch (err) {
        console.error('Error creating super admin:', err);
    } finally {
        process.exit();
    }
}

createSuperAdmin();
