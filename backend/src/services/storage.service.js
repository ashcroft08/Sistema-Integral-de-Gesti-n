// ============================================
// services/storage.service.js
// Cloudinary - GRATIS y súper simple
// ============================================
import { v2 as cloudinary } from 'cloudinary';

export class StorageService {
    constructor() {
        // Configurar Cloudinary una sola vez
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        });
    }

    // ============================================
    // SUBIR XML DE FACTURA
    // ============================================
    async uploadFile(fileName, fileContent) {
        try {
            // Cloudinary acepta Buffer o base64
            const buffer = Buffer.from(fileContent, 'utf-8');
            const base64 = buffer.toString('base64');
            const dataUri = `data:application/xml;base64,${base64}`;

            // Subir a Cloudinary
            // Estructura de carpetas: facturas/2025/12/001-001-000000001
            const [year, month] = [new Date().getFullYear(), String(new Date().getMonth() + 1).padStart(2, '0')];
            const folder = `facturas/${year}/${month}`;

            // Extraer nombre sin extensión para usar como public_id
            const publicId = fileName.replace(/\.[^/.]+$/, '');

            const result = await cloudinary.uploader.upload(dataUri, {
                resource_type: 'raw', // Para archivos no-imagen (XML, PDF, etc)
                folder: folder,
                public_id: publicId,
                overwrite: true,
                invalidate: true, // Invalidar CDN cache si existe
                format: 'xml'
            });

            // Retornar URL pública (HTTPS automático)
            return result.secure_url;

        } catch (error) {
            console.error('Error subiendo a Cloudinary:', error);
            throw new Error(`Error subiendo archivo: ${error.message}`);
        }
    }

    // ============================================
    // DESCARGAR ARCHIVO (Opcional - URL es pública)
    // ============================================
    async downloadFile(url) {
        try {
            // Como las URLs son públicas, solo necesitas hacer fetch
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            throw new Error(`Error descargando archivo: ${error.message}`);
        }
    }

    // ============================================
    // ELIMINAR ARCHIVO (Raro en facturación, pero útil)
    // ============================================
    async deleteFile(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: 'raw'
            });

            if (result.result !== 'ok') {
                throw new Error('No se pudo eliminar el archivo');
            }

            return { success: true, message: 'Archivo eliminado' };
        } catch (error) {
            throw new Error(`Error eliminando archivo: ${error.message}`);
        }
    }

    // ============================================
    // LISTAR ARCHIVOS EN UNA CARPETA
    // ============================================
    async listFiles(folder = 'facturas', maxResults = 100) {
        try {
            const result = await cloudinary.api.resources({
                type: 'upload',
                resource_type: 'raw',
                prefix: folder,
                max_results: maxResults
            });

            return result.resources.map(file => ({
                publicId: file.public_id,
                url: file.secure_url,
                size: file.bytes,
                created: new Date(file.created_at),
                format: file.format
            }));
        } catch (error) {
            throw new Error(`Error listando archivos: ${error.message}`);
        }
    }

    // ============================================
    // OBTENER ESTADÍSTICAS DE USO
    // ============================================
    async getUsageStats() {
        try {
            const result = await cloudinary.api.usage();

            return {
                storage: {
                    used: (result.storage.usage / 1024 / 1024 / 1024).toFixed(2), // GB
                    limit: (result.storage.limit / 1024 / 1024 / 1024).toFixed(2), // GB
                    percentage: ((result.storage.usage / result.storage.limit) * 100).toFixed(1)
                },
                bandwidth: {
                    used: (result.bandwidth.usage / 1024 / 1024 / 1024).toFixed(2), // GB
                    limit: (result.bandwidth.limit / 1024 / 1024 / 1024).toFixed(2), // GB
                    percentage: ((result.bandwidth.usage / result.bandwidth.limit) * 100).toFixed(1)
                },
                resources: {
                    images: result.resources || 0,
                    raw: result.raw_resources || 0
                }
            };
        } catch (error) {
            throw new Error(`Error obteniendo estadísticas: ${error.message}`);
        }
    }
}