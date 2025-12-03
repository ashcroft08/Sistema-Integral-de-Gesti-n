import { Router } from 'express';
import { LocationController } from '../controllers/location.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();
const locationController = new LocationController();

// Proteger rutas con autenticación
router.use(verifyToken);

// Rutas de ubicación
router.get('/provincias', (req, res) => locationController.getProvincias(req, res));
router.get('/provincias/:id_provincia/cantones', (req, res) => locationController.getCantones(req, res));
router.get('/cantones/:id_canton/parroquias', (req, res) => locationController.getParroquias(req, res));

// ✅ NUEVA RUTA: Obtener ubicación completa por parroquia
router.get('/parroquias/:id_parroquia/location', (req, res) => locationController.getLocationByParroquia(req, res));

router.get('/hierarchy', (req, res) => locationController.getFullHierarchy(req, res));

export default router;