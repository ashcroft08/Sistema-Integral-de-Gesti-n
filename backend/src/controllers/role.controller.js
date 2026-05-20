// src/controllers/role.controller.js
import { Rol } from '../models/index.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class RoleController {
    getAllRoles = asyncHandler(async (req, res) => {
        const roles = await Rol.findAll({
            attributes: ['id_rol', 'rol'], // Solo devolver id y nombre
            where: {
                id_rol: {
                    [Op.ne]: 1  // Op.ne significa "not equal" (distinto de)
                }
            }
        });

        return res.status(200).json(
            ApiResponse.success({ roles })
        );
    });
}