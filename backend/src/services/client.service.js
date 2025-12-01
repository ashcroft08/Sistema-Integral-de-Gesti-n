import { Cliente, TipoIdentificacion, Canton, Provincia } from '../models/index.js';
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
            const { identificacion, email, id_tipo_identificacion } = data;

            // 1. Validación estricta de Cédula/RUC
            await this._validarDocumento(id_tipo_identificacion, identificacion);

            // 2. Verificar duplicados
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

            // 3. Crear
            return await Cliente.create(data);
        } catch (error) {
            throw error;
        }
    }

    async updateClient(id, data) {
        try {
            const client = await Cliente.findByPk(id);
            if (!client) throw new Error('Cliente no encontrado.');

            // 1. Si cambia la identificación, validarla de nuevo
            if (data.identificacion && data.id_tipo_identificacion) {
                await this._validarDocumento(data.id_tipo_identificacion, data.identificacion);
            }

            // 2. Verificar duplicados (excluyendo al cliente actual)
            if (data.identificacion || data.email) {
                const exists = await Cliente.findOne({
                    where: {
                        [Op.and]: [
                            { id_cliente: { [Op.ne]: id } }, // No soy yo
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
            return await Cliente.findAll({
                include: [
                    { model: TipoIdentificacion, attributes: ['tipo_identificacion', 'codigo'] },
                    {
                        model: Canton,
                        attributes: ['canton'],
                        include: [{ model: Provincia, attributes: ['provincia'] }]
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
                    { model: Canton, include: [Provincia] }
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
            const types = await TipoIdentificacion.findAll({
                attributes: ['id_tipo_identificacion', 'tipo_identificacion', 'codigo']
            });

            const locations = await Canton.findAll({
                include: [{ model: Provincia, attributes: ['provincia'] }],
                order: [
                    [Provincia, 'provincia', 'ASC'],
                    ['canton', 'ASC']
                ]
            });

            return { types, locations };
        } catch (error) {
            throw error;
        }
    }
}