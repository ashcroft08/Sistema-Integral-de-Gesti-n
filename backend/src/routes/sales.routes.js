import { Router } from 'express';
import { SalesController } from '../controllers/sales.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import {
    validateRequest,
    validateParams,
    validateQuery
} from '../middleware/validation.middleware.js';
import {
    CreateSaleSchema,
    SalesHistoryFiltersSchema,
    IdParamSchema
} from '../schemas/sales.schema.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const salesController = new SalesController();

// Middleware común: Autenticación y autorización
const salesAccess = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR, ROLES.VENDEDOR])
];

const adminAccess = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR])
];

// Aplicar autenticación a todas las rutas
router.use(salesAccess);

// ============================================
// RUTAS PÚBLICAS (dentro de autenticación)
// ============================================

/**
 * GET /api/sales/catalogs
 * Obtener catálogos (IVAs, Descuentos, Métodos de Pago)
 */
router.get('/catalogs', (req, res) => salesController.getCatalogs(req, res));

/**
 * GET /api/sales/stats
 * Obtener estadísticas de almacenamiento Cloudinary
 */
router.get('/stats', (req, res) => salesController.getStorageStats(req, res));

// ============================================
// RUTAS DE VENTAS
// ============================================

/**
 * POST /api/sales
 * Crear nueva venta
 * Body: { id_cliente, id_metodo_pago, productos: [...] }
 */
router.post(
    '/',
    validateRequest(CreateSaleSchema, 'body'), // ✅ Especificamos 'body'
    (req, res) => salesController.createSale(req, res)
);

/**
 * GET /api/sales/history
 * Historial de ventas con filtros
 * Query: ?fecha_desde=&fecha_hasta=&id_vendedor=&id_estado_sri=&limit=
 */
router.get(
    '/history',
    validateQuery(SalesHistoryFiltersSchema), // ✅ Validar query params
    (req, res) => salesController.getSalesHistory(req, res)
);

/**
 * GET /api/sales/:id
 * Obtener factura específica por ID
 */
router.get(
    '/:id',
    validateParams(IdParamSchema), // ✅ Validar params
    (req, res) => salesController.getInvoice(req, res)
);

/**
 * GET /api/sales/:id/xml
 * Descargar/Ver XML de factura
 * Redirige a la URL de Cloudinary
 */
router.get(
    '/:id/xml',
    validateParams(IdParamSchema),
    (req, res) => salesController.downloadXml(req, res)
);

// ============================================
// RUTAS ADMINISTRATIVAS (Solo Admin/Super)
// ============================================

/**
 * POST /api/sales/:id/resend-sri
 * Reenviar factura rechazada/devuelta al SRI
 * Solo administradores
 */
router.post(
    '/:id/resend-sri',
    adminAccess[1], // checkRole ya está en adminAccess
    validateParams(IdParamSchema),
    (req, res) => salesController.resendToSri(req, res)
);

/**
 * DELETE /api/sales/:id
 * Anular factura (cambiar estado a ANULADO)
 * Solo administradores
 */
router.delete(
    '/:id',
    adminAccess[1],
    validateParams(IdParamSchema),
    (req, res) => salesController.cancelInvoice(req, res)
);

export default router;
