// src/scripts/import-locations.mjs

import 'dotenv/config';
import readXlsxFile from 'read-excel-file/node';
import db from '../database/database.js';
import { Provincia, Canton, Parroquia } from '../models/index.js';
import fs from 'fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// --- Configuración de rutas ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EXCEL_PATH = join(__dirname, '..', 'data', 'ubicaciones.xlsx');

if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`❌ Archivo no encontrado: ${EXCEL_PATH}`);
    process.exit(1);
}

const { sequelize } = db;

async function importLocations() {
    console.log('▶️ Iniciando importación de ubicaciones desde Excel...');

    // --- 1. Limpiar tablas y reiniciar secuencias ---
    console.log('🧹 Limpiando tablas y reiniciando autoincrementales...');
    await sequelize.transaction(async (t) => {
        // TRUNCATE con RESTART IDENTITY para reiniciar los autoincrementales
        await sequelize.query('TRUNCATE TABLE catalogo.parroquia RESTART IDENTITY CASCADE;', { transaction: t });
        await sequelize.query('TRUNCATE TABLE catalogo.canton RESTART IDENTITY CASCADE;', { transaction: t });
        await sequelize.query('TRUNCATE TABLE catalogo.provincia RESTART IDENTITY CASCADE;', { transaction: t });
    });

    // --- 2. Leer Excel ---
    console.log('📌 Leyendo archivo Excel...');
    const rows = await readXlsxFile(EXCEL_PATH, { sheet: 1 });

    if (rows.length < 2) {
        throw new Error('El archivo Excel está vacío o no contiene datos.');
    }

    // Primera fila = encabezados
    const headers = rows[0].map(h => h?.toString().trim());
    const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, idx) => {
            obj[header] = row[idx] != null ? String(row[idx]).trim() : null;
        });
        return obj;
    });

    console.log(`✅ Leídas ${data.length} filas de datos.`);

    // --- 3. Insertar PROVINCIAS ---
    console.log('📍 Extrayendo y guardando provincias...');
    const provMap = new Map();
    data.forEach(r => {
        if (r.DPA_PROVIN && r.DPA_DESPRO) {
            provMap.set(r.DPA_PROVIN, { codigo: r.DPA_PROVIN, provincia: r.DPA_DESPRO });
        }
    });
    const provincias = Array.from(provMap.values());
    const insertedProv = await Provincia.bulkCreate(provincias, { returning: true });
    const provCodeToId = {};
    insertedProv.forEach(p => provCodeToId[p.codigo] = p.id_provincia);
    console.log(`✅ Insertadas ${provincias.length} provincias.`);

    // --- 4. Insertar CANTONES ---
    console.log('📍 Extrayendo y guardando cantones...');
    const cantMap = new Map();
    data.forEach(r => {
        if (r.DPA_PROVIN && r.DPA_CANTON && r.DPA_DESCAN) {
            const provCode = r.DPA_PROVIN.trim();
            const cantonCode = r.DPA_CANTON.trim();
            const key = `${provCode}-${cantonCode}`;
            if (!cantMap.has(key)) {
                // Limpieza específica para Quito
                let nombreCanton = r.DPA_DESCAN;
                if (nombreCanton === 'DISTRITO METROPOLITANO DE QUITO') {
                    nombreCanton = 'QUITO';
                }

                cantMap.set(key, {
                    codigo: cantonCode,
                    canton: nombreCanton,
                    provCode: provCode
                });
            }
        }
    });

    const cantones = Array.from(cantMap.values())
        .map(c => ({
            canton: c.canton,
            codigo: c.codigo,
            id_provincia: provCodeToId[c.provCode],
            provCode: c.provCode // ⬅️ IMPORTANTE: Mantener provCode para el mapeo
        }))
        .filter(c => c.id_provincia != null);

    const insertedCant = await Canton.bulkCreate(cantones, { returning: true });

    // ⬅️ CORRECCIÓN: Crear el mapeo correcto usando provCode del array original
    const cantKeyToId = {};
    insertedCant.forEach((canton, idx) => {
        const provCode = cantones[idx].provCode;
        const cantonCode = canton.codigo;
        const key = `${provCode}-${cantonCode}`;
        cantKeyToId[key] = canton.id_canton;
    });

    console.log(`✅ Insertados ${cantones.length} cantones.`);

    // --- 5. Insertar PARROQUIAS ---
    console.log('📍 Extrayendo y guardando parroquias...');
    const parrMap = new Map();

    data.forEach(r => {
        if (r.DPA_PARROQ && r.DPA_DESPAR && r.DPA_CANTON && r.DPA_PROVIN) {
            const provCode = r.DPA_PROVIN.trim();
            const cantonCode = r.DPA_CANTON.trim();
            const parroquiaCode = r.DPA_PARROQ.trim();

            // Clave única para la parroquia: Prov-Canton-Parroquia
            const uniqueKey = `${provCode}-${cantonCode}-${parroquiaCode}`;

            if (parrMap.has(uniqueKey)) return; // Ya existe, saltar

            const cantonKey = `${provCode}-${cantonCode}`;
            const idCanton = cantKeyToId[cantonKey];

            if (!idCanton) {
                console.warn(`⚠️ Parroquia "${r.DPA_DESPAR}" no encontró su cantón (${cantonKey})`);
                return;
            }

            parrMap.set(uniqueKey, {
                parroquia: r.DPA_DESPAR,
                codigo: parroquiaCode,
                id_canton: idCanton
            });
        }
    });

    const parroquias = Array.from(parrMap.values());

    await Parroquia.bulkCreate(parroquias);
    console.log(`✅ Insertadas ${parroquias.length} parroquias.`);

    console.log('\n🎉 ¡Importación completada con éxito!');
}

// Ejecutar directamente
importLocations().catch(err => {
    console.error('💥 Error durante la importación:', err);
    process.exit(1);
});