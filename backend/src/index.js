import 'dotenv/config';
import app from './app.js';
import { createSchemas } from './utils/createSchemas.js';
import db from './database/database.js';

async function main() {
    try {
        console.log('🚀 Iniciando aplicación Kallari ERP...');

        // 1. Crear esquemas si no existen
        await createSchemas();
        console.log('✅ Esquemas verificados/creados');

        // 2. Autenticar conexión a la base de datos
        await db.sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida');

        // 3. Verificar si necesitas ejecutar migraciones
        if (process.env.NODE_ENV === 'development') {
            console.log('📋 Modo desarrollo activado');
            console.log('💡 Para migraciones ejecuta: npm run db:setup');

            // Opcional: sincronizar solo en desarrollo inicial
            // await db.sequelize.sync({ alter: true });
        } else {
            console.log('🏭 Modo producción');
            // En producción solo verificamos que las tablas existan
            const tables = await db.sequelize.query(
                "SELECT table_name FROM information_schema.tables WHERE table_schema IN ('catalogo', 'seguridad', 'ventas', 'contabilidad', 'inventario', 'configuracion', 'auditoria')"
            );
            console.log(`📊 Tablas existentes: ${tables[0].length}`);
        }

        // 4. Levantar servidor
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor Kallari ERP en puerto ${PORT}`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📁 Base de datos: ${process.env.DB_NAME}`);
        });

    } catch (error) {
        console.error('💥 Error crítico al iniciar:', error.message);
        console.error('🔍 Stack trace:', error.stack);
        process.exit(1);
    }
}

main();