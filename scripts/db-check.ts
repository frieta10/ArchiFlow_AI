import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres' // Connect to default DB first to check others
};

async function check() {
    console.log(`Testing connection to ${config.host}:${config.port} as ${config.user}...`);
    const client = new Client(config);
    try {
        await client.connect();
        console.log('✅ Connection successful!');

        const res = await client.query("SELECT datname FROM pg_database WHERE datname = $1", [process.env.DB_NAME]);
        if (res.rows.length > 0) {
            console.log(`✅ Database '${process.env.DB_NAME}' exists.`);
        } else {
            console.log(`⚠️ Database '${process.env.DB_NAME}' does NOT exist.`);
            console.log(`Creating database '${process.env.DB_NAME}'...`);
            await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
            console.log(`✅ Database created.`);
        }
    } catch (err) {
        console.error('❌ Connection failed:', err);
    } finally {
        await client.end();
    }
}

check();
