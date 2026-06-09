// src/controllers/controlLoteCv.controller.js
import { ControlLoteCv, LoteComercializacionCv, RutaCompra } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ControlLoteCvController {
    /**
     * Obtener todos los controles de lote y sus datos de comercialización convencionales
     * Opcionalmente filtrado por id_periodo_compra
     */
    getAll = asyncHandler(async (req, res) => {
        const { id_periodo_compra } = req.query;
        if (!id_periodo_compra) {
            return res.status(400).json(ApiResponse.error('El id_periodo_compra es obligatorio.'));
        }

        const list = await ControlLoteCv.findAll({
            where: { id_periodo_compra },
            include: [
                {
                    model: LoteComercializacionCv,
                    required: false
                },
                {
                    model: RutaCompra,
                    required: false
                }
            ],
            order: [
                ['fecha_ingreso', 'ASC'],
                ['lote', 'ASC']
            ]
        });

        return res.status(200).json(ApiResponse.success(list));
    });

    /**
     * Actualizar campos específicos (odp, estado, clasificado, id_ruta_compra) de un lote de control convencional
     */
    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { odp, estado, clasificado, id_ruta_compra } = req.body;

        const loteControl = await ControlLoteCv.findByPk(id);
        if (!loteControl) {
            return res.status(404).json(ApiResponse.error('No se encontró el lote de control especificado.'));
        }

        const updateData = {};
        if (odp !== undefined) updateData.odp = odp;
        if (estado !== undefined) updateData.estado = estado;
        if (clasificado !== undefined) updateData.clasificado = clasificado;
        if (id_ruta_compra !== undefined) updateData.id_ruta_compra = id_ruta_compra;

        await loteControl.update(updateData);
        return res.status(200).json(ApiResponse.success(loteControl, 'Lote de control actualizado correctamente.'));
    });

    /**
     * Actualización masiva de ODPs
     */
    bulkUpdateOdp = asyncHandler(async (req, res) => {
        const { updates } = req.body;
        if (!Array.isArray(updates)) {
            return res.status(400).json(ApiResponse.error('Debe proporcionar una lista de actualizaciones.'));
        }

        const t = await ControlLoteCv.sequelize.transaction();
        try {
            for (const update of updates) {
                await ControlLoteCv.update(
                    { odp: update.odp },
                    { 
                        where: { id_control_lote_cv: update.id_control_lote_cv },
                        transaction: t 
                    }
                );
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            throw error;
        }

        return res.status(200).json(ApiResponse.success(null, 'ODPs convencionales actualizadas secuencialmente con éxito.'));
    });

    /**
     * Guardar o actualizar datos de comercialización del lote de control convencional
     */
    saveComercializacion = asyncHandler(async (req, res) => {
        const {
            id_control_lote_cv,
            id_periodo_compra,
            fecha_clasificacion,
            ass,
            as: asVal,
            pajarito,
            impureza,
            total
        } = req.body;

        if (!id_control_lote_cv || !id_periodo_compra || !fecha_clasificacion) {
            return res.status(400).json(ApiResponse.error('Faltan campos obligatorios para guardar la comercialización.'));
        }

        const controlLote = await ControlLoteCv.findByPk(id_control_lote_cv);
        if (!controlLote) {
            return res.status(404).json(ApiResponse.error('El lote de control de referencia no existe.'));
        }

        // Calcular porcentaje_perdida = (cantidad_libra / total)
        const cantLbs = parseFloat(controlLote.cantidad_libra) || 0;
        const totalVal = parseFloat(total) || 0;
        const porcentaje_perdida = totalVal > 0 ? parseFloat((cantLbs / totalVal).toFixed(2)) : 0;

        // Buscar si ya existe la comercialización de este lote
        let comercializacion = await LoteComercializacionCv.findOne({
            where: { id_control_lote_cv }
        });

        const data = {
            id_periodo_compra,
            id_control_lote_cv,
            fecha_clasificacion,
            ass: parseFloat(ass) || 0,
            as: parseFloat(asVal) || 0,
            pajarito: parseFloat(pajarito) || 0,
            impureza: parseFloat(impureza) || 0,
            total: totalVal,
            porcentaje_perdida
        };

        if (comercializacion) {
            await comercializacion.update(data);
        } else {
            comercializacion = await LoteComercializacionCv.create(data);
        }

        // Marcar el lote de control como clasificado
        await controlLote.update({ clasificado: true });

        return res.status(200).json(ApiResponse.success(comercializacion, 'Datos de comercialización guardados correctamente.'));
    });
}
