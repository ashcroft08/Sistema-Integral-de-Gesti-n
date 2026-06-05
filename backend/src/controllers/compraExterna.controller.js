// src/controllers/compraExterna.controller.js
import { CompraExterna, PeriodoCompra, Proveedor } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class CompraExternaController {
    create = asyncHandler(async (req, res) => {
        const {
            id_periodo_compra,
            fecha,
            id_proveedor,
            peso_proveedor,
            peso_diferencia,
            quintales_facturas,
            costo_unitario,
            total,
            peso_ass,
            peso_as,
            peso_pajarito,
            peso_basura,
            libras_seco,
            libras_escurrido,
            quintales_escurrido,
            es_organico
        } = req.body;

        if (!id_periodo_compra) {
            return res.status(400).json(ApiResponse.error('El período es requerido.'));
        }

        if (!id_proveedor) {
            return res.status(400).json(ApiResponse.error('El proveedor es requerido.'));
        }

        const periodo = await PeriodoCompra.findByPk(id_periodo_compra);
        if (!periodo) {
            return res.status(404).json(ApiResponse.error('El período no existe.'));
        }

        const prov = await Proveedor.findByPk(id_proveedor);
        if (!prov) {
            return res.status(404).json(ApiResponse.error('El proveedor no existe.'));
        }

        const compra = await CompraExterna.create({
            id_periodo_compra,
            fecha,
            id_proveedor,
            peso_proveedor,
            peso_diferencia,
            quintales_facturas,
            costo_unitario,
            total,
            peso_ass,
            peso_as,
            peso_pajarito,
            peso_basura,
            libras_seco,
            libras_escurrido,
            quintales_escurrido,
            es_organico
        });

        // Reload to include Proveedor in response
        const fullCompra = await CompraExterna.findByPk(compra.id_compra_externa, {
            include: [{ model: Proveedor, attributes: ['id_proveedor', 'nombres', 'direccion', 'telefono', 'identificacion', 'correo'] }]
        });

        return res.status(201).json(ApiResponse.success(fullCompra.get({ plain: true }), 'Compra externa registrada correctamente.'));
    });

    getAll = asyncHandler(async (req, res) => {
        const { id_periodo_compra } = req.query;
        const where = id_periodo_compra ? { id_periodo_compra: parseInt(id_periodo_compra, 10) } : {};

        const compras = await CompraExterna.findAll({
            where,
            include: [
                {
                    model: Proveedor,
                    attributes: ['id_proveedor', 'nombres', 'direccion', 'telefono', 'identificacion', 'correo']
                }
            ],
            order: [['fecha', 'DESC'], ['id_compra_externa', 'DESC']]
        });

        // Compute aggregates
        let resumen = {
            totalPesoProveedor: 0,
            totalQuintalesFacturas: 0,
            totalMonto: 0,
            totalQ_fisicos: 0,
            totalLibrasSeco: 0,
            totalEscurridoLibras: 0
        };

        if (compras.length > 0) {
            resumen.totalPesoProveedor = compras.reduce((acc, c) => acc + parseFloat(c.peso_proveedor || 0), 0);
            resumen.totalQuintalesFacturas = compras.reduce((acc, c) => acc + parseFloat(c.quintales_facturas || 0), 0);
            resumen.totalMonto = compras.reduce((acc, c) => acc + parseFloat(c.total || 0), 0);
            resumen.totalQ_fisicos = compras.reduce((acc, c) => acc + (
                parseFloat(c.peso_ass || 0) +
                parseFloat(c.peso_as || 0) +
                parseFloat(c.peso_pajarito || 0) +
                parseFloat(c.peso_basura || 0)
            ), 0);
            resumen.totalLibrasSeco = compras.reduce((acc, c) => acc + parseFloat(c.libras_seco || 0), 0);
            resumen.totalEscurridoLibras = compras.reduce((acc, c) => acc + parseFloat(c.libras_escurrido || 0), 0);
        }

        return res.status(200).json(ApiResponse.success({ compras, resumen }));
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const compra = await CompraExterna.findByPk(id);

        if (!compra) {
            return res.status(404).json(ApiResponse.error('El registro de compra externa no existe.'));
        }

        if (req.body.id_proveedor) {
            const prov = await Proveedor.findByPk(req.body.id_proveedor);
            if (!prov) {
                return res.status(404).json(ApiResponse.error('El proveedor no existe.'));
            }
        }

        await compra.update(req.body);

        // Reload to include Proveedor in response
        const fullCompra = await CompraExterna.findByPk(compra.id_compra_externa, {
            include: [{ model: Proveedor, attributes: ['id_proveedor', 'nombres', 'direccion', 'telefono', 'identificacion', 'correo'] }]
        });

        return res.status(200).json(ApiResponse.success(fullCompra.get({ plain: true }), 'Registro actualizado correctamente.'));
    });

    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const compra = await CompraExterna.findByPk(id);

        if (!compra) {
            return res.status(404).json(ApiResponse.error('El registro de compra externa no existe.'));
        }

        await compra.destroy();
        return res.status(200).json(ApiResponse.success(null, 'Registro eliminado correctamente.'));
    });
}
