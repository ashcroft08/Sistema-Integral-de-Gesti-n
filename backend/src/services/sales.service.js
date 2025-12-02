import {
    Factura, DetalleFactura, Producto, MovimientoInventario,
    TipoMovimiento, EstadoSri, ValorIva, Descuento, Cliente, Usuario
} from '../models/index.js';
import db from '../database/database.js';

const { sequelize } = db;

export class SalesService {

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

    async createSale(data) {
        const t = await sequelize.transaction();

        try {
            const { id_cliente, id_vendedor, productos } = data;

            // Validaciones
            const clienteExiste = await Cliente.findByPk(id_cliente, { transaction: t });
            if (!clienteExiste) {
                throw new Error('Cliente no encontrado.');
            }

            if (!productos || productos.length === 0) {
                throw new Error('Debe incluir al menos un producto en la venta.');
            }

            // Configuraciones
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

            // Generar secuencial
            const nuevoSecuencial = await this._generarSecuencial(t);

            // Crear factura
            const nuevaFactura = await Factura.create({
                id_cliente,
                id_vendedor,
                id_estado_sri: estadoPendiente.id_estado_sri,
                secuencial: nuevoSecuencial,
                fecha_emision: new Date(),
                total_descuento: 0,
                subtotal_sin_iva: 0,
                subtotal_con_iva: 0,
                total: 0
            }, { transaction: t });

            let totalSubtotalSinIva = 0;
            let totalSubtotalConIva = 0;
            let totalDescuentos = 0;
            let totalPagarFinal = 0;

            // Procesar productos
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

                // Cálculos
                const cantidad = parseInt(item.cantidad);
                const precio = parseFloat(productoDb.precio);
                const subtotalBruto = this._redondear(precio * cantidad);
                const valorDescuento = this._redondear(subtotalBruto * (porcentajeDesc / 100));
                const baseImponible = this._redondear(subtotalBruto - valorDescuento);
                const porcentajeIva = parseFloat(ivaDb.porcentaje_iva);
                const valorIva = this._redondear(baseImponible * (porcentajeIva / 100));
                const totalLinea = this._redondear(baseImponible + valorIva);

                totalDescuentos = this._redondear(totalDescuentos + valorDescuento);
                totalPagarFinal = this._redondear(totalPagarFinal + totalLinea);

                if (porcentajeIva > 0) {
                    totalSubtotalConIva = this._redondear(totalSubtotalConIva + baseImponible);
                } else {
                    totalSubtotalSinIva = this._redondear(totalSubtotalSinIva + baseImponible);
                }

                // Guardar detalle
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

                // Movimiento inventario
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

            // Actualizar totales
            await nuevaFactura.update({
                subtotal_sin_iva: totalSubtotalSinIva,
                subtotal_con_iva: totalSubtotalConIva,
                total_descuento: totalDescuentos,
                total: totalPagarFinal
            }, { transaction: t });

            // ✅ GUARDAR ID ANTES DEL COMMIT
            const idFacturaCreada = nuevaFactura.id_factura;

            await t.commit();

            // ✅ CARGAR FACTURA DESPUÉS DEL COMMIT (SIN TRANSACCIÓN)
            return await Factura.findByPk(idFacturaCreada, {
                include: [
                    {
                        model: Cliente,
                        attributes: ['id_cliente', 'nombre', 'identificacion', 'email']
                    },
                    {
                        model: Usuario,
                        as: 'Usuario', // ✅ USA EL ALIAS CORRECTO SEGÚN TU ASOCIACIÓN
                        attributes: ['id_usuario', 'nombre', 'apellido', 'email']
                    },
                    {
                        model: EstadoSri,
                        attributes: ['id_estado_sri', 'codigo', 'estado_sri'] // ✅ CORREGIDO
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
                                attributes: ['id_iva', 'porcentaje_iva']
                            },
                            {
                                model: Descuento,
                                attributes: ['id_descuento', 'descuento', 'porcentaje_descuento']
                            }
                        ]
                    }
                ]
            });

        } catch (error) {
            // ✅ SOLO HACER ROLLBACK SI LA TRANSACCIÓN NO ESTÁ FINALIZADA
            if (!t.finished) {
                await t.rollback();
            }
            throw error;
        }
    }

    async getSalesCatalogs() {
        const descuentos = await Descuento.findAll({
            where: { activo: true },
            order: [['porcentaje_descuento', 'DESC']]
        });
        const impuestos = await ValorIva.findAll({
            order: [['porcentaje_iva', 'ASC']]
        });

        return { descuentos, impuestos };
    }

    async getSalesHistory(filtros = {}) {
        const { fecha_desde, fecha_hasta, id_vendedor, limit = 50 } = filtros;

        const where = {};
        if (fecha_desde) where.fecha_emision = { [sequelize.Sequelize.Op.gte]: fecha_desde };
        if (fecha_hasta) where.fecha_emision = { ...where.fecha_emision, [sequelize.Sequelize.Op.lte]: fecha_hasta };
        if (id_vendedor) where.id_vendedor = id_vendedor;

        return await Factura.findAll({
            where,
            include: [
                { model: Cliente, attributes: ['nombre', 'identificacion'] },
                { model: Usuario, as: 'Usuario', attributes: ['nombre', 'apellido'] },
                { model: EstadoSri }
            ],
            order: [['fecha_emision', 'DESC']],
            limit
        });
    }
}