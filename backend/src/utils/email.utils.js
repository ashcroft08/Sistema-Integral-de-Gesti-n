import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';

// Configuración necesaria porque usas "import" (ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Carga una plantilla, la combina con el layout y devuelve HTML.
 * @param {string} templateName - El nombre del archivo en /templates (ej: 'welcome')
 * @param {object} data - Los datos a inyectar (ej: { nombre: 'Juan' })
 */
export const getHtmlTemplate = (templateName, data) => {
    // 1. Rutas a los archivos (ajustamos para subir un nivel desde /utils a /templates)
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    const layoutPath = path.join(__dirname, '../templates', 'layout.html');

    // 2. Verificar si existen los archivos (opcional, para debug)
    if (!fs.existsSync(templatePath)) throw new Error(`Plantilla no encontrada: ${templatePath}`);
    if (!fs.existsSync(layoutPath)) throw new Error(`Layout no encontrado: ${layoutPath}`);

    // 3. Leer el contenido HTML
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const layoutSource = fs.readFileSync(layoutPath, 'utf-8');

    // 4. Compilar la plantilla interna (Welcome)
    const templateCompiled = handlebars.compile(templateSource);
    const htmlBody = templateCompiled(data);

    // 5. Compilar el Layout e inyectar el cuerpo en {{{body}}}
    const layoutCompiled = handlebars.compile(layoutSource);

    return layoutCompiled({
        ...data,
        body: htmlBody,
        year: new Date().getFullYear() // Dato global para el footer
    });
};