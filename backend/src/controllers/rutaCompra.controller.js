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
}
