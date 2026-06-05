// src/controllers/proveedor.controller.js
import { Proveedor } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ProveedorController {
    create = asyncHandler(async (req, res) => {
        const { nombres, direccion, telefono, identificacion, correo } = req.body;

        if (!nombres) {
            return res.status(400).json(ApiResponse.error('El nombre del proveedor es requerido.'));
        }

        if (identificacion) {
            const cleanId = identificacion.trim();
            const existing = await Proveedor.findOne({ where: { identificacion: cleanId } });
            if (existing) {
                return res.status(400).json(ApiResponse.error('La identificación ingresada ya está registrada para otro proveedor.'));
            }
        }

        const proveedor = await Proveedor.create({
            nombres,
            direccion,
            telefono,
            identificacion,
            correo
        });

        return res.status(201).json(ApiResponse.success(proveedor.get({ plain: true }), 'Proveedor registrado correctamente.'));
    });

    getAll = asyncHandler(async (req, res) => {
        const proveedors = await Proveedor.findAll({
            order: [['nombres', 'ASC']]
        });

        return res.status(200).json(ApiResponse.success(proveedors));
    });
}
