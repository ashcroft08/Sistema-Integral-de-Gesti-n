// src/controllers/role.controller.js
import { Rol } from '../models/index.js';
import { Op } from 'sequelize'; // Importa Op

export class RoleController {
    async getAllRoles(req, res) {
        try {
            const roles = await Rol.findAll({
                attributes: ['id_rol', 'rol'], // Solo devolver id y nombre
                where: {
                    id_rol: { // Campo a filtrar
                        [Op.ne]: 1  // Op.ne significa "not equal" (distinto de)
                    }
                }
            });
            res.status(200).json({
                success: true,
                roles
            });
        } catch (error) {
            console.error("Error al obtener roles:", error); // Log para debug
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}