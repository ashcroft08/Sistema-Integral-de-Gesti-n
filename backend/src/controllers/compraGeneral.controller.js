// src/controllers/compraGeneral.controller.js
import { CompraGeneralService } from '../services/compraGeneral.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const compraGeneralService = new CompraGeneralService();

export class CompraGeneralController {
    /**
     * Subir y procesar archivo Excel de compras generales para un período específico
     */
    upload = asyncHandler(async (req, res) => {
        if (!req.file) {
            return res.status(400).json(
                ApiResponse.error('No se proporcionó ningún archivo.')
            );
        }
        const id_periodo_compra = req.body.id_periodo_compra || req.query.id_periodo_compra;
        if (!id_periodo_compra) {
            return res.status(400).json(
                ApiResponse.error('Debe proporcionar un id_periodo_compra para vincular los datos.')
            );
        }

        const resultado = await compraGeneralService.processExcel(req.file.buffer, id_periodo_compra);
        return res.status(200).json(
            ApiResponse.success({ resultado }, 'Archivo procesado correctamente')
        );
    });

    /**
     * Obtener todas las compras generales con paginación, opcionalmente filtrado por período
     */
    getAll = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const id_periodo_compra = req.query.id_periodo_compra;

        const resultado = await compraGeneralService.getAll(page, limit, id_periodo_compra);
        return res.status(200).json(
            ApiResponse.success({ ...resultado })
        );
    });

    /**
     * Eliminar registros de compras generales (acotado opcionalmente por período)
     */
    deleteAll = asyncHandler(async (req, res) => {
        const id_periodo_compra = req.query.id_periodo_compra;
        const resultado = await compraGeneralService.deleteAll(id_periodo_compra);
        return res.status(200).json(
            ApiResponse.success({ eliminados: resultado }, 'Registros eliminados correctamente')
        );
    });

    /**
     * Crear un nuevo período de compra
     */
    createPeriodo = asyncHandler(async (req, res) => {
        const { nombre, fecha_inicio, fecha_fin, descripcion } = req.body;
        if (!nombre || !fecha_inicio || !fecha_fin) {
            return res.status(400).json(
                ApiResponse.error('Faltan campos obligatorios (nombre, fecha_inicio, fecha_fin).')
            );
        }
        const resultado = await compraGeneralService.createPeriodo({ nombre, fecha_inicio, fecha_fin, descripcion });
        return res.status(201).json(
            ApiResponse.success(resultado, 'Período creado correctamente')
        );
    });

    /**
     * Obtener listado de todos los períodos de compra
     */
    getPeriodos = asyncHandler(async (req, res) => {
        const resultado = await compraGeneralService.getPeriodos();
        return res.status(200).json(
            ApiResponse.success(resultado)
        );
    });

    /**
     * Eliminar un período de compra
     */
    deletePeriodo = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const resultado = await compraGeneralService.deletePeriodo(id);
        return res.status(200).json(
            ApiResponse.success({ eliminados: resultado }, 'Período eliminado correctamente')
        );
    });

    /**
     * Actualizar un período de compra
     */
    updatePeriodo = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { nombre, fecha_inicio, fecha_fin, descripcion, estado } = req.body;
        const resultado = await compraGeneralService.updatePeriodo(id, { nombre, fecha_inicio, fecha_fin, descripcion, estado });
        return res.status(200).json(
            ApiResponse.success(resultado, 'Período actualizado correctamente')
        );
    });
}
