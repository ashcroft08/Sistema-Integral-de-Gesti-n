import { z } from 'zod';

// ============================================
// SCHEMA: CREAR VENTA
// ============================================
export const CreateSaleSchema = z.object({
    id_cliente: z.number({
        required_error: 'El cliente es obligatorio',
        invalid_type_error: 'El ID del cliente debe ser un número'
    })
        .int('El ID del cliente debe ser un número entero')
        .positive('El ID del cliente debe ser positivo'),

    id_metodo_pago: z.number({
        required_error: 'El método de pago es obligatorio',
        invalid_type_error: 'El ID de método de pago debe ser un número'
    })
        .int('El ID de método de pago debe ser un número entero')
        .positive('El ID de método de pago debe ser positivo'),

    tipo_venta: z.enum(['CONTADO', 'CREDITO'], {
        required_error: 'El tipo de venta es obligatorio',
        invalid_type_error: 'El tipo de venta debe ser CONTADO o CREDITO'
    })
        .default('CONTADO'),

    plazo_credito_dias: z.number()
        .int('El plazo debe ser un número entero')
        .positive('El plazo debe ser mayor a 0')
        .optional()
        .nullable(),

    referencia_pago: z.string()
        .trim()
        .max(50, 'La referencia no puede exceder 50 caracteres')
        .optional()
        .nullable(),

    productos: z.array(
        z.object({
            id_producto: z.number({
                required_error: 'El ID del producto es obligatorio'
            })
                .int()
                .positive(),

            id_valor_iva: z.number({
                required_error: 'El IVA es obligatorio'
            })
                .int()
                .positive(),

            cantidad: z.number({
                required_error: 'La cantidad es obligatoria'
            })
                .int('La cantidad debe ser un número entero')
                .positive('La cantidad debe ser mayor a cero'),

            id_descuento: z.number()
                .int()
                .positive()
                .optional()
                .nullable()
        })
    )
        .min(1, 'Debe incluir al menos un producto en la venta')
        .max(100, 'No se pueden vender más de 100 productos diferentes en una sola factura')
})
    // Validación cruzada: si es crédito, debe tener plazo
    .refine(
        (data) => {
            if (data.tipo_venta === 'CREDITO') {
                return data.plazo_credito_dias && data.plazo_credito_dias > 0;
            }
            return true;
        },
        {
            message: 'Las ventas a crédito requieren especificar el plazo en días',
            path: ['plazo_credito_dias']
        }
    )
    // Validación: si es contado, no debe tener plazo
    .refine(
        (data) => {
            if (data.tipo_venta === 'CONTADO') {
                return !data.plazo_credito_dias || data.plazo_credito_dias === null;
            }
            return true;
        },
        {
            message: 'Las ventas de contado no deben tener plazo de crédito',
            path: ['plazo_credito_dias']
        }
    );

// ============================================
// SCHEMA: FILTROS HISTORIAL DE VENTAS
// ============================================
export const SalesHistoryFiltersSchema = z.object({
    fecha_desde: z.string()
        .datetime({ message: 'Formato de fecha inválido' })
        .optional(),

    fecha_hasta: z.string()
        .datetime({ message: 'Formato de fecha inválido' })
        .optional(),

    id_vendedor: z.string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive())
        .optional(),

    id_estado_sri: z.string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive())
        .optional(),

    tipo_venta: z.enum(['CONTADO', 'CREDITO'])
        .optional(),

    limit: z.string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive().max(500))
        .optional()
        .default('50')
});

// ============================================
// SCHEMA: PARÁMETRO ID
// ============================================
export const IdParamSchema = z.object({
    id: z.string()
        .transform((val) => parseInt(val, 10))
        .pipe(
            z.number({
                required_error: 'El ID es obligatorio',
                invalid_type_error: 'El ID debe ser un número'
            })
                .int('El ID debe ser un número entero')
                .positive('El ID debe ser positivo')
        )
});

// ============================================
// SCHEMA: REGISTRAR PAGO DE CUENTA POR COBRAR
// ============================================
export const RegistrarPagoSchema = z.object({
    id_metodo_pago: z.number({
        required_error: 'El método de pago es obligatorio',
        invalid_type_error: 'El ID de método de pago debe ser un número'
    })
        .int()
        .positive(),

    monto_pago: z.number({
        required_error: 'El monto del pago es obligatorio',
        invalid_type_error: 'El monto debe ser un número'
    })
        .positive('El monto debe ser mayor a cero')
        .refine(
            (val) => {
                const decimales = val.toString().split('.')[1];
                return !decimales || decimales.length <= 2;
            },
            { message: 'El monto no puede tener más de 2 decimales' }
        ),

    referencia_pago: z.string()
        .trim()
        .max(50, 'La referencia no puede exceder 50 caracteres')
        .optional()
        .nullable(),

    observaciones: z.string()
        .trim()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
        .nullable()
});

// ============================================
// SCHEMA: FILTROS CUENTAS POR COBRAR
// ============================================
export const CuentasPorCobrarFiltersSchema = z.object({
    estado: z.enum(['PENDIENTE', 'PAGADA', 'VENCIDA', 'PARCIAL'])
        .optional(),

    id_cliente: z.string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive())
        .optional(),

    vencidas: z.string()
        .transform((val) => val === 'true')
        .pipe(z.boolean())
        .optional(),

    limit: z.string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive().max(500))
        .optional()
        .default('50')
});