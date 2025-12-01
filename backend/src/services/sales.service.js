import { sequelize } from '../config/db.js'; // Tu instancia sequelize
import { Factura, DetalleFactura, Producto, MovimientoInventario, TipoMovimiento, EstadoSri, ValorIva } from '../models/index.js';

export class SalesService {

    async createSale(saleData) {
        const t = await sequelize.transaction(); // Inicia transacción

        try {
            const { id_cliente, id_vendedor, productos } = saleData; // productos es un array [{id_producto, cantidad, id_valor_iva...}]

            // 1. Obtener estado "Pendiente"
            const estadoPendiente = await EstadoSri.findOne({ where: { codigo: 'SRI_PENDIENTE' } });

            // 2. Variables para acumular totales
            let subtotalSinIva = 0;
            let subtotalConIva = 0;
            let totalDescuento = 0;
            let totalImpuesto = 0;

            // 3. Validar Stock y Calcular Pre-Factura (Antes de guardar nada)
            // Es mejor iterar primero para asegurar que hay stock de TODO
            for (const item of productos) {
                const productoDb = await Producto.findByPk(item.id_producto);

                if (!productoDb) throw new Error(`Producto ID ${item.id_producto} no encontrado`);
                if (productoDb.stock_actual < item.cantidad) {
                    throw new Error(`Stock insuficiente para ${productoDb.nombre}. Disponible: ${productoDb.stock_actual}`);
                }
            }

            // 4. Crear Cabecera de Factura (Inicial)
            const nuevaFactura = await Factura.create({
                id_cliente,
                id_vendedor,
                id_estado_sri: estadoPendiente.id_estado_sri,
                fecha_emision: new Date(),
                // Secuencial y claves SRI se quedan en NULL por ahora
                total_descuento: 0,
                subtotal_sin_iva: 0,
                subtotal_con_iva: 0,
                total: 0
            }, { transaction: t });

            const idMovVenta = await TipoMovimiento.findOne({ where: { tipo_movimiento: 'MOV_VENTA' } });

            // 5. Procesar Detalles y Actualizar Stock
            for (const item of productos) {
                const productoDb = await Producto.findByPk(item.id_producto);
                const ivaDb = await ValorIva.findByPk(item.id_valor_iva);

                // Cálculos matemáticos
                const precio = parseFloat(productoDb.precio);
                const cantidad = parseInt(item.cantidad);
                const subtotalItem = precio * cantidad;

                // Lógica de IVA (Simplificada)
                const tieneIva = ivaDb.porcentaje_iva > 0;
                let valorIvaItem = 0;

                if (tieneIva) {
                    subtotalConIva += subtotalItem;
                    valorIvaItem = subtotalItem * (ivaDb.porcentaje_iva / 100);
                    totalImpuesto += valorIvaItem;
                } else {
                    subtotalSinIva += subtotalItem;
                }

                // Guardar Detalle
                await DetalleFactura.create({
                    id_factura: nuevaFactura.id_factura,
                    id_producto: item.id_producto,
                    id_valor_iva: item.id_valor_iva,
                    cantidad: cantidad,
                    precio_unitario: precio,
                    subtotal: subtotalItem,
                    total: subtotalItem + valorIvaItem,
                    porcentaje_descuento: 0,
                    valor_descuento: 0
                }, { transaction: t });

                // 6. Restar Inventario (MOV_VENTA)
                const stockAnterior = productoDb.stock_actual;
                const stockNuevo = stockAnterior - cantidad;

                await MovimientoInventario.create({
                    id_producto: productoDb.id_producto,
                    id_tipo_movimiento: idMovVenta.id_tipo_movimiento,
                    cantidad: cantidad,
                    stock_anterior: stockAnterior,
                    stock_nuevo: stockNuevo,
                    fecha_movimiento: new Date(),
                    // id_detalle_factura: ... (si tienes la relación)
                }, { transaction: t });

                // Actualizar producto
                await productoDb.update({ stock_actual: stockNuevo }, { transaction: t });
            }

            // 7. Actualizar Totales en Cabecera
            await nuevaFactura.update({
                subtotal_sin_iva: subtotalSinIva,
                subtotal_con_iva: subtotalConIva,
                total: subtotalSinIva + subtotalConIva + totalImpuesto
            }, { transaction: t });

            await t.commit();
            return nuevaFactura;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}