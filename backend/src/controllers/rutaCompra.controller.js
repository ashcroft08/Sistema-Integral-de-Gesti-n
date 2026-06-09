// src/controllers/rutaCompra.controller.js
import { RutaCompra } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class RutaCompraController {
    create = asyncHandler(async (req, res) => {
        const { ruta_compra } = req.body;

        if (!ruta_compra || !ruta_compra.trim()) {
            return res.status(400).json(ApiResponse.error('El nombre de la ruta de compra es requerido.'));
        }

        const existing = await RutaCompra.findOne({
            where: { ruta_compra: ruta_compra.trim() }
        });
        if (existing) {
            return res.status(400).json(ApiResponse.error('La ruta de compra ingresada ya existe.'));
        }

        const route = await RutaCompra.create({
            ruta_compra: ruta_compra.trim()
        });

        return res.status(201).json(ApiResponse.success(route.get({ plain: true }), 'Ruta de compra registrada correctamente.'));
    });

    getAll = asyncHandler(async (req, res) => {
        const routes = await RutaCompra.findAll({
            order: [['ruta_compra', 'ASC']]
        });
        return res.status(200).json(ApiResponse.success(routes));
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { ruta_compra } = req.body;

        if (!ruta_compra || !ruta_compra.trim()) {
            return res.status(400).json(ApiResponse.error('El nombre de la ruta de compra es requerido.'));
        }

        const existingRoute = await RutaCompra.findByPk(id);
        if (!existingRoute) {
            return res.status(404).json(ApiResponse.error('La ruta de compra no existe.'));
        }

        const duplicate = await RutaCompra.findOne({
            where: {
                ruta_compra: ruta_compra.trim()
            }
        });
        if (duplicate && duplicate.id_ruta_compra !== parseInt(id, 10)) {
            return res.status(400).json(ApiResponse.error('Ya existe otra ruta de compra con ese nombre.'));
        }

        existingRoute.ruta_compra = ruta_compra.trim();
        await existingRoute.save();

        return res.status(200).json(ApiResponse.success(existingRoute, 'Ruta de compra actualizada correctamente.'));
    });

    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const route = await RutaCompra.findByPk(id);
        if (!route) {
            return res.status(404).json(ApiResponse.error('La ruta de compra no existe.'));
        }

        // Dynamically require models to avoid circular dependencies if any
        const models = await import('../models/index.js');
        const ControlLoteOrg = models.ControlLoteOrg;
        const ControlLoteCv = models.ControlLoteCv;

        const orgLinked = await ControlLoteOrg.findOne({ where: { id_ruta_compra: id } });
        const cvLinked = await ControlLoteCv.findOne({ where: { id_ruta_compra: id } });

        if (orgLinked || cvLinked) {
            return res.status(400).json(ApiResponse.error('No se puede eliminar la ruta de compra porque está vinculada a lotes de control existentes.'));
        }

        await route.destroy();
        return res.status(200).json(ApiResponse.success(null, 'Ruta de compra eliminada correctamente.'));
    });
}
