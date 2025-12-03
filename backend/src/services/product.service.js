import { Producto, EstadoProducto, CategoriaProducto, MovimientoInventario, TipoMovimiento, NotificacionesStock } from '../models/index.js';
import { Op } from 'sequelize';
import { ESTADOS_PRODUCTO } from '../constants/codigos.js';

export class ProductService {

    // Helper para buscar ID de estado por código
    async _getEstadoIdByCode(codigo) {
        const estado = await EstadoProducto.findOne({ where: { codigo } });
        if (!estado) throw new Error(`Error de integridad: El estado ${codigo} no existe en la BD.`);
        return estado.id_estado_producto;
    }

    // Helper para buscar ID de tipo movimiento
    async _getTipoMovimientoId(codigo) {
        const tipo = await TipoMovimiento.findOne({ where: { tipo_movimiento: codigo } });
        return tipo ? tipo.id_tipo_movimiento : null;
    }

    async createProduct(productData) {
        const t = await Producto.sequelize.transaction();
        try {
            const { nombre, id_categoria, stock_actual, codigo_producto } = productData; // Extraer codigo_producto
            // 1. Verificar duplicados por nombre
            const productExistsByName = await Producto.findOne({
                where: { nombre: { [Op.iLike]: nombre } }
            });
            if (productExistsByName) throw new Error('El producto ya está registrado.');

            // 1.1. Verificar duplicados por código de producto (si se proporciona)
            if (codigo_producto) {
                const productExistsByCode = await Producto.findOne({
                    where: { codigo_producto: codigo_producto }
                });
                if (productExistsByCode) throw new Error('Ya existe un producto con este código de barras.');
            }

            // 2. Validar Categoría
            const category = await CategoriaProducto.findByPk(id_categoria);
            if (!category) throw new Error('La categoría seleccionada no existe.');

            // 3. Asignar estado por defecto (SIEMPRE ACTIVO)
            const estadoActivoId = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.ACTIVO);
            const newProduct = await Producto.create({
                ...productData, // Incluye codigo_producto si está presente
                id_estado_producto: estadoActivoId
            }, { transaction: t });

            // 4. Registrar Stock Inicial (HISTORIAL)
            const idMovInicial = await this._getTipoMovimientoId('MOV_INICIAL');
            if (idMovInicial) {
                await MovimientoInventario.create({
                    id_producto: newProduct.id_producto,
                    id_tipo_movimiento: idMovInicial,
                    cantidad: stock_actual,
                    stock_anterior: 0,
                    stock_nuevo: stock_actual,
                    fecha_movimiento: new Date()
                }, { transaction: t });
            }

            // 5. Notificación si nace sin stock
            if (stock_actual === 0) {
                await NotificacionesStock.create({
                    id_producto: newProduct.id_producto,
                    mensaje: `Producto creado sin stock inicial: ${nombre}`
                }, { transaction: t });
            }

            await t.commit();
            return newProduct;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async updateProduct(productId, updateData) {
        const t = await Producto.sequelize.transaction();
        try {
            const { nombre, stock_actual, codigo_producto } = updateData; // Extraer codigo_producto
            // 1. Obtener producto original
            const producto = await Producto.findByPk(productId, {
                include: [{ model: EstadoProducto }]
            });
            if (!producto) throw new Error('Producto no encontrado.');

            // REGLA: No editar descontinuados
            const idDescontinuado = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.DESCONTINUADO);
            if (producto.id_estado_producto === idDescontinuado) {
                throw new Error('No se pueden modificar productos descontinuados. Primero debe reactivarlos.');
            }

            // Validar nombre único (si cambia)
            if (nombre && nombre !== producto.nombre) {
                const productExists = await Producto.findOne({
                    where: {
                        nombre: { [Op.iLike]: nombre },
                        id_producto: { [Op.ne]: productId }
                    }
                });
                if (productExists) throw new Error('Ya existe otro producto con ese nombre.');
            }

            // Validar código único (si cambia)
            if (codigo_producto && codigo_producto !== producto.codigo_producto) {
                const productExistsByCode = await Producto.findOne({
                    where: {
                        codigo_producto: codigo_producto,
                        id_producto: { [Op.ne]: productId }
                    }
                });
                if (productExistsByCode) throw new Error('Ya existe un producto con este código de barras.');
            }


            // ... resto de la lógica de actualización (stock, movimientos, etc.) ...
            if (stock_actual !== undefined && stock_actual !== producto.stock_actual) {
                const stockAnterior = producto.stock_actual;
                const diferencia = stock_actual - stockAnterior;
                const idMovAjuste = await this._getTipoMovimientoId('MOV_AJUSTE');
                await MovimientoInventario.create({
                    id_producto: producto.id_producto,
                    id_tipo_movimiento: idMovAjuste,
                    cantidad: Math.abs(diferencia),
                    stock_anterior: stockAnterior,
                    stock_nuevo: stock_actual,
                    fecha_movimiento: new Date()
                }, { transaction: t });

                if (stock_actual === 0) {
                    await NotificacionesStock.create({
                        id_producto: producto.id_producto,
                        mensaje: `ALERTA: El producto "${producto.nombre}" se ha agotado.`
                    }, { transaction: t });
                }
            }

            await producto.update(updateData, { transaction: t });

            await t.commit();
            await producto.reload({
                include: [
                    { model: CategoriaProducto, attributes: ['categoria'] },
                    { model: EstadoProducto, attributes: ['estado_producto', 'codigo'] }
                ]
            });
            return producto;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async getAllProducts() {
        try {
            return await Producto.findAll({
                include: [
                    { model: CategoriaProducto, attributes: ['id_categoria', 'categoria'] },
                    { model: EstadoProducto, attributes: ['id_estado_producto', 'estado_producto', 'codigo'] }
                ],
                order: [['nombre', 'ASC']]
            });
        } catch (error) {
            throw error;
        }
    }

    async getProductById(productId) {
        try {
            const product = await Producto.findByPk(productId, {
                include: [
                    { model: CategoriaProducto, attributes: ['categoria'] },
                    { model: EstadoProducto, attributes: ['estado_producto', 'codigo'] }
                ]
            });
            if (!product) throw new Error('Producto no encontrado.');
            return product;
        } catch (error) {
            throw error;
        }
    }

    async discontinueProduct(productId) {
        try {
            const producto = await Producto.findByPk(productId, {
                include: [{ model: EstadoProducto, attributes: ['codigo'] }]
            });

            if (!producto) throw new Error('Producto no encontrado.');

            const idDescontinuado = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.DESCONTINUADO);

            // Validar usando el ID actual del producto
            if (producto.id_estado_producto === idDescontinuado) {
                throw new Error('El producto ya está descontinuado.');
            }

            await producto.update({ id_estado_producto: idDescontinuado });

            await producto.reload({
                include: [{ model: EstadoProducto, attributes: ['estado_producto', 'codigo'] }]
            });

            return producto;
        } catch (error) {
            throw error;
        }
    }

    async reactivateDiscontinuedProduct(productId) {
        try {
            const producto = await Producto.findByPk(productId);
            if (!producto) throw new Error('Producto no encontrado.');

            const idDescontinuado = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.DESCONTINUADO);

            // Validar que esté descontinuado
            if (producto.id_estado_producto !== idDescontinuado) {
                throw new Error('Solo se pueden reactivar productos descontinuados.');
            }

            // 🐛 CORRECCIÓN 2: Siempre reactivar a ACTIVO. 
            // Eliminamos la lógica de buscar "AGOTADO" porque ya no existe en BD.
            const nuevoEstadoId = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.ACTIVO);

            await producto.update({ id_estado_producto: nuevoEstadoId });

            await producto.reload({
                include: [{ model: EstadoProducto, attributes: ['estado_producto', 'codigo'] }]
            });

            return producto;
        } catch (error) {
            throw error;
        }
    }

    async changeProductStatus(productId, nuevoEstadoId) {
        try {
            const producto = await Producto.findByPk(productId, {
                include: [{ model: EstadoProducto }]
            });
            if (!producto) throw new Error('Producto no encontrado.');

            const idDescontinuado = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.DESCONTINUADO);

            // Regla: No usar este método para descontinuar
            if (nuevoEstadoId === idDescontinuado || producto.id_estado_producto === idDescontinuado) {
                throw new Error('Los productos descontinuados requieren un proceso especial. Contacte al administrador.');
            }

            // 🐛 CORRECCIÓN 3: Eliminado el bloqueo de "Si stock es 0 no activar".
            // Permitimos activar con stock 0 (el sistema lo mostrará como Agotado).

            await producto.update({ id_estado_producto: nuevoEstadoId });

            await producto.reload({
                include: [{ model: EstadoProducto, attributes: ['estado_producto', 'codigo'] }]
            });

            return producto;
        } catch (error) {
            throw error;
        }
    }

    async getProductStatuses() {
        try {
            return await EstadoProducto.findAll({
                attributes: ['id_estado_producto', 'estado_producto', 'codigo']
            });
        } catch (error) {
            throw error;
        }
    }

    // Método específico para Reabastecimiento (Compras)
    async addStock(productId, cantidadAgregar) {
        const t = await Producto.sequelize.transaction();
        try {
            // Validar que la cantidad sea positiva
            const cantidad = Number(cantidadAgregar);
            if (isNaN(cantidad) || cantidad <= 0) {
                throw new Error('La cantidad a agregar debe ser mayor a 0.');
            }

            const producto = await Producto.findByPk(productId);
            if (!producto) throw new Error('Producto no encontrado.');

            // Validar descontinuado
            const idDescontinuado = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.DESCONTINUADO);
            if (producto.id_estado_producto === idDescontinuado) {
                throw new Error('No se puede agregar stock a un producto descontinuado.');
            }

            const stockAnterior = producto.stock_actual;
            const nuevoStock = stockAnterior + cantidad;

            // 1. Registrar el Movimiento como COMPRA
            const idMovCompra = await this._getTipoMovimientoId('MOV_COMPRA');

            await MovimientoInventario.create({
                id_producto: producto.id_producto,
                id_tipo_movimiento: idMovCompra,
                cantidad: cantidad,       // Cuánto entró
                stock_anterior: stockAnterior,
                stock_nuevo: nuevoStock,
                fecha_movimiento: new Date()
            }, { transaction: t });

            // 2. Actualizar el producto
            // Si estaba con stock 0 (virtualmente agotado), esto lo "revive" automáticamente
            await producto.update({ stock_actual: nuevoStock }, { transaction: t });

            await t.commit();

            // Recargar para devolver actualizado
            await producto.reload();
            return producto;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}