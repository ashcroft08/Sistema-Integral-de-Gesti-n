import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const notificationController = new NotificationController();

// Middleware de seguridad: Solo gente autorizada puede ver alertas de stock
const accessMiddleware = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR, ROLES.VENDEDOR])
];

router.use(accessMiddleware);

// GET: Obtener no leídas (Para el puntito rojo y la lista)
router.get('/unread', (req, res) => notificationController.getUnread(req, res));

// PATCH: Marcar una como leída (Al hacer clic en la X o en la notificación)
router.patch('/:id/read', (req, res) => notificationController.markAsRead(req, res));

// PATCH: Marcar todo como leído
router.patch('/read-all', (req, res) => notificationController.markAllAsRead(req, res));

export default router;