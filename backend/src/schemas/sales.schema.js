import { z } from 'zod';

export const CreateSaleSchema = z.object({
    id_cliente: z.number().int().positive('El ID del cliente debe ser un número positivo'),

    productos: z.array(
        z.object({
            id_producto: z.number().int().positive('ID de producto inválido'),
            cantidad: z.number().int().positive('La cantidad debe ser mayor a cero'),
            id_valor_iva: z.number().int().positive('ID de IVA inválido'),
            id_descuento: z.number().int().positive().optional().nullable()
        })
    ).min(1, 'Debe incluir al menos un producto')
});