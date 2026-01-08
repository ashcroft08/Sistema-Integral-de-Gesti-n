import {
    Factura, DetalleFactura, Producto, MovimientoInventario,
    TipoMovimiento, EstadoSri, ValorIva, Descuento, Cliente,
    Usuario, MetodoPago, CuentaPorCobrar, PagoCuentaCobrar,
    ConfiguracionSri, NotificacionesStock, ClienteIdentificacion, TipoIdentificacion
} from '../models/index.js';
import db from '../database/database.js';
import { SriService } from './sri.service.js';
import { StorageService } from './storage.service.js';
import { Op } from 'sequelize';

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
    // CREAR VENTA - ACTUALIZADO
    // ============================================
    async createSale(data) {
        const t = await sequelize.transaction();

        try {
            const {
                id_cliente,
                id_vendedor,
                id_metodo_pago,
                tipo_venta = 'CONTADO',
                plazo_credito_dias,
                referencia_pago,
                productos
            } = data;

            // ====== VALIDACIONES ======
            const clienteExiste = await Cliente.findByPk(id_cliente, { transaction: t });
            if (!clienteExiste) {
                throw new Error('Cliente no encontrado.');
            }

            const metodoPagoExiste = await MetodoPago.findByPk(id_metodo_pago, { transaction: t });
            if (!metodoPagoExiste || !metodoPagoExiste.activo) {
                throw new Error('Método de pago no válido.');
            }

            if (tipo_venta === 'CREDITO' && (!plazo_credito_dias || plazo_credito_dias <= 0)) {
                throw new Error('Las ventas a crédito requieren un plazo en días mayor a 0.');
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

            const nuevoSecuencial = await this._generarSecuencial(t);

            const ivaMap = {};
            for (const item of productos) {
                ivaMap[item.id_valor_iva] = (ivaMap[item.id_valor_iva] || 0) + 1;
            }
            const ivaPrincipal = Object.keys(ivaMap).reduce((a, b) =>
                ivaMap[a] > ivaMap[b] ? a : b
            );

            let fechaVencimiento = null;
            if (tipo_venta === 'CREDITO') {
                fechaVencimiento = new Date();
                fechaVencimiento.setDate(fechaVencimiento.getDate() + plazo_credito_dias);
            }

            const nuevaFactura = await Factura.create({
                id_cliente,
                id_vendedor,
                id_estado_sri: estadoPendiente.id_estado_sri,
                id_valor_iva: parseInt(ivaPrincipal),
                id_metodo_pago,
                tipo_venta,
                plazo_credito_dias: tipo_venta === 'CREDITO' ? plazo_credito_dias : null,
                fecha_vencimiento: fechaVencimiento,
                referencia_pago,
                secuencial: nuevoSecuencial,
                fecha_emision: new Date(),
                total_descuento: 0,
                subtotal_sin_iva: 0,
                subtotal_con_iva: 0,
                total_iva: 0,
                total: 0,
                saldo_pendiente: 0
            }, { transaction: t });

            let totalSubtotalSinIva = 0;
            let totalSubtotalConIva = 0;
            let totalDescuentos = 0;
            let totalIva = 0;
            let totalPagarFinal = 0;

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

                const stockMinimo = productoDb.stock_minimo;
                const stockAnterior = productoDb.stock_actual;
                const stockNuevo = stockAnterior - cantidad;

                const now = new Date();
                const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

                await MovimientoInventario.create({
                    id_producto: productoDb.id_producto,
                    id_tipo_movimiento: tipoMovVenta.id_tipo_movimiento,
                    cantidad: cantidad,
                    stock_anterior: stockAnterior,
                    stock_nuevo: stockNuevo,
                    fecha_movimiento: now,
                    id_detalle_factura: detalleCreado.id_detalle_factura,
                    detalle: `${formattedDate}: Venta de ${cantidad} unidades. Factura ${nuevaFactura.secuencial}`
                }, { transaction: t });

                await productoDb.update({ stock_actual: stockNuevo }, { transaction: t });

                if (stockNuevo === 0) {
                    await NotificacionesStock.create({
                        id_producto: productoDb.id_producto,
                        mensaje: `AGOTADO: El producto "${productoDb.nombre}" se ha agotado. Aumentar stock.`
                    }, { transaction: t });
                }
                else if (stockNuevo < stockMinimo) {
                    await NotificacionesStock.create({
                        id_producto: productoDb.id_producto,
                        mensaje: `BAJO STOCK: "${productoDb.nombre}" tiene solo ${productoDb.stock_actual} unidades (mínimo: ${productoDb.stock_minimo})`
                    }, { transaction: t });
                }
            }

            const saldoPendiente = tipo_venta === 'CREDITO' ? totalPagarFinal : 0;

            await nuevaFactura.update({
                subtotal_sin_iva: totalSubtotalSinIva,
                subtotal_con_iva: totalSubtotalConIva,
                total_descuento: totalDescuentos,
                total_iva: totalIva,
                total: totalPagarFinal,
                saldo_pendiente: saldoPendiente
            }, { transaction: t });

            if (tipo_venta === 'CREDITO') {
                await CuentaPorCobrar.create({
                    id_factura: nuevaFactura.id_factura,
                    id_cliente: id_cliente,
                    monto_total: totalPagarFinal,
                    monto_pagado: 0,
                    saldo_pendiente: totalPagarFinal,
                    fecha_emision: new Date(),
                    fecha_vencimiento: fechaVencimiento,
                    estado: 'PENDIENTE'
                }, { transaction: t });
            }

            const idFacturaCreada = nuevaFactura.id_factura;

            await t.commit();

            this._procesarSriAsync(idFacturaCreada).catch(err => {
                console.error(`Error procesando SRI para factura ${idFacturaCreada}:`, err);
            });

            const facturaCompleta = await this._cargarFacturaCompleta(idFacturaCreada);

            if (!facturaCompleta.DetalleFactura || facturaCompleta.DetalleFactura.length === 0) {
                console.error('⚠️ WARNING: DetalleFactura no cargado en factura', idFacturaCreada);
            }

            return facturaCompleta;

        } catch (error) {
            if (!t.finished) {
                await t.rollback();
            }
            throw error;
        }
    }

    async _procesarSriAsync(idFactura) {
        try {
            const xml = await this.sriService.generarXmlFactura(idFactura);

            const config = await ConfiguracionSri.findOne({ where: { activo: true } });
            const xmlFirmado = await this.sriService.firmarXml(
                xml,
                config.certificado_path,
                config.certificado_password
            );

            const factura = await Factura.findByPk(idFactura);
            const nombreArchivo = `facturas/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${factura.secuencial}.xml`;

            const urlXml = await this.storageService.uploadFile(
                nombreArchivo,
                xmlFirmado,
                {
                    resource_type: 'raw',
                    folder: 'sig-kallari/facturas',
                    public_id: factura.secuencial,
                    tags: ['factura', 'xml', new Date().getFullYear().toString()]
                }
            );

            const estadoFirmado = await EstadoSri.findOne({ where: { codigo: 'SRI_FIRMADO' } });
            await factura.update({
                xml_firmado_url: urlXml,
                id_estado_sri: estadoFirmado.id_estado_sri
            });

            const respuesta = await this.sriService.enviarAlSri(xmlFirmado);

            if (respuesta.estado === 'RECIBIDA') {
                const estadoRecibida = await EstadoSri.findOne({ where: { codigo: 'SRI_RECIBIDA' } });
                await factura.update({
                    id_estado_sri: estadoRecibida.id_estado_sri,
                    xml_respuesta_sri: respuesta.mensaje
                });

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
    // ✅ HELPER ACTUALIZADO: CARGAR FACTURA COMPLETA CON IDENTIFICACIONES
    // ============================================
    async _cargarFacturaCompleta(idFactura) {
        const factura = await Factura.findByPk(idFactura, {
            include: [
                {
                    model: Cliente,
                    attributes: ['id_cliente', 'nombre', 'apellido', 'email', 'celular'],
                    // ✅ INCLUIR LAS IDENTIFICACIONES
                    include: [
                        {
                            model: ClienteIdentificacion,
                            include: [
                                {
                                    model: TipoIdentificacion,
                                    attributes: ['id_tipo_identificacion', 'tipo_identificacion', 'codigo']
                                }
                            ]
                        }
                    ]
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
                    attributes: ['id_metodo_pago', 'metodo_pago', 'codigo', 'codigo_sri']
                },
                {
                    model: ValorIva,
                    attributes: ['id_iva', 'porcentaje_iva', 'codigo', 'descripcion']
                },
                {
                    model: DetalleFactura,
                    as: 'DetalleFactura',
                    include: [
                        {
                            model: Producto,
                            attributes: ['id_producto', 'nombre', 'codigo_producto', 'precio']
                        },
                        {
                            model: ValorIva,
                            attributes: ['id_iva', 'porcentaje_iva', 'codigo', 'descripcion']
                        },
                        {
                            model: Descuento,
                            attributes: ['id_descuento', 'descuento', 'porcentaje_descuento'],
                            required: false
                        }
                    ]
                }
            ]
        });

        if (factura) {
            // ✅ Obtener identificación principal
            const identificacionPrincipal = factura.Cliente?.ClienteIdentificacions?.find(i => i.es_principal)
                || factura.Cliente?.ClienteIdentificacions?.[0];

            console.log('✅ Factura cargada:', {
                id: factura.id_factura,
                secuencial: factura.secuencial,
                detalles: factura.DetalleFactura?.length || 0,
                cliente: `${factura.Cliente?.nombre || ''} ${factura.Cliente?.apellido || ''}`.trim(),
                identificacion: identificacionPrincipal?.identificacion || 'N/A',
                tipoId: identificacionPrincipal?.TipoIdentificacion?.tipo_identificacion || 'N/A',
                iva: factura.ValorIva?.descripcion || `${factura.ValorIva?.porcentaje_iva}%` || 'N/A'
            });
        }

        return factura;
    }

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
    // ✅ HISTORIAL ACTUALIZADO CON IDENTIFICACIONES
    // ============================================
    async getSalesHistory(filtros = {}) {
        const { fecha_desde, fecha_hasta, id_vendedor, id_estado_sri, tipo_venta, limit = 50 } = filtros;

        const where = {};
        if (fecha_desde) where.fecha_emision = { [sequelize.Sequelize.Op.gte]: fecha_desde };
        if (fecha_hasta) where.fecha_emision = { ...where.fecha_emision, [sequelize.Sequelize.Op.lte]: fecha_hasta };
        if (id_vendedor) where.id_vendedor = id_vendedor;
        if (id_estado_sri) where.id_estado_sri = id_estado_sri;
        if (tipo_venta) where.tipo_venta = tipo_venta;

        return await Factura.findAll({
            where,
            include: [
                {
                    model: Cliente,
                    attributes: ['nombre', 'apellido'],
                    // ✅ INCLUIR IDENTIFICACIONES
                    include: [
                        {
                            model: ClienteIdentificacion,
                            include: [{ model: TipoIdentificacion }]
                        }
                    ]
                },
                { model: Usuario, as: 'Usuario', attributes: ['nombre', 'apellido'] },
                { model: EstadoSri, attributes: ['estado_sri', 'codigo'] },
                { model: MetodoPago, attributes: ['metodo_pago', 'codigo_sri'] }
            ],
            order: [['fecha_emision', 'DESC'], ['id_factura', 'DESC']],
            limit
        });
    }

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

    // ============================================
    // ✅ CUENTAS POR COBRAR ACTUALIZADO
    // ============================================
    async getCuentasPorCobrar(filtros = {}) {
        const { estado, id_cliente, vencidas, limit = 50 } = filtros;

        const where = {};
        if (estado) where.estado = estado;
        if (id_cliente) where.id_cliente = id_cliente;
        if (vencidas) {
            where.fecha_vencimiento = { [sequelize.Sequelize.Op.lt]: new Date() };
            where.estado = { [sequelize.Sequelize.Op.in]: ['PENDIENTE', 'PARCIAL', 'VENCIDA'] };
        }

        return await CuentaPorCobrar.findAll({
            where,
            include: [
                {
                    model: Cliente,
                    attributes: ['nombre', 'apellido', 'celular'],
                    // ✅ INCLUIR IDENTIFICACIONES
                    include: [
                        {
                            model: ClienteIdentificacion,
                            include: [{ model: TipoIdentificacion }]
                        }
                    ]
                },
                {
                    model: Factura,
                    attributes: ['secuencial', 'total', 'fecha_emision']
                }
            ],
            order: [['fecha_vencimiento', 'ASC']],
            limit
        });
    }

    async registrarPago(idCuentaCobrar, dataPago) {
        const t = await sequelize.transaction();

        try {
            const { id_metodo_pago, monto_pago, id_usuario_registro, referencia_pago, observaciones } = dataPago;

            const cuenta = await CuentaPorCobrar.findByPk(idCuentaCobrar, { transaction: t });
            if (!cuenta) {
                throw new Error('Cuenta por cobrar no encontrada');
            }

            if (cuenta.estado === 'PAGADA') {
                throw new Error('Esta cuenta ya está completamente pagada');
            }

            if (monto_pago <= 0) {
                throw new Error('El monto del pago debe ser mayor a cero');
            }

            if (monto_pago > cuenta.saldo_pendiente) {
                throw new Error(`El monto del pago (${monto_pago}) excede el saldo pendiente (${cuenta.saldo_pendiente})`);
            }

            await PagoCuentaCobrar.create({
                id_cuenta_cobrar: idCuentaCobrar,
                id_metodo_pago,
                id_usuario_registro,
                monto_pago,
                referencia_pago,
                observaciones
            }, { transaction: t });

            const nuevoMontoPagado = this._redondear(parseFloat(cuenta.monto_pagado) + monto_pago);
            const nuevoSaldoPendiente = this._redondear(parseFloat(cuenta.monto_total) - nuevoMontoPagado);

            await cuenta.update({
                monto_pagado: nuevoMontoPagado,
                saldo_pendiente: nuevoSaldoPendiente
            }, { transaction: t });

            await Factura.update(
                { saldo_pendiente: nuevoSaldoPendiente },
                { where: { id_factura: cuenta.id_factura }, transaction: t }
            );

            await t.commit();

            return await this.getCuentaPorCobrarDetalle(idCuentaCobrar);

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    // ============================================
    // ✅ DETALLE CUENTA POR COBRAR ACTUALIZADO
    // ============================================
    async getCuentaPorCobrarDetalle(idCuentaCobrar) {
        return await CuentaPorCobrar.findByPk(idCuentaCobrar, {
            include: [
                {
                    model: Cliente,
                    attributes: ['nombre', 'apellido', 'email', 'celular'],
                    // ✅ INCLUIR IDENTIFICACIONES
                    include: [
                        {
                            model: ClienteIdentificacion,
                            include: [{ model: TipoIdentificacion }]
                        }
                    ]
                },
                {
                    model: Factura,
                    attributes: ['secuencial', 'total', 'fecha_emision'],
                    include: [{
                        model: Usuario,
                        as: 'Usuario',
                        attributes: ['nombre', 'apellido']
                    }]
                },
                {
                    model: PagoCuentaCobrar,
                    include: [
                        {
                            model: MetodoPago,
                            attributes: ['metodo_pago', 'codigo_sri']
                        },
                        {
                            model: Usuario,
                            attributes: ['nombre', 'apellido']
                        }
                    ],
                    order: [['fecha_pago', 'DESC']]
                }
            ]
        });
    }

    async _verificarStockBajo(producto) {
        try {
            if (producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo) {
                const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);

                const notificacionExistente = await NotificacionesStock.findOne({
                    where: {
                        id_producto: producto.id_producto,
                        leido: false,
                        fecha_creacion: {
                            [Op.gte]: hace24Horas
                        },
                        mensaje: {
                            [Op.like]: '%Stock bajo%'
                        }
                    }
                });

                if (notificacionExistente) {
                    console.log(`ℹ️  Ya existe notificación reciente para: ${producto.nombre}`);
                    return;
                }

                await NotificacionesStock.create({
                    id_producto: producto.id_producto,
                    mensaje: `⚠️ Stock bajo: "${producto.nombre}" tiene solo ${producto.stock_actual} unidades (mínimo: ${producto.stock_minimo})`
                });

                console.log(`✅ Notificación de stock bajo creada para: ${producto.nombre}`);
            }
        } catch (error) {
            console.error('Error verificando stock bajo:', error);
        }
    }
}