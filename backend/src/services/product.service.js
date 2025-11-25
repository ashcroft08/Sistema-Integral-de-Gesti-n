import { Producto, EstadoProducto, CategoriaProducto } from '../models/index.js';
import { Op } from 'sequelize';
import { ESTADOS_PRODUCTO } from '../constants/codigos.js'; // ✨ Constantes

export class ProductService {

    // ✨ HELPER: Obtener ID dinámicamente por código
    async _getEstadoIdByCode(codigo) {
        const estado = await EstadoProducto.findOne({ where: { codigo } });
        if (!estado) throw new Error(`Error de integridad: El estado ${codigo} no existe en la BD.`);
        return estado.id_estado_producto;
    }

    async createProduct(productData) {
        try {
            const { nombre, id_categoria, stock_actual } = productData;

            // 1. Verificar duplicados (excluyendo case sensitivity)
            const productExists = await Producto.findOne({
                where: { nombre: { [Op.iLike]: nombre } }
            });
            if (productExists) throw new Error('El producto ya está registrado.');

            // 2. Validar Categoría
            const category = await CategoriaProducto.findByPk(id_categoria);
            if (!category) throw new Error('La categoría seleccionada no existe.');

            // LÓGICA DE ESTADO AUTOMÁTICA AL CREAR
            let codigoEstadoInicial = ESTADOS_PRODUCTO.ACTIVO;
            if (stock_actual === 0) {
                codigoEstadoInicial = ESTADOS_PRODUCTO.AGOTADO;
            }

            // 3. Asignar estado por defecto (ACTIVO)
            const estadoId = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.ACTIVO);

            const newProduct = await Producto.create({
                ...productData,
                id_estado_producto: estadoId
            });

            return newProduct;
        } catch (error) {
            throw error;
        }
    }

    async getAllProducts() {
        try {
            const products = await Producto.findAll({
                include: [
                    {
                        model: CategoriaProducto,
                        attributes: ['id_categoria', 'categoria']
                    },
                    {
                        model: EstadoProducto,
                        attributes: ['id_estado_producto', 'estado_producto', 'codigo'] // ✨ Traemos código
                    }
                ],
                order: [['nombre', 'ASC']]
            });
            return products;
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

    async updateProduct(productId, updateData) {
        try {
            const { nombre, stock_actual } = updateData;
            const producto = await Producto.findByPk(productId, {
                include: [{ model: EstadoProducto }]
            });
            if (!producto) throw new Error('Producto no encontrado.');

            // 🚫 REGLA: No permitir editar productos descontinuados (excepto reactivación)
            const idDescontinuado = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.DESCONTINUADO);
            if (producto.id_estado_producto === idDescontinuado) {
                throw new Error('No se pueden modificar productos descontinuados. Primero debe reactivarlos.');
            }

            // Validar nombre único
            if (nombre && nombre !== producto.nombre) {
                const productExists = await Producto.findOne({
                    where: {
                        nombre: { [Op.iLike]: nombre },
                        id_producto: { [Op.ne]: productId }
                    }
                });
                if (productExists) throw new Error('Ya existe otro producto con ese nombre.');
            }

            // Lógica de cambio automático de estado por stock
            if (stock_actual !== undefined) {
                const idAgotado = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.AGOTADO);
                const idActivo = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.ACTIVO);

                if (stock_actual === 0 && producto.id_estado_producto !== idDescontinuado) {
                    updateData.id_estado_producto = idAgotado;
                } else if (stock_actual > 0 && producto.id_estado_producto === idAgotado) {
                    updateData.id_estado_producto = idActivo;
                }
            }

            await producto.update(updateData);

            await producto.reload({
                include: [
                    { model: CategoriaProducto, attributes: ['categoria'] },
                    { model: EstadoProducto, attributes: ['estado_producto', 'codigo'] }
                ]
            });

            return producto;
        } catch (error) {
            throw error;
        }
    }

    async discontinueProduct(productId) {
        try {
            const producto = await Producto.findByPk(productId, {
                include: [{ model: EstadoProducto, attributes: ['estado_producto', 'codigo'] }]
            });

            if (!producto) throw new Error('Producto no encontrado.');

            // Validar que no esté ya descontinuado
            const idDescontinuado = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.DESCONTINUADO);
            if (producto.id_estado_producto === idDescontinuado) {
                throw new Error('El producto ya está descontinuado.');
            }

            // Cambiar a estado Descontinuado
            await producto.update({ id_estado_producto: idDescontinuado });

            await producto.reload({
                include: [{ model: EstadoProducto, attributes: ['estado_producto', 'codigo'] }]
            });

            return producto;
        } catch (error) {
            throw error;
        }
    }

    // Método para reactivar un producto descontinuado
    async reactivateDiscontinuedProduct(productId) {
        try {
            const producto = await Producto.findByPk(productId);
            if (!producto) throw new Error('Producto no encontrado.');

            const estadoActual = await EstadoProducto.findByPk(producto.id_estado_producto);

            // Validar que esté descontinuado
            if (estadoActual.codigo !== ESTADOS_PRODUCTO.DESCONTINUADO) {
                throw new Error('Solo se pueden reactivar productos descontinuados.');
            }

            // Determinar el nuevo estado según el stock
            let nuevoEstadoId;
            if (producto.stock_actual === 0) {
                nuevoEstadoId = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.AGOTADO);
            } else {
                nuevoEstadoId = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.ACTIVO);
            }

            await producto.update({ id_estado_producto: nuevoEstadoId });

            await producto.reload({
                include: [{ model: EstadoProducto, attributes: ['estado_producto', 'codigo'] }]
            });

            return producto;
        } catch (error) {
            throw error;
        }
    }

    // Cambio de estado dinámico
    async changeProductStatus(productId, nuevoEstadoId) {
        try {
            const producto = await Producto.findByPk(productId, {
                include: [{ model: EstadoProducto }]
            });
            if (!producto) throw new Error('Producto no encontrado.');

            const nuevoEstado = await EstadoProducto.findByPk(nuevoEstadoId);
            if (!nuevoEstado) throw new Error('ID de estado no válido.');

            const idActivo = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.ACTIVO);
            const idDescontinuado = await this._getEstadoIdByCode(ESTADOS_PRODUCTO.DESCONTINUADO);

            // 🚫 REGLA 1: No permitir activar si stock es 0
            if (nuevoEstadoId === idActivo && producto.stock_actual === 0) {
                throw new Error('No se puede activar un producto con stock 0. Actualice el stock primero.');
            }

            // 🚫 REGLA 2: No permitir cambios manuales desde/hacia Descontinuado
            // (Debe usar los endpoints específicos discontinueProduct/reactivateDiscontinuedProduct)
            if (nuevoEstadoId === idDescontinuado || producto.id_estado_producto === idDescontinuado) {
                throw new Error('Los productos descontinuados requieren un proceso especial. Contacte al administrador.');
            }

            await producto.update({ id_estado_producto: nuevoEstadoId });

            await producto.reload({
                include: [{ model: EstadoProducto, attributes: ['estado_producto', 'codigo'] }]
            });

            return producto;
        } catch (error) {
            throw error;
        }
    }

    //Obtener los estados del producto
    async getProductStatuses() {
        try {
            const estados = await EstadoProducto.findAll({
                attributes: ['id_estado_producto', 'estado_producto', 'codigo']
            });
            return estados;
        } catch (error) {
            throw error;
        }
    }
}