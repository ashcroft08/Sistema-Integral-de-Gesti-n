import 'dotenv/config';
import app from './app.js';
import { createSchemas } from './utils/createSchemas.js';
import db from './database/database.js';
import logger from './utils/logger.js';

async function main() {
    try {
        logger.info('🚀 Iniciando aplicación Kallari ERP...');

        // 1. Crear esquemas si no existen
        await createSchemas();
        logger.info('✅ Esquemas verificados/creados');

        // 2. Autenticar conexión a la base de datos
        await db.sequelize.authenticate();
        logger.info('✅ Conexión a PostgreSQL establecida');

        // 3. Verificar si necesitas ejecutar migraciones
        if (process.env.NODE_ENV === 'development') {
            logger.info('📋 Modo desarrollo activado');
            logger.info('💡 Para migraciones ejecuta: npm run db:setup');
        } else {
            logger.info('🏭 Modo producción');
            const tables = await db.sequelize.query(
                "SELECT table_name FROM information_schema.tables WHERE table_schema IN ('catalogo', 'seguridad', 'ventas', 'contabilidad', 'inventario', 'configuracion', 'auditoria')"
            );
            logger.info(`📊 Tablas existentes: ${tables[0].length}`);
        }

        // 4. Levantar servidor
        const PORT = process.env.PORT || 4000;
        const server = app.listen(PORT, () => {
            logger.info(`🚀 Servidor Kallari ERP en puerto ${PORT}`);
            logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`📁 Base de datos: ${process.env.DB_NAME}`);
        });

        // 5. Apagado Ordenado (Graceful Shutdown)
        const gracefulShutdown = (signal) => {
            logger.warn(`⚠️ Señal ${signal} recibida. Iniciando apagado ordenado...`);

            server.close(async () => {
                logger.info('🛑 Servidor HTTP cerrado.');
                try {
                    await db.sequelize.close();
                    logger.info('🔌 Conexión de base de datos cerrada limpiamente.');
                    process.exit(0);
                } catch (error) {
                    logger.error({ msg: '💥 Error al cerrar conexión de base de datos durante el apagado', error: error.message });
                    process.exit(1);
                }
            });

            // Forzar salida si no responde a tiempo (10 segundos)
            setTimeout(() => {
                logger.error('💥 Apagado ordenado excedió tiempo límite. Forzando salida.');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error({ msg: '💥 Error crítico al iniciar la aplicación', error: error.message, stack: error.stack });
        process.exit(1);
    }
}

main();