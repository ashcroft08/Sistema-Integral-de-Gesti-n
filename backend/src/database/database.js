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

// Función recursiva para obtener archivos de modelos
async function getModelFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = join(dir, dirent.name);
        return dirent.isDirectory() ? getModelFiles(res) : res;
    }));
    return files.flat();
}

try {
    const files = await getModelFiles(modelDir);

    for (const file of files) {
        // Ignorar index.js y archivos que no sean .js
        if (file.endsWith('.js') && !file.endsWith('index.js')) {
            // Convertir ruta a URL para dynamic import en ESM
            const modelUrl = pathToFileURL(file).href;
            const modelDef = (await import(modelUrl)).default;

            // Verificar que sea una función (modelo válido)
            if (typeof modelDef === 'function') {
                const model = modelDef(sequelize, Sequelize.DataTypes);
                db[model.name] = model;
            }
        }
    }
} catch (err) {
    console.error('❌ Error cargando modelos:', err);
    throw err;
}

// Asociaciones
Object.values(db).forEach(model => {
    if (typeof model.associate === 'function') {
        model.associate(db);
    }
});

export default db;