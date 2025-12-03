import { Cliente, TipoIdentificacion, Parroquia, Canton, Provincia } from '../models/index.js';
import { Op } from 'sequelize';
import { validarIdentificacion } from '../utils/identificacion.validator.js';

export class ClientService {

    // Helper para validar identificación usando BD + Algoritmo
    async _validarDocumento(idTipo, numeroIdentificacion) {
        // 1. Buscar qué tipo es en la BD (ej. SRI_RUC)
        const tipoDoc = await TipoIdentificacion.findByPk(idTipo);
        if (!tipoDoc) throw new Error("El tipo de identificación seleccionado no existe.");

        // 2. Mapear códigos de BD a tipos del validador
        const mapaCodigos = {
            'SRI_RUC': 'RUC',
            'SRI_CEDULA': 'CEDULA',
            'SRI_PASAPORTE': 'PASAPORTE',
            'SRI_CONSUMIDOR_FINAL': 'CONSUMIDOR_FINAL'
        };

        const tipoParaValidar = mapaCodigos[tipoDoc.codigo];

        // 3. Ejecutar validación matemática
        if (!validarIdentificacion(numeroIdentificacion, tipoParaValidar)) {
            throw new Error(`El número ${numeroIdentificacion} no es válido para el tipo ${tipoDoc.tipo_identificacion}.`);
        }
    }

    async createClient(data) {
        try {
            // Desestructuramos para validar explícitamente
            const { identificacion, email, id_tipo_identificacion, id_parroquia } = data;

            // 1. Validar Documento (Algoritmo Ecuador)
            await this._validarDocumento(id_tipo_identificacion, identificacion);

            // 2. ✨ VALIDACIÓN NUEVA: Verificar que la Parroquia existe
            const parroquiaExiste = await Parroquia.findByPk(id_parroquia);
            if (!parroquiaExiste) {
                throw new Error("La ubicación (parroquia) seleccionada no es válida.");
            }

            // 3. Verificar duplicados
            const existingClient = await Cliente.findOne({
                where: {
                    [Op.or]: [
                        { identificacion: identificacion },
                        { email: email }
                    ]
                }
            });

            if (existingClient) {
                if (existingClient.identificacion === identificacion) throw new Error(`Ya existe un cliente con la identificación ${identificacion}.`);
                if (existingClient.email === email) throw new Error(`El correo ${email} ya está registrado.`);
            }

            // 4. Crear (Sequelize mapeará id_parroquia automáticamente del objeto data)
            return await Cliente.create(data);

        } catch (error) {
            throw error;
        }
    }

    async updateClient(id, data) {
        try {
            const client = await Cliente.findByPk(id);
            if (!client) throw new Error('Cliente no encontrado.');

            // 1. Si cambia la parroquia, validamos que exista
            if (data.id_parroquia) {
                const parroquiaExiste = await Parroquia.findByPk(data.id_parroquia);
                if (!parroquiaExiste) throw new Error("La ubicación (parroquia) seleccionada no es válida.");
            }

            // 2. Si cambia la identificación, validarla matemáticamente
            if (data.identificacion && data.id_tipo_identificacion) {
                await this._validarDocumento(data.id_tipo_identificacion, data.identificacion);
            } else if (data.identificacion) {
                // Si solo cambia el número pero no el tipo, usamos el tipo que ya tenía
                await this._validarDocumento(client.id_tipo_identificacion, data.identificacion);
            }

            // 3. Verificar duplicados
            if (data.identificacion || data.email) {
                const exists = await Cliente.findOne({
                    where: {
                        [Op.and]: [
                            { id_cliente: { [Op.ne]: id } },
                            {
                                [Op.or]: [
                                    { identificacion: data.identificacion || '' },
                                    { email: data.email || '' }
                                ]
                            }
                        ]
                    }
                });
                if (exists) throw new Error('La identificación o correo ya pertenecen a otro cliente.');
            }

            await client.update(data);
            return client;
        } catch (error) {
            throw error;
        }
    }

    async getAllClients() {
        try {
            // Cambiar 'Parroquia' por 'parroquia' (el alias)
            // Cambiar 'Canton' por 'canton' (el alias)
            // Cambiar 'Provincia' por 'provincia' (el alias)
            return await Cliente.findAll({
                include: [
                    { model: TipoIdentificacion, attributes: ['tipo_identificacion', 'codigo'] },
                    {
                        // Alias definido en Cliente.belongsTo(Parroquia, { as: 'parroquia' })
                        model: Parroquia,
                        as: 'parroquia', // <-- Agregar 'as'
                        attributes: ['parroquia'],
                        include: [{
                            // Alias definido en Parroquia.belongsTo(Canton, { as: 'canton' })
                            model: Canton,
                            as: 'canton', // <-- Agregar 'as'
                            attributes: ['canton'],
                            include: [
                                // Alias definido en Canton.belongsTo(Provincia, { as: 'provincia' })
                                {
                                    model: Provincia,
                                    as: 'provincia', // <-- Agregar 'as'
                                    attributes: ['provincia']
                                }
                            ]
                        }]
                    }
                ],
                order: [['apellido', 'ASC']]
            });
        } catch (error) {
            throw error;
        }
    }

    async getClientById(id) {
        try {
            const client = await Cliente.findByPk(id, {
                include: [
                    { model: TipoIdentificacion },
                    {
                        // Alias definido en Cliente.belongsTo(Parroquia, { as: 'parroquia' })
                        model: Parroquia,
                        as: 'parroquia', // <-- Agregar 'as'
                        include: [{
                            // Alias definido en Parroquia.belongsTo(Canton, { as: 'canton' })
                            model: Canton,
                            as: 'canton', // <-- Agregar 'as'
                            include: [
                                // Alias definido en Canton.belongsTo(Provincia, { as: 'provincia' })
                                {
                                    model: Provincia,
                                    as: 'provincia' // <-- Agregar 'as'
                                }
                            ]
                        }]
                    }
                ]
            });
            if (!client) throw new Error('Cliente no encontrado');
            return client;
        } catch (error) {
            throw error;
        }
    }


    // Obtener catálogos para llenar los Selects del Frontend
    async getFormCatalogs() {
        try {
            // Solo devolvemos tipos de identificación
            // Las ubicaciones ahora se cargan desde /api/locations
            const types = await TipoIdentificacion.findAll({
                attributes: ['id_tipo_identificacion', 'tipo_identificacion', 'codigo'],
                order: [['tipo_identificacion', 'ASC']]
            });

            return {
                types: types.map(t => t.toJSON())
            };
        } catch (error) {
            throw error;
        }
    }
}