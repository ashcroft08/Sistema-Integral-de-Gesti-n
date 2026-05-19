import { createSchemas } from '../utils/createSchemas.js';
import { sequelize } from '../database/database.js';
import 'dotenv/config';

async function setupDatabase() {
    console.log('=========================================');
    console.log('🔧 SETUP DE BASE DE DATOS - KALLARI ERP');
    console.log('=========================================');

    try {
        // 1. Verificar variables de entorno
        console.log('🔍 Verificando configuración...');
        if (!process.env.DB_NAME || !process.env.DB_USER) {
            throw new Error('Variables de entorno DB_NAME o DB_USER no configuradas');
        }

        // 2. Crear esquemas
        console.log('\n📂 Creando esquemas...');
        await createSchemas();
        console.log('✅ Esquemas creados con éxito');

        // 3. Mostrar instrucciones para migraciones
        console.log('\n📋 INSTRUCCIONES PARA MIGRACIONES:');
        console.log('---------------------------------');
        console.log('1. Crear migración:');
        console.log('   npx sequelize-cli migration:generate --name nombre_migracion');
        console.log('');
        console.log('2. Crear seeder:');
        console.log('   npx sequelize-cli seed:generate --name nombre_seeder');
        console.log('');
        console.log('3. Ejecutar migraciones:');
        console.log('   npm run migrate');
        console.log('');
        console.log('4. Ejecutar seeders:');
        console.log('   npm run seed');
        console.log('');
        console.log('5. Setup completo:');
        console.log('   npm run db:setup');

        console.log('\n✅ Setup de base de datos completado');
        console.log('📊 Esquemas creados: seguridad, configuracion, auditoria');

        process.exit(0);

    } catch (error) {
        console.error('\n💥 ERROR en setup:', error.message);
        if (error.original) {
            console.error('🔍 Error original:', error.original.message);
        }
        process.exit(1);
    }
}

setupDatabase();