
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.resolve(rootDir, '.env') });

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'root',
    port: parseInt(process.env.DB_PORT || '5432'),
};

const ENTERPRISE_DB_NAME = 'archiflow_enterprise';

async function setupDatabase() {
    const client = new Client({
        ...DB_CONFIG,
        database: 'postgres' // Connect to default DB to create new one
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL...');

        // 1. Create Database
        const checkDb = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${ENTERPRISE_DB_NAME}'`);
        if (checkDb.rows.length > 0) {
            console.log(`Database '${ENTERPRISE_DB_NAME}' exists. Recreating...`);
            // Terminate connections to the target DB
            await client.query(`
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = '${ENTERPRISE_DB_NAME}'
                AND pid <> pg_backend_pid();
            `);
            await client.query(`DROP DATABASE ${ENTERPRISE_DB_NAME}`);
        }

        await client.query(`CREATE DATABASE ${ENTERPRISE_DB_NAME}`);
        console.log(`Database '${ENTERPRISE_DB_NAME}' created successfully.`);
    } catch (err) {
        console.error('Error creating database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }

    // 2. Apply Schema
    applySchema();
}

async function applySchema() {
    console.log(`Applying schema to '${ENTERPRISE_DB_NAME}'...`);
    const schemaPath = path.resolve(rootDir, 'database/schema.sql');

    if (!fs.existsSync(schemaPath)) {
        console.error(`Schema file not found at: ${schemaPath}`);
        process.exit(1);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    const client = new Client({
        ...DB_CONFIG,
        database: ENTERPRISE_DB_NAME
    });

    try {
        await client.connect();
        await client.query(schemaSql);
        console.log('Schema applied successfully.');

        // specific fix for uuid-ossp if not enabled
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    } catch (err) {
        console.error('Error applying schema:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupDatabase();
