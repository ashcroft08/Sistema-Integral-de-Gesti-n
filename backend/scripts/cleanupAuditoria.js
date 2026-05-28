// scripts/cleanupAuditoria.js
// Política de retención de logs:
//   - auditoria.auditoria → eliminar registros con más de 1 año
//   - auditoria.error     → eliminar registros con más de 6 meses
//
// Uso:
//   pnpm run db:cleanup            (usa los valores por defecto)
//   pnpm run db:cleanup -- --dry   (modo simulación, no elimina nada)

import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

// ─── Configuración de retención ─────────────────────────────────────────────
const RETENCION = {
    auditoria: { meses: 12, tabla: 'auditoria.auditoria', columnaFecha: 'fecha' },
    error:     { meses: 6,  tabla: 'auditoria.error',     columnaFecha: 'fecha' }
};

// ─── Utilidades ─────────────────────────────────────────────────────────────
const formatearFecha = (date) => date.toISOString().replace('T', ' ').slice(0, 19);

const calcularFechaLimite = (mesesAtras) => {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - mesesAtras);
    return fecha;
};

// ─── Script principal ───────────────────────────────────────────────────────
async function main() {
    const isDryRun = process.argv.includes('--dry');

    if (isDryRun) {
        console.log('═══════════════════════════════════════════════════════');
        console.log('  🔍 MODO SIMULACIÓN (--dry): No se eliminará nada');
        console.log('═══════════════════════════════════════════════════════\n');
    } else {
        console.log('═══════════════════════════════════════════════════════');
        console.log('  🗑️  LIMPIEZA DE REGISTROS DE AUDITORÍA');
        console.log('═══════════════════════════════════════════════════════\n');
    }

    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT, 10) || 5432,
    });

    try {
        await client.connect();
        console.log(`✅ Conectado a la base de datos: ${process.env.DB_NAME}\n`);

        let totalEliminados = 0;

        for (const [nombre, config] of Object.entries(RETENCION)) {
            const fechaLimite = calcularFechaLimite(config.meses);

            console.log(`📋 Tabla: ${config.tabla}`);
            console.log(`   Retención: ${config.meses} meses`);
            console.log(`   Fecha límite: ${formatearFecha(fechaLimite)}`);

            // 1. Contar registros que se van a eliminar
            const countResult = await client.query(
                `SELECT COUNT(*) AS total FROM ${config.tabla} WHERE ${config.columnaFecha} < $1`,
                [fechaLimite]
            );
            const cantidad = parseInt(countResult.rows[0].total, 10);

            // 2. Contar registros totales para referencia
            const totalResult = await client.query(
                `SELECT COUNT(*) AS total FROM ${config.tabla}`
            );
            const totalRegistros = parseInt(totalResult.rows[0].total, 10);

            console.log(`   Registros totales: ${totalRegistros}`);
            console.log(`   Registros antiguos a eliminar: ${cantidad}`);
            console.log(`   Registros que se conservarán: ${totalRegistros - cantidad}`);

            if (cantidad > 0 && !isDryRun) {
                // 3. Eliminar registros antiguos
                const deleteResult = await client.query(
                    `DELETE FROM ${config.tabla} WHERE ${config.columnaFecha} < $1`,
                    [fechaLimite]
                );
                console.log(`   ✅ Eliminados: ${deleteResult.rowCount} registros`);
                totalEliminados += deleteResult.rowCount;
            } else if (cantidad === 0) {
                console.log('   ✅ No hay registros antiguos para eliminar');
            } else {
                console.log(`   🔍 [SIMULACIÓN] Se eliminarían ${cantidad} registros`);
            }

            console.log('');
        }

        // Resumen final
        console.log('═══════════════════════════════════════════════════════');
        if (isDryRun) {
            console.log('  🔍 Simulación completada. Ejecuta sin --dry para aplicar.');
        } else {
            console.log(`  ✅ Limpieza completada. Total eliminados: ${totalEliminados}`);
        }
        console.log(`  📅 Ejecutado: ${formatearFecha(new Date())}`);
        console.log('═══════════════════════════════════════════════════════');

    } catch (err) {
        console.error('❌ Error durante la limpieza:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
