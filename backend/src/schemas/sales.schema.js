// ============================================
// schemas/sales.schema.js - SCHEMAS COMPLETOS
// ============================================
import { z } from 'zod';

/**
 * Schema para crear venta
 */
export const CreateSaleSchema = z.object({
    id_cliente: z.number()
        .int('El ID del cliente debe ser un número entero')
        .positive('El ID del cliente debe ser un número positivo'),

    id_metodo_pago: z.number()
        .int('El ID del método de pago debe ser un número entero')
        .positive('El ID del método de pago debe ser un número positivo'),

    productos: z.array(
        z.object({
            id_producto: z.number()
                .int('ID de producto inválido')
                .positive('ID de producto debe ser positivo'),

            cantidad: z.number()
                .int('La cantidad debe ser un número entero')
                .positive('La cantidad debe ser mayor a cero')
                .max(10000, 'La cantidad máxima es 10,000 unidades'),

            id_valor_iva: z.number()
                .int('ID de IVA inválido')
                .positive('ID de IVA debe ser positivo'),

            id_descuento: z.number()
                .int('ID de descuento inválido')
                .positive('ID de descuento debe ser positivo')
                .optional()
                .nullable()
        })
    )
        .min(1, 'Debe incluir al menos un producto')
        .max(100, 'Máximo 100 productos por factura')
});

/**
 * Schema para filtros de historial
 */
export const SalesHistoryFiltersSchema = z.object({
    fecha_desde: z.string()
        .datetime({ message: 'Formato de fecha inválido' })
        .optional()
        .or(z.literal('')),

    fecha_hasta: z.string()
        .datetime({ message: 'Formato de fecha inválido' })
        .optional()
        .or(z.literal('')),

    id_vendedor: z.string()
        .transform(val => val ? parseInt(val) : undefined)
        .pipe(z.number().int().positive().optional())
        .optional(),

    id_estado_sri: z.string()
        .transform(val => val ? parseInt(val) : undefined)
        .pipe(z.number().int().positive().optional())
        .optional(),

    limit: z.string()
        .default('50')
        .transform(val => parseInt(val))
        .pipe(z.number().int().positive().max(200, 'Límite máximo de 200 registros'))
        .optional()
});

/**
 * Schema para validar parámetro ID
 */
export const IdParamSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, 'ID debe ser numérico')
        .transform(val => parseInt(val))
        .pipe(z.number().int().positive('ID debe ser positivo'))
});