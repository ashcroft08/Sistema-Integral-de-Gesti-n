import { LocationService } from '../services/location.service.js';

const locationService = new LocationService();

export class LocationController {

    async getProvincias(req, res) {
        try {
            const provincias = await locationService.getAllProvincias();
            res.json({ success: true, provincias });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getCantones(req, res) {
        try {
            const { id_provincia } = req.params;
            const cantones = await locationService.getCantonesByProvincia(id_provincia);
            res.json({ success: true, cantones });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getParroquias(req, res) {
        try {
            const { id_canton } = req.params;
            const parroquias = await locationService.getParroquiasByCanton(id_canton);
            res.json({ success: true, parroquias });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // ✅ NUEVO: Obtener ubicación completa por parroquia
    async getLocationByParroquia(req, res) {
        try {
            const { id_parroquia } = req.params;
            const location = await locationService.getLocationByParroquia(id_parroquia);
            res.json({ success: true, location });
        } catch (error) {
            if (error.message === 'Parroquia no encontrada') {
                return res.status(404).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getFullHierarchy(req, res) {
        try {
            const locations = await locationService.getFullHierarchy();
            res.json({ success: true, locations });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}