import { Descuento, DetalleFactura } from '../models/index.js';
import { Op } from 'sequelize';

export class DiscountService {

    /**
     * Obtener todos los descuentos (útil para el administrador)
     */
    async getAllDiscounts() {
        try {
            return await Descuento.findAll({
                order: [['porcentaje_descuento', 'ASC']]
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener solo los activos (útil para el select de ventas)
     */
    async getActiveDiscounts() {
        try {
            return await Descuento.findAll({
                where: { activo: true },
                order: [['porcentaje_descuento', 'ASC']]
            });
        } catch (error) {
            throw error;
        }
    }

    async getDiscountById(id) {
        try {
            const discount = await Descuento.findByPk(id);
            if (!discount) throw new Error('Descuento no encontrado.');
            return discount;
        } catch (error) {
            throw error;
        }
    }

    async createDiscount(data) {
        try {
            // Verificar código único
            const existingCode = await Descuento.findOne({ where: { codigo: data.codigo } });
            if (existingCode) throw new Error(`El código "${data.codigo}" ya está registrado.`);

            // Verificar nombre único (opcional, pero recomendado para evitar confusión)
            const existingName = await Descuento.findOne({ where: { descuento: { [Op.iLike]: data.descuento } } });
            if (existingName) throw new Error(`Ya existe un descuento llamado "${data.descuento}".`);

            return await Descuento.create(data);
        } catch (error) {
            throw error;
        }
    }

    async updateDiscount(id, data) {
        try {
            const discount = await Descuento.findByPk(id);
            if (!discount) throw new Error('Descuento no encontrado.');

            // Validar código único si cambia
            if (data.codigo && data.codigo !== discount.codigo) {
                const existing = await Descuento.findOne({ where: { codigo: data.codigo } });
                if (existing) throw new Error(`El código "${data.codigo}" ya está en uso.`);
            }

            await discount.update(data);
            return discount;
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id, nuevoEstado) {
        try {
            const discount = await Descuento.findByPk(id);
            if (!discount) throw new Error('Descuento no encontrado.');

            const estadoBool = Boolean(nuevoEstado);

            await discount.update({ activo: estadoBool });
            return discount;
        } catch (error) {
            throw error;
        }
    }
}