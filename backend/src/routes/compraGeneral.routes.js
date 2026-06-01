// src/routes/compraGeneral.routes.js
import { Router } from 'express';
import { CompraGeneralController } from '../controllers/compraGeneral.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../constants/codigos.js';
import multer from 'multer';

const router = Router();
const controller = new CompraGeneralController();

// Multer config: memory storage, 10MB limit, xlsx/xls only
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
        }
    }
});

// Access for bodega, admin, superuser
const bodegaAccess = [
    verifyToken,
    checkRole([ROLES.BODEGA, ROLES.ADMINISTRADOR, ROLES.SUPERUSUARIO])
];

/**
 * @route   POST /api/cacao/compra-general/upload
 * @desc    Subir y procesar archivo Excel de compras generales
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.post('/upload', bodegaAccess, upload.single('file'), controller.upload);

/**
 * @route   GET /api/cacao/compra-general/periodos
 * @desc    Obtener todos los períodos de compra
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.get('/periodos', bodegaAccess, controller.getPeriodos);

/**
 * @route   POST /api/cacao/compra-general/periodos
 * @desc    Crear un nuevo período de compra
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.post('/periodos', bodegaAccess, controller.createPeriodo);

router.delete('/periodos/:id', bodegaAccess, controller.deletePeriodo);

/**
 * @route   PUT /api/cacao/compra-general/periodos/:id
 * @desc    Actualizar un período de compra
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.put('/periodos/:id', bodegaAccess, controller.updatePeriodo);

/**
 * @route   POST /api/cacao/compra-general/periodos/:id/approve
 * @desc    Aprobar período y procesar carga al Data Warehouse
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.post('/periodos/:id/approve', bodegaAccess, controller.approvePeriod);

/**
 * @route   GET /api/cacao/compra-general/periodos/:id/reporte-resumen
 * @desc    Obtener reporte resumen del Data Warehouse de compras
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.get('/periodos/:id/reporte-resumen', bodegaAccess, controller.getPeriodReport);

/**
 * @route   GET /api/cacao/compra-general
 * @desc    Obtener todas las compras generales (paginado)
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.get('/', bodegaAccess, controller.getAll);

/**
 * @route   DELETE /api/cacao/compra-general
 * @desc    Eliminar todos los registros de compras generales
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.delete('/', bodegaAccess, controller.deleteAll);

export default router;
