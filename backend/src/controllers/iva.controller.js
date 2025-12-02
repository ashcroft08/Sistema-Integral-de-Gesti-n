import { IvaService } from '../services/iva.service.js';

const ivaService = new IvaService();

export class IvaController {

    async getAll(req, res) {
        try {
            const ivas = await ivaService.getAllIvas();
            res.status(200).json({ success: true, ivas });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const newIva = await ivaService.createIva(req.validatedData);
            res.status(201).json({ success: true, message: 'IVA registrado exitosamente.', iva: newIva });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.validatedParams;
            const updatedIva = await ivaService.updateIva(id, req.validatedData);
            res.status(200).json({ success: true, message: 'IVA actualizado correctamente.', iva: updatedIva });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async changeStatus(req, res) {
        try {
            const { id } = req.validatedParams;
            const { activo } = req.body; // Esperamos { "activo": true/false }

            const updatedIva = await ivaService.changeStatus(id, activo);

            const accion = activo ? 'activado' : 'desactivado';
            res.status(200).json({
                success: true,
                message: `Valor de IVA ${accion} correctamente.`,
                iva: updatedIva
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}