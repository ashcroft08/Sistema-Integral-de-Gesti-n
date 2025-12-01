import { CategoryProductService } from '../services/category.service.js'

const categoryService = new CategoryProductService();

export class CategoryProductController {
    /**
     * Crear categoria
     */
    async createCategory(req, res) {
        try {
            // ✅ Los datos YA están validados por Zod middleware
            const categoryData = req.validatedData;

            const newCategory = await categoryService.createCategory(categoryData);

            res.status(201).json({
                success: true,
                message: 'Categoria del producto creado exitosamente.',
                categoria: newCategory
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtener todas las categorias
     */
    async getAllCategories(req, res) {
        try {
            const categorias = await categoryService.getAllCategories();

            res.status(200).json({
                success: true,
                categorias
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtener categoria por ID
     */
    async getCategoryById(req, res) {
        try {
            // ✅ El ID YA está validado por Zod middleware
            const { id } = req.validatedParams;

            const categoria = await categoryService.getCategoryById(id);

            res.status(200).json({
                success: true,
                categoria
            });

        } catch (error) {
            if (error.message === 'Categoria del producto no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Actualizar categoria
     */
    async updateCategory(req, res) {
        try {
            // ✅ Datos y parámetros YA validados por Zod
            const { id } = req.validatedParams;
            const updateData = req.validatedData;

            const updatedCategory = await categoryService.updateCategory(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Categoria del producto actualizado exitosamente.',
                categoria: updatedCategory
            });

        } catch (error) {
            if (error.message === 'Categoria del producto no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
         * Cambiar estado de categoría
         */
    async changeCategoryStatus(req, res) {
        try {
            const { id } = req.validatedParams;
            const { id_estado_categoria } = req.validatedData;

            const categoriaActualizada = await categoryService.changeCategoryStatus(id, id_estado_categoria);

            // ✨ Sequelize usa el nombre del modelo: EstadoCategoria
            const nombreEstado = categoriaActualizada.EstadoCategoria?.estado_categoria || 'nuevo estado';

            res.status(200).json({
                success: true,
                message: `Estado de la categoría actualizado a: ${nombreEstado}`,
                categoria: categoriaActualizada
            });

        } catch (error) {
            // ✅ Manejo específico de errores
            // Nota: Asegúrate que el mensaje del servicio coincida exactamente con este string
            if (error.message === 'Categoria del producto no encontrada.' || error.message === 'Categoria del producto no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            // ✨ CORRECCIÓN: Eliminado check de 'último administrador'
            if (error.message.includes('ID del estado')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al cambiar el estado de la categoría.'
            });
        }
    }

    /**
     * Cambiar estado de categoria a activo
     */
    async activateCategory(req, res) {
        try {
            const { id } = req.validatedParams;

            const categoria = await categoryService.activateCategory(id);

            res.status(200).json({
                success: true,
                message: 'Categoría del producto activada exitosamente.',
                categoria
            });

        } catch (error) {
            console.error('❌ Controlador - activateCategory Error:', error.message);

            if (error.message === 'Categoría del producto no encontrada.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al activar la categoría del producto.'
            });
        }
    }

    /**
     * Cambiar estado de categoria a inactivo
     */
    async desactivateCategory(req, res) {
        try {
            const { id } = req.validatedParams;

            const categoria = await categoryService.desactivateCategory(id);

            res.status(200).json({
                success: true,
                message: 'Categoría del producto desactivada exitosamente.',
                categoria
            });

        } catch (error) {
            console.error('❌ Controlador - desactivateCategory Error:', error.message);

            if (error.message === 'Categoría del producto no encontrada.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al desactivar la categoría del producto.'
            });
        }
    }
}