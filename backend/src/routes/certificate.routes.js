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

// Subir certificado
router.post(
    '/upload',
    uploadMiddleware,
    (req, res) => certificateController.uploadCertificate(req, res)
);

// Listar certificados
router.get('/', (req, res) => certificateController.listCertificates(req, res));

// Activar certificado
router.patch('/:id/activate', (req, res) => certificateController.activateCertificate(req, res));

// Desactivar certificado
router.delete('/:id', (req, res) => certificateController.deactivateCertificate(req, res));

export default router;