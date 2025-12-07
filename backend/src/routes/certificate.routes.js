import { Router } from 'express';
import { CertificateController, uploadMiddleware } from '../controllers/certificate.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const certificateController = new CertificateController();

const adminOnly = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR])
];

router.use(adminOnly);

// ✅ NUEVO: Info del certificado activo
router.get('/active', (req, res) => certificateController.getActiveCertificate(req, res));

// Subir certificado
router.post('/upload', uploadMiddleware, (req, res) =>
    certificateController.uploadCertificate(req, res)
);

// Listar todos
router.get('/', (req, res) => certificateController.listCertificates(req, res));

// Activar certificado (automáticamente desactiva los demás)
router.patch('/:id/activate', async (req, res) => {
    try {
        const { id } = req.params;

        // Desactivar todos
        await CertificadoDigital.update(
            { activo: false },
            { where: {} }
        );

        // Activar el seleccionado
        await certificateService.activateCertificate(parseInt(id));

        res.status(200).json({
            success: true,
            message: 'Certificado activado. Los demás fueron desactivados automáticamente.'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Desactivar
router.delete('/:id', (req, res) =>
    certificateController.deactivateCertificate(req, res)
);

export default router;