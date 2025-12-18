import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
});

async function run() {
    try {
        await client.connect();
        const res = await client.query("DELETE FROM sequelize_seeders WHERE name = '20251216221019-05-inventario.cjs'");
        console.log('Deleted rows:', res.rowCount);
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
    }
}

run();
