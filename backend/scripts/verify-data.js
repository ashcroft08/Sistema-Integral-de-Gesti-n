import { Sequelize } from 'sequelize';
import config from '../src/database/config.cjs';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false
});

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection has been established successfully.');

        const checks = [
            { table: 'catalogo.provincia', query: 'SELECT COUNT(*) as count FROM catalogo.provincia' },
            { table: 'catalogo.tipo_identificacion', query: 'SELECT COUNT(*) as count FROM catalogo.tipo_identificacion' },
            { table: 'seguridad.rol', query: 'SELECT COUNT(*) as count FROM seguridad.rol' },
            { table: 'seguridad.usuario', query: 'SELECT COUNT(*) as count FROM seguridad.usuario' },
            { table: 'configuracion.configuracion_sri', query: 'SELECT COUNT(*) as count FROM configuracion.configuracion_sri' },
            { table: 'inventario.categoria', query: 'SELECT COUNT(*) as count FROM inventario.categoria' },
            { table: 'ventas.cliente', query: 'SELECT COUNT(*) as count FROM ventas.cliente' }
        ];

        const [canton] = await sequelize.query("SELECT * FROM catalogo.canton WHERE canton ILIKE '%Quito%' LIMIT 1");
        console.log('Canton Quito:', canton);

        if (canton.length > 0) {
            const [parroquias] = await sequelize.query(`SELECT * FROM catalogo.parroquia WHERE id_canton = ${canton[0].id_canton} LIMIT 5`);
            console.log('Parroquias in Quito:', parroquias);
        }

        console.log('\nVerifying data counts:');
        for (const check of checks) {
            const [results] = await sequelize.query(check.query);
            const count = results[0].count;
            if (count > 0) {
                console.log(`✅ ${check.table}: ${count} rows`);
            } else {
                console.error(`❌ ${check.table}: 0 rows (Expected > 0)`);
            }
        }

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

verify();
