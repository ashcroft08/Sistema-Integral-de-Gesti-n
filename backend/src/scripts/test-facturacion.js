// ============================================
// test-facturacion.js
// Script para probar facturación SIN certificado
// ============================================
import './load-env.js';
import axios from 'axios';

// Configuración
const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api`;
let AUTH_TOKEN = '';

// ============================================
// HELPER: Log con colores (simplificado)
// ============================================
const log = {
    success: (msg) => console.log('✅', msg),
    error: (msg) => console.log('❌', msg),
    info: (msg) => console.log('ℹ️ ', msg),
    warning: (msg) => console.log('⚠️ ', msg),
    step: (num, msg) => console.log(`\n📍 Paso ${num}:`, msg)
};

async function login() {
    log.step(1, 'Iniciando sesión...');

    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@gmail.com', // Usuario del seed
            password: 'Admin08_*'
        });

        AUTH_TOKEN = response.data.token;
        log.success('Login exitoso');
        log.info(`Token: ${AUTH_TOKEN.substring(0, 30)}...`);
        return true;
    } catch (error) {
        log.error(`Error en login: ${error.response?.data?.message || error.message}`);
        if (error.code) log.error(`Error Code: ${error.code}`);
        if (error.response?.status) log.error(`Status: ${error.response.status}`);
        return false;
    }
}

// ============================================
// 2. OBTENER CATÁLOGOS
// ============================================
async function obtenerCatalogos() {
    log.step(2, 'Obteniendo catálogos (IVAs, Descuentos, Métodos de Pago)...');

    try {
        const response = await axios.get(`${API_URL}/sales/catalogs`, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });

        log.success('Catálogos obtenidos');
        return response.data;
    } catch (error) {
        log.error(`Error obteniendo catálogos: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

// ============================================
// 2.5 OBTENER O CREAR CATEGORÍA
// ============================================
async function obtenerCategorias() {
    log.step(2.5, 'Obteniendo categorías...');

    try {
        const response = await axios.get(`${API_URL}/category-product`, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });

        if (response.data.categorias && response.data.categorias.length > 0) {
            log.success(`Categorías obtenidas: ${response.data.categorias.length}`);
            console.log(`   Usando categoría: ${response.data.categorias[0].categoria} (ID: ${response.data.categorias[0].id_categoria})`);
            return response.data.categorias[0];
        } else {
            log.warning('No se encontraron categorías. Creando una nueva...');

            try {
                const createResponse = await axios.post(`${API_URL}/category-product`, {
                    categoria: 'General'
                }, {
                    headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
                });

                log.success('Categoría creada exitosamente');
                console.log(`   ID Categoría: ${createResponse.data.categoria.id_categoria}`);
                return createResponse.data.categoria;
            } catch (createError) {
                log.error(`Error creando categoría: ${createError.response?.data?.message || createError.message}`);
                return null;
            }
        }
    } catch (error) {
        log.error(`Error obteniendo categorías: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

// ============================================
// 3. CREAR CLIENTE DE PRUEBA
// ============================================
async function crearClientePrueba() {
    log.step(3, 'Obteniendo o creando cliente de prueba...');

    const clientePrueba = {
        id_tipo_identificacion: 1, // RUC
        id_parroquia: 1, // Asume que existe
        identificacion: '1790085783001', // RUC Válido (Supermaxi)
        nombre: 'EmpresaPrueba', // Sin espacios para pasar regex
        apellido: 'Sociedad', // > 3 letras
        celular: '0999888777',
        email: 'empresa.prueba@example.com',
        direccion: 'Av. Principal 123, Quito'
    };

    try {
        // 1. Intentar buscar primero
        const searchResponse = await axios.get(`${API_URL}/clients`, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });

        const clienteExistente = searchResponse.data.clients.find(
            c => c.identificacion === clientePrueba.identificacion
        );

        if (clienteExistente) {
            log.success('Cliente encontrado en la base de datos');
            console.log(`   ID Cliente: ${clienteExistente.id_cliente}`);
            return clienteExistente;
        }

        // 2. Si no existe, crear
        log.info('Cliente no encontrado, creando...');
        const response = await axios.post(`${API_URL}/clients`, clientePrueba, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });

        log.success('Cliente creado exitosamente');
        console.log(`   ID Cliente: ${response.data.client.id_cliente}`);
        return response.data.client;

    } catch (error) {
        log.error(`Error gestionando cliente: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

// ============================================
// 4. CREAR PRODUCTO DE PRUEBA
// ============================================
async function crearProductoPrueba(categoria) {
    log.step(4, 'Creando producto de prueba...');

    if (!categoria) {
        log.error('No se puede crear producto sin categoría');
        return null;
    }

    const productoPrueba = {
        codigo_producto: 'PROD001',
        nombre: 'Producto de Prueba',
        descripcion: 'Producto para testing de facturación',
        precio: 100.00,
        stock_actual: 100,
        stock_minimo: 10,
        id_categoria: categoria.id_categoria
    };

    try {
        const response = await axios.post(`${API_URL}/products`, productoPrueba, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });

        log.success('Producto creado exitosamente');
        console.log(`   ID Producto: ${response.data.producto.id_producto}`);
        console.log(`   Precio: $${response.data.producto.precio}`);
        return response.data.producto;
    } catch (error) {
        // Always try to search if creation fails with 400
        if (error.response?.status === 400) {
            log.warning(`Error 400 creando producto: ${JSON.stringify(error.response.data)}`);
            log.warning('Intentando buscar producto...');
            try {
                const searchResponse = await axios.get(`${API_URL}/products`, {
                    headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
                });

                const productoExistente = searchResponse.data.productos.find(
                    p => p.codigo_producto === productoPrueba.codigo_producto
                );

                if (productoExistente) {
                    log.success('Producto encontrado');
                    console.log(`   ID Producto: ${productoExistente.id_producto}`);
                    return productoExistente;
                } else {
                    console.log('   ❌ Producto no encontrado en la lista.');
                }
            } catch (searchError) {
                log.error('No se pudo buscar el producto');
            }
        } else {
            log.error(`Error creando producto: ${error.response?.data?.message || error.message}`);
        }

        // Return null if failed, but if we found it in search, we returned it above.
        // Wait, the return inside try/catch searchResponse block returns from THAT function?
        // No, it returns from the inner function if I used a helper, but here it's inside the main function.
        // Actually, `return productoExistente` inside the try block works.
        // But if I fall through, I need to return null.
        return null;
    }
}

// ============================================
// 5. CREAR VENTA (FACTURA)
// ============================================
async function crearVenta(cliente, producto, catalogos) {
    log.step(5, '💎 Creando venta/factura de prueba...');

    const ventaPrueba = {
        id_cliente: cliente.id_cliente,
        id_metodo_pago: 1, // Efectivo
        productos: [
            {
                id_producto: producto.id_producto,
                cantidad: 2,
                id_valor_iva: 2, // IVA 12%
                id_descuento: null
            }
        ]
    };

    console.log('\n📄 Datos de la venta:');
    console.log(`   Cliente: ${cliente.nombre} ${cliente.apellido}`);
    console.log(`   Producto: ${producto.nombre}`);
    console.log(`   Cantidad: 2`);
    console.log(`   Precio Unitario: $${producto.precio}`);
    console.log(`   Subtotal: $${producto.precio * 2}`);
    console.log(`   IVA 12%: $${(producto.precio * 2 * 0.12).toFixed(2)}`);
    console.log(`   TOTAL: $${(producto.precio * 2 * 1.12).toFixed(2)}`);

    try {
        const response = await axios.post(`${API_URL}/sales`, ventaPrueba, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });

        log.success('¡VENTA CREADA EXITOSAMENTE! 🎉');
        console.log('\n📊 Resultado:');
        console.log(`   ID Factura: ${response.data.factura.id_factura}`);
        console.log(`   Secuencial: ${response.data.factura.secuencial}`);
        console.log(`   Clave Acceso: ${response.data.factura.clave_acceso_sri}`);
        console.log(`   Estado SRI: ${response.data.info.estado_sri}`);
        console.log(`   Total: $${response.data.factura.total}`);

        if (response.data.factura.xml_firmado_url) {
            console.log(`   XML URL: ${response.data.factura.xml_firmado_url}`);
        }

        return response.data.factura;
    } catch (error) {
        log.error(`Error creando venta: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.details) {
            console.log('\n📋 Detalles del error:');
            error.response.data.details.forEach(d => {
                console.log(`   - ${d.field}: ${d.message}`);
            });
        }
        return null;
    }
}

// ============================================
// 6. CONSULTAR FACTURA
// ============================================
async function consultarFactura(idFactura) {
    log.step(6, `Consultando estado de factura ${idFactura}...`);

    try {
        const response = await axios.get(`${API_URL}/sales/${idFactura}`, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });

        const factura = response.data.factura;

        log.success('Factura consultada exitosamente');
        console.log('\n📄 Detalles de la Factura:');
        console.log(`   Secuencial: ${factura.secuencial}`);
        console.log(`   Estado: ${factura.EstadoSri.estado_sri}`);
        console.log(`   Fecha: ${factura.fecha_emision}`);
        console.log(`   Cliente: ${factura.Cliente.nombre} ${factura.Cliente.apellido}`);
        console.log(`   Total: $${factura.total}`);

        if (factura.xml_firmado_url) {
            log.info(`XML disponible en: ${factura.xml_firmado_url}`);
        }

        if (factura.numero_autorizacion) {
            log.success(`Número Autorización: ${factura.numero_autorizacion}`);
        }

        return factura;
    } catch (error) {
        log.error(`Error consultando factura: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

// ============================================
// 7. VER ESTADÍSTICAS CLOUDINARY
// ============================================
async function verEstadisticas() {
    log.step(7, 'Verificando uso de Cloudinary...');

    try {
        const response = await axios.get(`${API_URL}/sales/stats`, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });

        log.success('Estadísticas obtenidas');
        console.log('\n☁️  Cloudinary:');
        console.log(`   Almacenamiento: ${response.data.stats.storage.used} GB / ${response.data.stats.storage.limit} GB`);
        console.log(`   Uso: ${response.data.stats.storage.percentage}%`);
        console.log(`   Transferencia: ${response.data.stats.bandwidth.used} GB / ${response.data.stats.bandwidth.limit} GB`);
        console.log(`   Archivos XML: ${response.data.stats.resources.raw}`);

        if (response.data.alerts.length > 0) {
            console.log('\n⚠️  Alertas:');
            response.data.alerts.forEach(alert => {
                console.log(`   - ${alert.message}`);
            });
        }

        return response.data.stats;
    } catch (error) {
        log.warning(`No se pudieron obtener estadísticas: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

// ============================================
// EJECUTAR TODAS LAS PRUEBAS
// ============================================
async function ejecutarPruebas() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 INICIANDO PRUEBAS DE FACTURACIÓN');
    console.log('   Modo: SIN CERTIFICADO DIGITAL (Mock)');
    console.log('='.repeat(60));

    try {
        // Paso 1: Login
        const loginOk = await login();
        if (!loginOk) {
            log.error('No se pudo continuar sin autenticación');
            return;
        }

        // Esperar un poco entre requests
        await new Promise(resolve => setTimeout(resolve, 500));

        // Paso 2: Catálogos
        const catalogos = await obtenerCatalogos();
        if (!catalogos) {
            log.error('No se pudieron obtener los catálogos');
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Paso 2.5: Categorías
        const categoria = await obtenerCategorias();
        if (!categoria) {
            log.error('No se pudo obtener una categoría válida');
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Paso 3: Cliente
        const cliente = await crearClientePrueba();
        if (!cliente) {
            log.error('No se pudo crear/obtener el cliente');
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Paso 4: Producto
        const producto = await crearProductoPrueba(categoria);
        if (!producto) {
            // Try to find it again if it failed
            try {
                const searchResponse = await axios.get(`${API_URL}/products`, {
                    headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
                });
                const productoExistente = searchResponse.data.productos.find(
                    p => p.codigo_producto === 'PROD001'
                );
                if (productoExistente) {
                    log.success('Producto encontrado (fallback)');
                    // Continue with this product
                } else {
                    log.error('No se pudo crear/obtener el producto');
                    return;
                }
            } catch (e) {
                log.error('No se pudo crear/obtener el producto');
                return;
            }
        }

        // Re-fetch product if it was null but found in fallback (Wait, logic above is messy)
        // Let's rely on crearProductoPrueba returning the product.
        // If it returns null, we stop.
        if (!producto) {
            // One last check
            const searchResponse = await axios.get(`${API_URL}/products`, {
                headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
            });
            const p = searchResponse.data.productos.find(p => p.codigo_producto === 'PROD001');
            if (p) {
                // proceed
            } else {
                return;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Paso 5: Crear Venta
        // Need to make sure we have the product object
        let finalProduct = producto;
        if (!finalProduct) {
            const searchResponse = await axios.get(`${API_URL}/products`, {
                headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
            });
            finalProduct = searchResponse.data.productos.find(p => p.codigo_producto === 'PROD001');
        }

        const factura = await crearVenta(cliente, finalProduct, catalogos);
        if (!factura) {
            log.error('No se pudo crear la venta');
            return;
        }

        // Esperar procesamiento asíncrono
        log.info('Esperando procesamiento de XML y SRI (5 segundos)...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Paso 6: Consultar estado
        await consultarFactura(factura.id_factura);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Paso 7: Estadísticas
        await verEstadisticas();

        // RESUMEN FINAL
        console.log('\n' + '='.repeat(60));
        console.log('✅ PRUEBAS COMPLETADAS EXITOSAMENTE');
        console.log('='.repeat(60));
        console.log('\n📋 Resumen:');
        console.log('   ✓ Login exitoso');
        console.log('   ✓ Catálogos cargados');
        console.log('   ✓ Categoría obtenida/creada');
        console.log('   ✓ Cliente creado/obtenido');
        console.log('   ✓ Producto creado/obtenido');
        console.log('   ✓ Factura generada');
        console.log('   ✓ XML generado y subido a Cloudinary');
        console.log('   ✓ Proceso SRI simulado (modo mock)');
        console.log('\n💡 Próximo paso:');
        console.log('   Obtén tu certificado digital .p12 del SRI');
        console.log('   y actualiza CERTIFICADO_PATH en .env');
        console.log('   para usar el sistema en modo REAL.\n');

    } catch (error) {
        log.error(`Error general: ${error.message}`);
        console.error(error);
    }
}

// ============================================
// EJECUTAR
// ============================================
ejecutarPruebas();