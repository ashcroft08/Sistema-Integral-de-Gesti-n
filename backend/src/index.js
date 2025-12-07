import 'dotenv/config'; // 👈 Carga .env al inicio
import app from './app.js';
import { createSchemas } from './utils/createSchemas.js';
import db from './database/database.js';

async function main() {
    try {
        // 1. Crear esquemas en PostgreSQL
        //await createSchemas();

        // 2. Migra modelos a la base de datos
        //await db.sequelize.sync({ alter: false }); // ⚠️ Solo en desarrollo
        console.log('✅ Base de datos sincronizada.');

        // 3. Levantar servidor
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`🚀 Server is listening on port ${PORT}`);
        });

    } catch (error) {
        console.error('💥 Unable to start the application:', error.message);
        process.exit(1);
    }
}

main();