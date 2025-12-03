import { Provincia, Canton, Parroquia } from '../models/index.js';

export class LocationService {

    // Obtener todas las provincias
    async getAllProvincias() {
        return await Provincia.findAll({
            attributes: ['id_provincia', 'provincia', 'codigo'],
            order: [['provincia', 'ASC']]
        });
    }

    // Obtener cantones de una provincia
    async getCantonesByProvincia(idProvincia) {
        return await Canton.findAll({
            where: { id_provincia: idProvincia },
            attributes: ['id_canton', 'canton', 'codigo'],
            order: [['canton', 'ASC']]
        });
    }

    // Obtener parroquias de un cantón
    async getParroquiasByCanton(idCanton) {
        return await Parroquia.findAll({
            where: { id_canton: idCanton },
            attributes: ['id_parroquia', 'parroquia', 'codigo'],
            order: [['parroquia', 'ASC']]
        });
    }

    // Obtener ubicación completa por ID de parroquia
    async getLocationByParroquia(idParroquia) {
        try {
            // Aquí es donde necesitas usar 'as' porque las asociaciones ahora tienen alias
            const parroquia = await Parroquia.findByPk(idParroquia, {
                attributes: ['id_parroquia', 'parroquia', 'codigo'],
                include: [{
                    model: Canton,
                    as: 'canton', // <-- Añadir 'as' con el alias definido en Parroquia.associate
                    attributes: ['id_canton', 'canton', 'codigo', 'id_provincia'],
                    include: [{
                        model: Provincia,
                        as: 'provincia', // <-- Añadir 'as' con el alias definido en Canton.associate
                        attributes: ['id_provincia', 'provincia', 'codigo']
                    }]
                }]
            });

            if (!parroquia) {
                throw new Error('Parroquia no encontrada');
            }

            // Verificar que las relaciones existan usando los alias
            if (!parroquia.canton) { // <-- Acceder con el alias 'canton'
                throw new Error('Cantón no encontrado para esta parroquia');
            }

            if (!parroquia.canton.provincia) { // <-- Acceder con el alias 'provincia'
                throw new Error('Provincia no encontrada para este cantón');
            }

            // Retornar en formato estructurado usando los alias
            return {
                parroquia: {
                    id: parroquia.id_parroquia,
                    nombre: parroquia.parroquia,
                    codigo: parroquia.codigo
                },
                canton: {
                    id: parroquia.canton.id_canton, // <-- Alias
                    nombre: parroquia.canton.canton, // <-- Alias
                    codigo: parroquia.canton.codigo // <-- Alias
                },
                provincia: {
                    id: parroquia.canton.provincia.id_provincia, // <-- Alias
                    nombre: parroquia.canton.provincia.provincia, // <-- Alias
                    codigo: parroquia.canton.provincia.codigo // <-- Alias
                }
            };
        } catch (error) {
            console.error('Error en getLocationByParroquia:', error);
            throw error;
        }
    }
    // Obtener jerarquía completa (útil para formularios)
    async getFullHierarchy() {
        return await Provincia.findAll({
            include: [
                {
                    model: Canton,
                    as: 'Cantones',
                    include: [
                        {
                            model: Parroquia,
                            as: 'Parroquias',
                            attributes: ['id_parroquia', 'parroquia', 'codigo']
                        }
                    ],
                    attributes: ['id_canton', 'canton', 'codigo']
                }
            ],
            attributes: ['id_provincia', 'provincia', 'codigo'],
            order: [
                ['provincia', 'ASC'],
                [{ model: Canton, as: 'Cantones' }, 'canton', 'ASC'],
                [{ model: Canton, as: 'Cantones' }, { model: Parroquia, as: 'Parroquias' }, 'parroquia', 'ASC']
            ]
        });
    }
}