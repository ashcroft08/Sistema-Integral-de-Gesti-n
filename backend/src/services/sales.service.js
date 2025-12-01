import {
    Factura, DetalleFactura, Producto, MovimientoInventario,
    TipoMovimiento, EstadoSri, ValorIva, Descuento, Cliente, Usuario
} from '../models/index.js';

export class SalesService {

    /**
     * Genera el secuencial local (001-001-00000000X)
     * Busca la última factura y le suma 1.
     */
    async _generarSecuencial() {
        const ultimaFactura = await Factura.findOne({
            order: [['id_factura', 'DESC']],
            attributes: ['secuencial']
        });

        let secuencia = 1;
        if (ultimaFactura && ultimaFactura.secuencial) {
            const partes = ultimaFactura.secuencial.split('-'); // [001, 001, 000000005]
            secuencia = parseInt(partes[2]) + 1;
        }

        // Formato: Establ-PtoEmi-Secuencia (Ej: 001-001-000000006)
        return `001-001-${secuencia.toString().padStart(9, '0')}`;
    }

    /**
     * Crear Venta Completa
     * @param {Object} data - Datos validados desde el controller
     */
    async createSale(data) {
        const t = await sequelize.transaction(); // 🔒 INICIO TRANSACCIÓN

        try {
            const { id_cliente, id_vendedor, productos } = data;

            // 1. Validar Configuraciones Iniciales
            const estadoPendiente = await EstadoSri.findOne({ where: { codigo: 'SRI_PENDIENTE' } });
            const tipoMovVenta = await TipoMovimiento.findOne({ where: { tipo_movimiento: 'MOV_VENTA' } });

            if (!estadoPendiente || !tipoMovVenta) {
                throw new Error('Error de configuración: Faltan estados SRI o Tipos de Movimiento.');
            }

            // 2. Generar Secuencial
            const nuevoSecuencial = await this._generarSecuencial();

            // 3. Crear Cabecera (Factura) vacía temporalmente
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

            // Acumuladores globales
            let totalSubtotalSinIva = 0;
            let totalSubtotalConIva = 0;
            let totalDescuentos = 0;
            let totalPagarFinal = 0;

            // 4. Procesar Productos (Detalles)
            for (const item of productos) {
                // item = { id_producto, cantidad, id_valor_iva, id_descuento }

                // A. Buscar información en BD
                const productoDb = await Producto.findByPk(item.id_producto);
                if (!productoDb) throw new Error(`Producto ID ${item.id_producto} no encontrado.`);

                const ivaDb = await ValorIva.findByPk(item.id_valor_iva);
                if (!ivaDb) throw new Error(`IVA ID ${item.id_valor_iva} no válido.`);

                // B. Lógica de Descuento
                let porcentajeDesc = 0;
                let idDescuentoFinal = item.id_descuento || null;

                if (item.id_descuento) {
                    const descuentoDb = await Descuento.findByPk(item.id_descuento);

                    if (descuentoDb) {
                        porcentajeDesc = parseFloat(descuentoDb.porcentaje_descuento);
                    }
                }

                // C. Validar Stock
                if (productoDb.stock_actual < item.cantidad) {
                    throw new Error(`Stock insuficiente para "${productoDb.nombre}". Disponible: ${productoDb.stock_actual}`);
                }

                // D. CÁLCULOS MATEMÁTICOS
                const cantidad = parseInt(item.cantidad);
                const precio = parseFloat(productoDb.precio);

                // 1. Subtotal Bruto
                const subtotalBruto = precio * cantidad;

                // 2. Descuento en Dinero
                const valorDescuento = subtotalBruto * (porcentajeDesc / 100);

                // 3. Base Imponible (Precio - Descuento)
                const baseImponible = subtotalBruto - valorDescuento;

                // 4. Impuesto
                const porcentajeIva = parseFloat(ivaDb.porcentaje_iva);
                const valorIva = baseImponible * (porcentajeIva / 100);

                // 5. Total de la línea
                const totalLinea = baseImponible + valorIva;

                // E. Acumular a totales generales
                totalDescuentos += valorDescuento;
                totalPagarFinal += totalLinea;

                if (porcentajeIva > 0) {
                    totalSubtotalConIva += baseImponible;
                } else {
                    totalSubtotalSinIva += baseImponible;
                }

                // F. Guardar Detalle
                const detalleCreado = await DetalleFactura.create({
                    id_factura: nuevaFactura.id_factura,
                    id_producto: productoDb.id_producto,
                    id_valor_iva: ivaDb.id_iva,
                    id_descuento: idDescuentoFinal,
                    cantidad: cantidad,
                    precio_unitario: precio,
                    subtotal: baseImponible, // Guardamos la base imponible
                    porcentaje_descuento: porcentajeDesc,
                    valor_descuento: valorDescuento,
                    total: totalLinea
                }, { transaction: t });

                // G. MOVIMIENTO DE INVENTARIO
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

                // H. Actualizar Stock Producto
                await productoDb.update({ stock_actual: stockNuevo }, { transaction: t });
            }

            // 5. Actualizar Totales Finales en Factura
            await nuevaFactura.update({
                subtotal_sin_iva: totalSubtotalSinIva,
                subtotal_con_iva: totalSubtotalConIva,
                total_descuento: totalDescuentos,
                total: totalPagarFinal
            }, { transaction: t });

            await t.commit(); // ÉXITO: Guardar todo

            // 6. Retornar Factura Completa (para imprimir o mostrar)
            return await Factura.findByPk(nuevaFactura.id_factura, {
                include: [
                    { model: Cliente },
                    { model: EstadoSri },
                    {
                        model: DetalleFactura,
                        include: [Producto, ValorIva, Descuento]
                    }
                ]
            });

        } catch (error) {
            await t.rollback(); // ERROR: Deshacer todo
            throw error;
        }
    }

    /**
     * Obtener catálogos para el formulario de ventas
     */
    async getSalesCatalogs() {
        const descuentos = await Descuento.findAll({ where: { activo: true } });
        const impuestos = await ValorIva.findAll();
        return { descuentos, impuestos };
    }
}