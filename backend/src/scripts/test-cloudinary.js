import './load-env.js';

import { StorageService } from '../services/storage.service.js';

const storage = new StorageService();

async function test() {
    try {
        // Subir XML de prueba
        const url = await storage.uploadFile(
            'test-factura.xml',
            '<factura><test>Hola Mundo</test></factura>'
        );

        console.log('✅ URL pública:', url);
        console.log('✅ Cloudinary funcionando!');

        // Ver estadísticas
        const stats = await storage.getUsageStats();
        console.log('📊 Uso:', stats);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

test();