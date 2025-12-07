import { CategoriaProducto, EstadoCategoria, Producto } from '../models/index.js'
import { Op } from 'sequelize'
import { ESTADOS_CATEGORIA } from '../constants/codigos.js';

export class CategoryProductService {
    // ✨ HELPER: Obtener ID dinámicamente por código
    async _getEstadoIdByCode(codigo) {
        const estado = await EstadoCategoria.findOne({ where: { codigo } });
        if (!estado) throw new Error(`Error de integridad: El estado ${codigo} no existe en la BD.`);
        return estado.id_estado_categoria;
    }

    /**
     * Crear una nueva categoria
     */
    async createCategory(categoryData) {
        try {
            const { categoria } = categoryData;

            // 1. Verificar duplicados (Case Insensitive)
            const categoryExists = await CategoriaProducto.findOne({
                where: { categoria: { [Op.iLike]: categoria } }
            });
            if (categoryExists) throw new Error('La categoría ya está registrada.');

            // ✨ 2. Asignar estado por defecto (ACTIVA) buscando su ID real
            // Si el frontend no manda estado, usamos el ID de 'CAT_ACTIVA'
            let estadoId = categoryData.id_estado_categoria;
            if (!estadoId) {
                estadoId = await this._getEstadoIdByCode(ESTADOS_CATEGORIA.ACTIVA);
            }

            const newCategory = await CategoriaProducto.create({
                ...categoryData,
                id_estado_categoria: estadoId
            });

            return newCategory;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene todas las categorías con el número de productos asociados
     */
    async getAllCategories() {
        try {
            const categories = await CategoriaProducto.findAll({
                include: [
                    {
                        model: EstadoCategoria,
                        as: 'EstadoCategoria',
                        attributes: ['id_estado_categoria', 'estado_categoria', 'codigo']
                    }
                ],
                attributes: {
                    include: [
                        [
                            CategoriaProducto.sequelize.literal(`(
                                SELECT COUNT(*) 
                                FROM inventario.producto 
                                WHERE producto.id_categoria = "CategoriaProducto"."id_categoria"
                            )`),
                            'numero_productos'
                        ]
                    ]
                },
                order: [['id_categoria', 'ASC']]
            });
            return categories;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene categoria por ID
     */
    async getCategoryById(categoryId) {
        try {
            const category = await CategoriaProducto.findByPk(categoryId, {
                include: [{
                    model: EstadoCategoria,
                    as: 'EstadoCategoria',
                    attributes: ['estado_categoria']
                }]
            });

            if (!category) {
                throw new Error('Categoria del producto no encontrado.');
            }
            return category;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualiza una categoria
     */
    async updateCategory(categoryId, updateData) {
        try {
            const { categoria } = updateData;

            // ✅ Encontrar categoria
            const categoriaProducto = await CategoriaProducto.findByPk(categoryId);
            if (!categoriaProducto) {
                throw new Error('Categoria del producto no encontrada.');
            }

            // Si se está actualizando el nombre, verificar que no exista otra con el mismo nombre
            if (categoria && categoria !== categoriaProducto.categoria) {
                const categoryExists = await CategoriaProducto.findOne({
                    where: {
                        categoria: {
                            [Op.iLike]: categoria
                        },
                        id_categoria: {
                            [Op.ne]: categoryId // Excluir la categoría actual
                        }
                    }
                });

                if (categoryExists) {
                    throw new Error('Ya existe otra categoria con ese nombre.');
                }
            }

            // ✅ Actualizar categoria
            await categoriaProducto.update(updateData);

            // ✅ Recargar con relaciones
            await categoriaProducto.reload({
                include: [{ model: EstadoCategoria, as: 'EstadoCategoria', attributes: ['estado_categoria'] }]
            });

            // 3. Retornamos los datos creados
            return categoriaProducto;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cambiar estado de una categoria
     */
    async changeCategoryStatus(categoryId, nuevoEstadoId) {
        try {
            const categoria = await CategoriaProducto.findByPk(categoryId);
            if (!categoria) throw new Error('Categoría no encontrada.');

            const estadoCategoria = await EstadoCategoria.findByPk(nuevoEstadoId);

            if (!estadoCategoria) throw new Error('El ID del estado proporcionado no es válido.');

            // ✅ Actualizar estado
            await categoria.update({ id_estado_categoria: nuevoEstadoId });

            await categoria.reload({
                include: [{
                    model: EstadoCategoria,
                    as: 'EstadoCategoria',
                    attributes: ['estado_categoria', 'codigo']
                }]
            });

            return categoria;

        } catch (error) {
            console.error('❌ Servicio - Error:', error.message);
            throw error;
        }
    }

    // Métodos helper para los endpoints específicos (activate/deactivate)
    // Ahora buscan el ID dinámicamente
    async activateCategory(categoryId) {
        const idActivo = await this._getEstadoIdByCode(ESTADOS_CATEGORIA.ACTIVA);
        return this.changeCategoryStatus(categoryId, idActivo);
    }

    async desactivateCategory(categoryId) {
        const idInactivo = await this._getEstadoIdByCode(ESTADOS_CATEGORIA.INACTIVA);
        return this.changeCategoryStatus(categoryId, idInactivo);
    }
}