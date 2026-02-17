import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'admin',
    database: process.env.DB_NAME || 'archiflow_main',
    port: parseInt(process.env.DB_PORT || '5432'),
};

export const pool = new Pool(DB_CONFIG);

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const connectDB = async () => {
    try {
        console.log(`[Database] Connecting to ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}...`);
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        console.log(`[Database] Connected successfully. Server time: ${res.rows[0].now}`);
        client.release();
    } catch (err) {
        console.error('[Database] Connection failed:', err);
        // Do not exit process in dev, just log error
    }
};

export const query = (text: string, params?: any[]) => pool.query(text, params);

