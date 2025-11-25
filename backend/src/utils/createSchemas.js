import db from '../database/database.js';

export async function createSchemas() {
    const schemas = ['seguridad', 'ventas', 'contabilidad', 'catalogo', 'auditoria'];

    for (const schema of schemas) {
        try {
            await db.sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
            console.log(`✅ Esquema "${schema}" creado o ya existía.`);
        } catch (err) {
            console.error(`❌ Error al crear el esquema "${schema}":`, err.message);
            throw err;
        }
    }
}