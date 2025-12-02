import { DiscountService } from '../services/discount.service.js';

const discountService = new DiscountService();

export class DiscountController {

    async getAll(req, res) {
        try {
            // Si pasan ?active=true, devolvemos solo los activos
            if (req.query.active === 'true') {
                const discounts = await discountService.getActiveDiscounts();
                return res.status(200).json({ success: true, discounts });
            }

            const discounts = await discountService.getAllDiscounts();
            res.status(200).json({ success: true, discounts });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.validatedParams;
            const discount = await discountService.getDiscountById(id);
            res.status(200).json({ success: true, discount });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const newDiscount = await discountService.createDiscount(req.validatedData);
            res.status(201).json({ success: true, message: 'Descuento creado exitosamente.', discount: newDiscount });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.validatedParams;
            const updatedDiscount = await discountService.updateDiscount(id, req.validatedData);
            res.status(200).json({ success: true, message: 'Descuento actualizado.', discount: updatedDiscount });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async changeStatus(req, res) {
        try {
            const { id } = req.validatedParams;
            const { activo } = req.body;

            const updatedDiscount = await discountService.changeStatus(id, activo);

            const accion = activo ? 'activado' : 'desactivado';
            res.status(200).json({
                success: true,
                message: `Descuento ${accion} correctamente.`,
                discount: updatedDiscount
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}