import { z } from 'zod';

// Esquema para cada producto en la lista
const ProductItemSchema = z.object({
    id_producto: z.number().int().positive(),
    cantidad: z.number().int().positive({ message: "La cantidad debe ser mayor a 0" }),
    id_valor_iva: z.number().int().positive(),
    id_descuento: z.number().int().optional().nullable() // Puede ser nulo
});

// Esquema principal de la venta
export const CreateSaleSchema = z.object({
    id_cliente: z.number().int().positive({ message: "Cliente inválido" }),
    // id_vendedor NO se valida aquí porque se saca del token en el backend
    productos: z.array(ProductItemSchema).min(1, { message: "Debe haber al menos un producto en la venta" })
});