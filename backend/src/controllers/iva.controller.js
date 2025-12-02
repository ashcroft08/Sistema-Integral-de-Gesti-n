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

    async delete(req, res) {
        try {
            const { id } = req.validatedParams;
            const result = await ivaService.deleteIva(id);
            res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}