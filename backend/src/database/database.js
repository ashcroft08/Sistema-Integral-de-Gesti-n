import { Sequelize } from 'sequelize';
import { readdir } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { DB_NAME, DB_USER, DB_PASSWORD } = process.env;
if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
    throw new Error('❌ Faltan DB_NAME, DB_USER o DB_PASSWORD en .env');
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
        timestamps: false
    }
});

const db = { sequelize, Sequelize };

// Ruta a la carpeta models
const modelDir = join(__dirname, '..', 'models');

try {
    const files = await readdir(modelDir);

    for (const file of files) {
        if (file.endsWith('.js') && file !== 'index.js') {
            const modelPath = join(modelDir, file);
            // Convertir ruta a URL para dynamic import en ESM
            const modelUrl = pathToFileURL(modelPath).href;
            const modelDef = (await import(modelUrl)).default;
            const model = modelDef(sequelize, Sequelize.DataTypes);
            db[model.name] = model;
        }
    }
} catch (err) {
    if (err.code === 'ENOENT') {
        console.warn('⚠️ Carpeta models no encontrada. ¿La creaste?');
    } else {
        throw err;
    }
}

// Asociaciones
Object.values(db).forEach(model => {
    if (typeof model.associate === 'function') {
        model.associate(db);
    }
});

export default db;