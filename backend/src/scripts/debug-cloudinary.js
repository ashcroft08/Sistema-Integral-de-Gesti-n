// scripts/debug-cloudinary.js
import './load-env.js';

console.log('🔍 DIAGNÓSTICO DE VARIABLES DE ENTORNO\n');

// Verificar si dotenv está funcionando
console.log('1. Variables de entorno cargadas:');
console.log('===========================================');

// Listar TODAS las variables que empiezan con CLOUDINARY
for (const key in process.env) {
    if (key.startsWith('CLOUDINARY')) {
        if (key.includes('SECRET') || key.includes('KEY')) {
            const value = process.env[key];
            console.log(`${key}: ${value ? '***' + value.slice(-4) : 'VACÍA'}`);
        } else {
            console.log(`${key}: ${process.env[key] || 'VACÍA'}`);
        }
    }
}

console.log('\n2. Archivo .env encontrado:');
console.log('===========================================');
try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Buscar .env en diferentes ubicaciones
    const possiblePaths = [
        path.join(__dirname, '..', '..', '.env'),
        path.join(__dirname, '..', '.env'),
        path.join(__dirname, '.env')
    ];

    for (const envPath of possiblePaths) {
        if (fs.existsSync(envPath)) {
            console.log(`✅ ENCONTRADO: ${envPath}`);
            console.log('Contenido:');
            console.log('----------');
            const content = fs.readFileSync(envPath, 'utf8');
            console.log(content);
            console.log('----------\n');
        }
    }
} catch (error) {
    console.log('❌ Error buscando .env:', error.message);
}

console.log('\n3. Variables requeridas:');
console.log('===========================================');
const required = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

let allOk = true;
for (const varName of required) {
    const value = process.env[varName];
    if (!value) {
        console.log(`❌ ${varName}: NO DEFINIDA`);
        allOk = false;
    } else {
        console.log(`✅ ${varName}: DEFINIDA (${value.length} caracteres)`);
    }
}

if (!allOk) {
    console.log('\n⚠️ SOLUCIÓN:');
    console.log('1. Crea o edita el archivo .env en la raíz de tu proyecto');
    console.log('2. Agrega estas líneas:');
    console.log(`
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key  
CLOUDINARY_API_SECRET=tu_api_secret
    `);
    console.log('3. Guarda el archivo');
    console.log('4. Reinicia el servidor o terminal');
}