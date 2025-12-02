import { ValorIva, Producto, DetalleFactura } from '../models/index.js';

export class IvaService {

    async getAllIvas() {
        try {
            return await ValorIva.findAll({
                order: [['porcentaje_iva', 'ASC']]
            });
        } catch (error) {
            throw error;
        }
    }

    async getIvaById(id) {
        try {
            const iva = await ValorIva.findByPk(id);
            if (!iva) throw new Error('Valor de IVA no encontrado.');
            return iva;
        } catch (error) {
            throw error;
        }
    }

    async createIva(data) {
        try {
            // Verificar duplicados por código
            const existing = await ValorIva.findOne({ where: { codigo: data.codigo } });
            if (existing) throw new Error(`El código SRI "${data.codigo}" ya existe.`);

            // Verificar duplicados por porcentaje (opcional, pero recomendado)
            const existingPercent = await ValorIva.findOne({ where: { porcentaje_iva: data.porcentaje_iva } });
            if (existingPercent) throw new Error(`Ya existe un registro con el ${data.porcentaje_iva}%.`);

            return await ValorIva.create(data);
        } catch (error) {
            throw error;
        }
    }

    async updateIva(id, data) {
        try {
            const iva = await ValorIva.findByPk(id);
            if (!iva) throw new Error('Valor de IVA no encontrado.');

            // Validar código único si se intenta cambiar
            if (data.codigo && data.codigo !== iva.codigo) {
                const existing = await ValorIva.findOne({ where: { codigo: data.codigo } });
                if (existing) throw new Error(`El código SRI "${data.codigo}" ya está en uso.`);
            }

            await iva.update(data);
            return iva;
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id, nuevoEstado) {
        try {
            const iva = await ValorIva.findByPk(id);
            if (!iva) throw new Error('Valor de IVA no encontrado.');

            // Validar booleano
            const estadoBool = Boolean(nuevoEstado);

            await iva.update({ activo: estadoBool });
            return iva;
        } catch (error) {
            throw error;
        }
    }
}