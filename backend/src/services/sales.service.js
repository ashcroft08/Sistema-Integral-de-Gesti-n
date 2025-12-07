import {
    Factura, DetalleFactura, Producto, MovimientoInventario,
    TipoMovimiento, EstadoSri, ValorIva, Descuento, Cliente,
    Usuario, MetodoPago
} from '../models/index.js';
import db from '../database/database.js';
import { SriService } from './sri.service.js';
import { StorageService } from './storage.service.js'; // Backblaze

const { sequelize } = db;

export class SalesService {
    constructor() {
        this.sriService = new SriService();
        this.storageService = new StorageService();
    }

    _redondear(valor) {
        return Math.round(valor * 100) / 100;
    }

    async _generarSecuencial(transaction) {
        const ultimaFactura = await Factura.findOne({
            order: [['id_factura', 'DESC']],
            attributes: ['secuencial'],
            lock: transaction.LOCK.UPDATE,
            transaction
        });

        let secuencia = 1;
        if (ultimaFactura && ultimaFactura.secuencial) {
            const partes = ultimaFactura.secuencial.split('-');
            secuencia = parseInt(partes[2]) + 1;
        }

        return `001-001-${secuencia.toString().padStart(9, '0')}`;
    }

    // ============================================
    // CREAR VENTA - MEJORADO
    // ============================================
    async createSale(data) {
        const t = await sequelize.transaction();

        try {
            const { id_cliente, id_vendedor, id_metodo_pago, productos } = data;

            // ====== VALIDACIONES ======
            const clienteExiste = await Cliente.findByPk(id_cliente, { transaction: t });
            if (!clienteExiste) {
                throw new Error('Cliente no encontrado.');
            }

            const metodoPagoExiste = await MetodoPago.findByPk(id_metodo_pago, { transaction: t });
            if (!metodoPagoExiste || !metodoPagoExiste.activo) {
                throw new Error('Método de pago no válido.');
            }

            if (!productos || productos.length === 0) {
                throw new Error('Debe incluir al menos un producto en la venta.');
            }

            // ====== CONFIGURACIONES ======
            const estadoPendiente = await EstadoSri.findOne({
                where: { codigo: 'SRI_PENDIENTE' },
                transaction: t
            });
            const tipoMovVenta = await TipoMovimiento.findOne({
                where: { tipo_movimiento: 'MOV_VENTA' },
                transaction: t
            });

            if (!estadoPendiente || !tipoMovVenta) {
                throw new Error('Error de configuración: Faltan estados SRI o Tipos de Movimiento.');
            }

            // ====== GENERAR SECUENCIAL ======
            const nuevoSecuencial = await this._generarSecuencial(t);

            // ====== DETERMINAR IVA PRINCIPAL (el más usado) ======
            const ivaMap = {};
            for (const item of productos) {
                ivaMap[item.id_valor_iva] = (ivaMap[item.id_valor_iva] || 0) + 1;
            }
            const ivaPrincipal = Object.keys(ivaMap).reduce((a, b) =>
                ivaMap[a] > ivaMap[b] ? a : b
            );

            // ====== CREAR FACTURA ======
            const nuevaFactura = await Factura.create({
                id_cliente,
                id_vendedor,
                id_estado_sri: estadoPendiente.id_estado_sri,
                id_valor_iva: parseInt(ivaPrincipal),
                id_metodo_pago,
                secuencial: nuevoSecuencial,
                fecha_emision: new Date(),
                total_descuento: 0,
                subtotal_sin_iva: 0,
                subtotal_con_iva: 0,
                total_iva: 0,
                total: 0
            }, { transaction: t });

            // ====== TOTALIZADORES ======
            let totalSubtotalSinIva = 0;
            let totalSubtotalConIva = 0;
            let totalDescuentos = 0;
            let totalIva = 0;
            let totalPagarFinal = 0;

            // ====== PROCESAR PRODUCTOS ======
            for (const item of productos) {
                if (!item.cantidad || item.cantidad <= 0) {
                    throw new Error('La cantidad de cada producto debe ser mayor a cero.');
                }

                const productoDb = await Producto.findByPk(item.id_producto, { transaction: t });
                if (!productoDb) {
                    throw new Error(`Producto ID ${item.id_producto} no encontrado.`);
                }

                const ivaDb = await ValorIva.findByPk(item.id_valor_iva, { transaction: t });
                if (!ivaDb) {
                    throw new Error(`IVA ID ${item.id_valor_iva} no válido.`);
                }

                let porcentajeDesc = 0;
                let idDescuentoFinal = item.id_descuento || null;

                if (item.id_descuento) {
                    const descuentoDb = await Descuento.findByPk(item.id_descuento, { transaction: t });
                    if (descuentoDb && descuentoDb.activo) {
                        porcentajeDesc = parseFloat(descuentoDb.porcentaje_descuento);
                    } else {
                        throw new Error(`Descuento ID ${item.id_descuento} no está disponible.`);
                    }
                }

                if (productoDb.stock_actual < item.cantidad) {
                    throw new Error(`Stock insuficiente para "${productoDb.nombre}". Disponible: ${productoDb.stock_actual}`);
                }

                // ====== CÁLCULOS ======
                const cantidad = parseInt(item.cantidad);
                const precio = parseFloat(productoDb.precio);
                const subtotalBruto = this._redondear(precio * cantidad);
                const valorDescuento = this._redondear(subtotalBruto * (porcentajeDesc / 100));
                const baseImponible = this._redondear(subtotalBruto - valorDescuento);
                const porcentajeIva = parseFloat(ivaDb.porcentaje_iva);
                const valorIva = this._redondear(baseImponible * (porcentajeIva / 100));
                const totalLinea = this._redondear(baseImponible + valorIva);

                totalDescuentos = this._redondear(totalDescuentos + valorDescuento);
                totalIva = this._redondear(totalIva + valorIva);
                totalPagarFinal = this._redondear(totalPagarFinal + totalLinea);

                if (porcentajeIva > 0) {
                    totalSubtotalConIva = this._redondear(totalSubtotalConIva + baseImponible);
                } else {
                    totalSubtotalSinIva = this._redondear(totalSubtotalSinIva + baseImponible);
                }

                // ====== GUARDAR DETALLE ======
                const detalleCreado = await DetalleFactura.create({
                    id_factura: nuevaFactura.id_factura,
                    id_producto: productoDb.id_producto,
                    id_valor_iva: ivaDb.id_iva,
                    id_descuento: idDescuentoFinal,
                    cantidad: cantidad,
                    precio_unitario: precio,
                    subtotal: baseImponible,
                    porcentaje_descuento: porcentajeDesc,
                    valor_descuento: valorDescuento,
                    total: totalLinea
                }, { transaction: t });

                // ====== MOVIMIENTO INVENTARIO ======
                const stockAnterior = productoDb.stock_actual;
                const stockNuevo = stockAnterior - cantidad;

                await MovimientoInventario.create({
                    id_producto: productoDb.id_producto,
                    id_tipo_movimiento: tipoMovVenta.id_tipo_movimiento,
                    cantidad: cantidad,
                    stock_anterior: stockAnterior,
                    stock_nuevo: stockNuevo,
                    fecha_movimiento: new Date(),
                    id_detalle_factura: detalleCreado.id_detalle_factura
                }, { transaction: t });

                await productoDb.update({ stock_actual: stockNuevo }, { transaction: t });
            }

            // ====== ACTUALIZAR TOTALES ======
            await nuevaFactura.update({
                subtotal_sin_iva: totalSubtotalSinIva,
                subtotal_con_iva: totalSubtotalConIva,
                total_descuento: totalDescuentos,
                total_iva: totalIva,
                total: totalPagarFinal
            }, { transaction: t });

            const idFacturaCreada = nuevaFactura.id_factura;

            await t.commit();

            // ====== POST-COMMIT: PROCESO SRI (ASÍNCRONO) ======
            // No bloqueamos la respuesta al usuario
            this._procesarSriAsync(idFacturaCreada).catch(err => {
                console.error(`Error procesando SRI para factura ${idFacturaCreada}:`, err);
            });

            // ====== RETORNAR FACTURA ======
            return await this._cargarFacturaCompleta(idFacturaCreada);

        } catch (error) {
            if (!t.finished) {
                await t.rollback();
            }
            throw error;
        }
    }

    // ============================================
    // PROCESO SRI ASÍNCRONO (NO BLOQUEA RESPUESTA)
    // ============================================
    async _procesarSriAsync(idFactura) {
        try {
            // 1. Generar XML
            const xml = await this.sriService.generarXmlFactura(idFactura);

            // 2. Firmar XML
            const config = await ConfiguracionSri.findOne({ where: { activo: true } });
            const xmlFirmado = await this.sriService.firmarXml(
                xml,
                config.certificado_path,
                config.certificado_password
            );

            // 3. Subir a Backblaze
            const factura = await Factura.findByPk(idFactura);
            const nombreArchivo = `facturas/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${factura.secuencial}.xml`;
            const urlXml = await this.storageService.uploadFile(nombreArchivo, xmlFirmado);

            // 4. Actualizar estado a FIRMADO
            const estadoFirmado = await EstadoSri.findOne({ where: { codigo: 'SRI_FIRMADO' } });
            await factura.update({
                xml_firmado_url: urlXml,
                id_estado_sri: estadoFirmado.id_estado_sri
            });

            // 5. Enviar al SRI
            const respuesta = await this.sriService.enviarAlSri(xmlFirmado);

            if (respuesta.estado === 'RECIBIDA') {
                const estadoRecibida = await EstadoSri.findOne({ where: { codigo: 'SRI_RECIBIDA' } });
                await factura.update({
                    id_estado_sri: estadoRecibida.id_estado_sri,
                    xml_respuesta_sri: respuesta.mensaje
                });

                // 6. Consultar autorización (después de 2 segundos)
                setTimeout(async () => {
                    await this._verificarAutorizacion(idFactura);
                }, 2000);
            }
        } catch (error) {
            console.error('Error en proceso SRI:', error);
            const estadoRechazado = await EstadoSri.findOne({ where: { codigo: 'SRI_RECHAZADO' } });
            await Factura.update(
                {
                    id_estado_sri: estadoRechazado.id_estado_sri,
                    mensaje_sri: error.message
                },
                { where: { id_factura: idFactura } }
            );
        }
    }

    async _verificarAutorizacion(idFactura) {
        try {
            const factura = await Factura.findByPk(idFactura);
            const resultado = await this.sriService.consultarAutorizacion(factura.clave_acceso_sri);

            if (resultado.autorizado) {
                const estadoAutorizado = await EstadoSri.findOne({ where: { codigo: 'SRI_AUTORIZADO' } });
                await factura.update({
                    id_estado_sri: estadoAutorizado.id_estado_sri,
                    numero_autorizacion: resultado.numeroAutorizacion,
                    fecha_autorizacion: resultado.fechaAutorizacion,
                    xml_respuesta_sri: resultado.xmlRespuesta
                });
            }
        } catch (error) {
            console.error('Error verificando autorización:', error);
        }
    }

    // ============================================
    // HELPER: CARGAR FACTURA COMPLETA
    // ============================================
    async _cargarFacturaCompleta(idFactura) {
        return await Factura.findByPk(idFactura, {
            include: [
                {
                    model: Cliente,
                    attributes: ['id_cliente', 'nombre', 'apellido', 'identificacion', 'email']
                },
                {
                    model: Usuario,
                    as: 'Usuario',
                    attributes: ['id_usuario', 'nombre', 'apellido', 'email']
                },
                {
                    model: EstadoSri,
                    attributes: ['id_estado_sri', 'codigo', 'estado_sri', 'descripcion']
                },
                {
                    model: MetodoPago,
                    attributes: ['id_metodo_pago', 'metodo_pago', 'codigo']
                },
                {
                    model: DetalleFactura,
                    include: [
                        {
                            model: Producto,
                            attributes: ['id_producto', 'nombre', 'codigo_producto', 'precio']
                        },
                        {
                            model: ValorIva,
                            attributes: ['id_iva', 'porcentaje_iva', 'codigo']
                        },
                        {
                            model: Descuento,
                            attributes: ['id_descuento', 'descuento', 'porcentaje_descuento']
                        }
                    ]
                }
            ]
        });
    }

    // ============================================
    // CATÁLOGOS PARA FRONTEND
    // ============================================
    async getSalesCatalogs() {
        const descuentos = await Descuento.findAll({
            where: { activo: true },
            order: [['porcentaje_descuento', 'DESC']]
        });
        const impuestos = await ValorIva.findAll({
            where: { activo: true },
            order: [['porcentaje_iva', 'ASC']]
        });
        const metodosPago = await MetodoPago.findAll({
            where: { activo: true },
            order: [['metodo_pago', 'ASC']]
        });

        return { descuentos, impuestos, metodosPago };
    }

    // ============================================
    // HISTORIAL DE VENTAS
    // ============================================
    async getSalesHistory(filtros = {}) {
        const { fecha_desde, fecha_hasta, id_vendedor, id_estado_sri, limit = 50 } = filtros;

        const where = {};
        if (fecha_desde) where.fecha_emision = { [sequelize.Sequelize.Op.gte]: fecha_desde };
        if (fecha_hasta) where.fecha_emision = { ...where.fecha_emision, [sequelize.Sequelize.Op.lte]: fecha_hasta };
        if (id_vendedor) where.id_vendedor = id_vendedor;
        if (id_estado_sri) where.id_estado_sri = id_estado_sri;

        return await Factura.findAll({
            where,
            include: [
                { model: Cliente, attributes: ['nombre', 'apellido', 'identificacion'] },
                { model: Usuario, as: 'Usuario', attributes: ['nombre', 'apellido'] },
                { model: EstadoSri, attributes: ['estado_sri', 'codigo'] },
                { model: MetodoPago, attributes: ['metodo_pago'] }
            ],
            order: [['fecha_emision', 'DESC'], ['id_factura', 'DESC']],
            limit
        });
    }

    // ============================================
    // REENVIAR AL SRI (PARA FACTURAS RECHAZADAS)
    // ============================================
    async reenviarAlSri(idFactura) {
        const factura = await Factura.findByPk(idFactura);

        if (!factura) {
            throw new Error('Factura no encontrada');
        }

        const estadosPermitidos = ['SRI_RECHAZADO', 'SRI_DEVUELTA', 'SRI_PENDIENTE'];
        const estadoActual = await EstadoSri.findByPk(factura.id_estado_sri);

        if (!estadosPermitidos.includes(estadoActual.codigo)) {
            throw new Error('La factura no puede ser reenviada en su estado actual');
        }

        await this._procesarSriAsync(idFactura);

        return { mensaje: 'Factura enviada al SRI para reprocesamiento' };
    }
}