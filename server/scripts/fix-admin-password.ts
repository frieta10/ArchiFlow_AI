
import { query } from '../config/database';
import bcrypt from 'bcryptjs';

async function fixAdminPassword() {
    try {
        const email = 'admin@archiflow.ai';
        const newPassword = 'admin'; // Keeping it simple for local dev, user can change later if needed or we invoke with args

        console.log(`Updating password for ${email}...`);

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        await query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);

        console.log('Password updated successfully.');
        console.log(`Login with: ${email} / ${newPassword}`);

    } catch (err) {
        console.error('Error updating password:', err);
    } finally {
        process.exit();
    }
}

fixAdminPassword();
