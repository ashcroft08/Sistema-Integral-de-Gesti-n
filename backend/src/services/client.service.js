import db, { Cliente, ClienteIdentificacion, TipoIdentificacion, Parroquia, Canton, Provincia, EstadoCliente } from '../models/index.js';
import { Op } from 'sequelize';
import { validarIdentificacion } from '../utils/identificacion.validator.js';

const { sequelize } = db;

export class ClientService {

    async _validarDocumento(idTipo, numeroIdentificacion) {
        const tipoDoc = await TipoIdentificacion.findByPk(idTipo);
        if (!tipoDoc) throw new Error("El tipo de identificación seleccionado no existe.");

        const mapaCodigos = {
            'SRI_RUC': 'RUC',
            'SRI_CEDULA': 'CEDULA',
            'SRI_PASAPORTE': 'PASAPORTE',
            'SRI_CONSUMIDOR_FINAL': 'CONSUMIDOR_FINAL'
        };

        const tipoParaValidar = mapaCodigos[tipoDoc.codigo];
        if (!validarIdentificacion(numeroIdentificacion, tipoParaValidar)) {
            throw new Error(`El número ${numeroIdentificacion} no es válido para el tipo ${tipoDoc.tipo_identificacion}.`);
        }
    }

    async createClient(data, transaction) {
        const t = transaction || await sequelize.transaction();
        try {
            const { identificaciones, id_parroquia, id_estado_cliente, ...clienteData } = data;

            // 1. Validar parroquia
            const parroquiaExiste = await Parroquia.findByPk(id_parroquia, { transaction: t });
            if (!parroquiaExiste) throw new Error("La ubicación (parroquia) seleccionada no es válida.");

            // 2. Si no se envió estado, usar ACTIVO por defecto
            let estadoId;
            if (id_estado_cliente) {
                const estadoExiste = await EstadoCliente.findByPk(id_estado_cliente, { transaction: t });
                if (!estadoExiste) throw new Error("El estado de cliente no es válido.");
                estadoId = id_estado_cliente;
            } else {
                const estadoActivo = await EstadoCliente.findOne({
                    where: { codigo: 'CLIENTE_ACTIVO' },
                    transaction: t
                });
                if (!estadoActivo) throw new Error("No se encontró el estado 'CLIENTE_ACTIVO'.");
                estadoId = estadoActivo.id_estado_cliente;
            }

            // 3. Crear cliente con estado correcto
            const cliente = await Cliente.create({
                ...clienteData,
                id_parroquia,
                id_estado_cliente: estadoId
            }, { transaction: t });

            // 4. Crear identificaciones
            for (const ident of identificaciones) {
                await this._validarDocumento(ident.id_tipo_identificacion, ident.identificacion);

                await ClienteIdentificacion.create({
                    id_cliente: cliente.id_cliente,
                    id_tipo_identificacion: ident.id_tipo_identificacion,
                    identificacion: ident.identificacion,
                    es_principal: ident.es_principal
                }, { transaction: t });
            }

            await t.commit();
            return cliente;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async updateClient(id, data) {
        const t = await sequelize.transaction();
        try {
            const { identificaciones, id_parroquia, id_estado_cliente, ...clienteData } = data;

            const cliente = await Cliente.findByPk(id, { transaction: t });
            if (!cliente) throw new Error("Cliente no encontrado");

            if (id_parroquia) {
                const parroquiaExiste = await Parroquia.findByPk(id_parroquia, { transaction: t });
                if (!parroquiaExiste) throw new Error("La ubicación (parroquia) no es válida.");
            }

            if (id_estado_cliente) {
                const estadoExiste = await EstadoCliente.findByPk(id_estado_cliente, { transaction: t });
                if (!estadoExiste) throw new Error("El estado de cliente no es válido.");
            }

            // Actualizar datos del cliente
            await cliente.update(clienteData, { transaction: t });

            // Reemplazar identificaciones
            await ClienteIdentificacion.destroy({ where: { id_cliente: id }, transaction: t });
            for (const ident of identificaciones) {
                await this._validarDocumento(ident.id_tipo_identificacion, ident.identificacion);

                await ClienteIdentificacion.create({
                    id_cliente: cliente.id_cliente,
                    id_tipo_identificacion: ident.id_tipo_identificacion,
                    identificacion: ident.identificacion,
                    es_principal: ident.es_principal
                }, { transaction: t });
            }

            await t.commit();
            return cliente;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async getAllClients() {
        return await Cliente.findAll({
            include: [
                { model: ClienteIdentificacion, include: [{ model: TipoIdentificacion }] },
                {
                    model: Parroquia,
                    as: 'parroquia',
                    include: [{
                        model: Canton,
                        as: 'canton',
                        include: [{ model: Provincia, as: 'provincia' }]
                    }]
                },
                { model: EstadoCliente, as: 'estado_cliente' }
            ],
            order: [['id_cliente', 'DESC']]
        });
    }

    async getClientById(id) {
        const cliente = await Cliente.findByPk(id, {
            include: [
                { model: ClienteIdentificacion, include: [{ model: TipoIdentificacion }] },
                {
                    model: Parroquia,
                    as: 'parroquia',
                    include: [{
                        model: Canton,
                        as: 'canton',
                        include: [{ model: Provincia, as: 'provincia' }]
                    }]
                },
                { model: EstadoCliente, as: 'estado_cliente' }
            ]
        });
        if (!cliente) throw new Error("Cliente no encontrado");
        return cliente;
    }

    async getFormCatalogs() {
        const tipos = await TipoIdentificacion.findAll({
            where: { codigo: { [Op.ne]: 'SRI_CONSUMIDOR_FINAL' } },
            order: [['tipo_identificacion', 'ASC']]
        });

        return { tipos: tipos.map(t => t.toJSON()) };
    }

    // Cambia el estado del cliente
    async changeState(id, codigoEstado) {
        try {
            // Buscar cliente
            const cliente = await Cliente.findByPk(id);
            if (!cliente) throw new Error("Cliente no encontrado");

            // Buscar estado por código
            const estado = await EstadoCliente.findOne({ where: { codigo: codigoEstado } });
            if (!estado) throw new Error("Estado no válido");

            // Actualizar estado
            await cliente.update({ id_estado_cliente: estado.id_estado_cliente });

            // Recargar para obtener la asociación
            await cliente.reload({ include: [{ model: EstadoCliente, as: 'estado_cliente' }] });

            return cliente;
        } catch (error) {
            throw error;
        }
    }
}