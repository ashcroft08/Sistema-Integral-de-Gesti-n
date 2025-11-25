import { success } from 'zod';
import { ProductService } from '../services/product.service.js'
import { fa, tr } from 'zod/v4/locales';

const productService = new ProductService();

export class ProductController {
    /**
     * Crear producto
     */
    async createProduct(req, res) {
        try {
            // ✅ Los datos YA están validados por Zod middleware
            const productData = req.validatedData;

            const newProduct = await productService.createProduct(productData);

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente.',
                producto: newProduct
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtener todos los productos
     */
    async getAllProducts(req, res) {
        try {
            const productos = await productService.getAllProducts();

            res.status(200).json({
                success: true,
                productos
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Obtener productos por ID
     */
    async getProductById(req, res) {
        try {
            // ✅ El ID YA está validado por Zod middleware
            const { id } = req.validatedParams;

            const productos = await productService.getProductById(id);

            res.status(200).json({
                success: true,
                productos
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Actualizar productos
     */
    async updateProduct(req, res) {
        try {
            // ✅ Datos y parámetros YA validados por Zod
            const { id } = req.validatedParams;
            const updateData = req.validatedData;

            const updateProduct = await productService.updateProduct(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Producto actualizado exitosamente',
                producto: updateProduct
            })
        } catch (error) {
            if (error.message === 'Producto no encontrado.') {
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
     * Cambiar estado del producto
     */
    async changeProductStatus(req, res) {
        try {
            const { id } = req.validatedParams;
            const { id_estado_producto } = req.validatedData;

            const productoActualizado = await productService.changeProductStatus(id, id_estado_producto);

            // ✨ Sequelize usa PascalCase por defecto: EstadoProducto
            const nombreEstado = productoActualizado.EstadoProducto?.estado_producto || 'nuevo estado';

            res.status(200).json({
                success: true,
                message: `Estado del producto actualizado a: ${nombreEstado}`,
                producto: productoActualizado
            });

        } catch (error) {
            // ... manejo de errores (igual al tuyo) ...
            // Asegúrate de devolver status 400 si es error de negocio
            if (error.message.includes('stock 0')) return res.status(400).json({ success: false, message: error.message });

            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Obtener estados de productos
     */
    async getProductStatuses(req, res) {
        try {
            // ✨ CORRECCIÓN: Llamamos al servicio, no al modelo directo
            const estados = await productService.getProductStatuses();

            res.status(200).json({
                success: true,
                estados
            });
        } catch (error) {
            console.error("Error en getProductStatuses:", error); // Log para ver el error real en consola
            res.status(500).json({
                success: false,
                message: 'Error al obtener estados.'
            });
        }
    }

    /**
 * Descontinuar producto (acción especial)
 */
    async discontinueProduct(req, res) {
        try {
            const { id } = req.validatedParams;
            const producto = await productService.discontinueProduct(id);

            res.status(200).json({
                success: true,
                message: `Producto "${producto.nombre}" marcado como descontinuado`,
                producto
            });
        } catch (error) {
            if (error.message.includes('no encontrado')) {
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
     * Reactivar producto descontinuado
     */
    async reactivateDiscontinuedProduct(req, res) {
        try {
            const { id } = req.validatedParams;
            const producto = await productService.reactivateDiscontinuedProduct(id);

            res.status(200).json({
                success: true,
                message: `Producto "${producto.nombre}" reactivado exitosamente`,
                producto
            });
        } catch (error) {
            if (error.message.includes('no encontrado')) {
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
}