import { Router } from 'express';
import { ClientController } from '../controllers/client.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { validateRequest, validateParams } from '../middleware/validation.middleware.js';
import { CreateClientSchema, UpdateClientSchema, ClientIdSchema, ChangeStateClientSchema } from '../schemas/client.schema.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const clientController = new ClientController();

// Seguridad: Todos estos endpoints requieren autenticación
const accessMiddleware = [
    verifyToken,
    // Permitir a Admin, Super, Vendedor y Contador
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR, ROLES.VENDEDOR, ROLES.CONTADOR])
];

router.use(accessMiddleware);

// 1. Obtener catálogos (Tipos ID, Cantones) - Útil para llenar el formulario al abrirlo
router.get('/catalogs', (req, res) => clientController.getFormCatalogs(req, res));

// 2. CRUD Clientes
router.get('/', (req, res) => clientController.getAllClients(req, res));

router.post(
    '/',
    validateRequest(CreateClientSchema),
    (req, res) => clientController.createClient(req, res)
);

router.put(
    '/:id',
    validateParams(ClientIdSchema),
    validateRequest(UpdateClientSchema),
    (req, res) => clientController.updateClient(req, res)
);

router.patch(
    '/:id/state',
    validateParams(ClientIdSchema),
    validateRequest(ChangeStateClientSchema),
    (req, res) => clientController.changeState(req, res)
);

export default router;