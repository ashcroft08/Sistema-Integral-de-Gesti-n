import { ClientService } from '../services/client.service.js';

const clientService = new ClientService();

export class ClientController {

    async createClient(req, res) {
        try {
            const clientData = req.validatedData; // Data limpia de Zod
            const newClient = await clientService.createClient(clientData);

            res.status(201).json({
                success: true,
                message: 'Cliente registrado exitosamente.',
                client: newClient
            });
        } catch (error) {
            // Manejo de errores de negocio (Duplicados, validación SRI)
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllClients(req, res) {
        try {
            const clients = await clientService.getAllClients();
            res.status(200).json({
                success: true,
                clients
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateClient(req, res) {
        try {
            const { id } = req.validatedParams;
            const updateData = req.validatedData;

            const updatedClient = await clientService.updateClient(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Cliente actualizado correctamente.',
                client: updatedClient
            });
        } catch (error) {
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getFormCatalogs(req, res) {
        try {
            const catalogs = await clientService.getFormCatalogs();
            res.status(200).json({
                success: true,
                ...catalogs // { types: [], locations: [] }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async changeState(req, res) {
        try {
            const { id } = req.validatedParams;
            const { estado_codigo } = req.validatedData;

            const cliente = await clientService.changeState(id, estado_codigo);

            res.status(200).json({
                success: true,
                message: `Estado del cliente actualizado a: ${cliente.estado_cliente.nombre}`,
                client: cliente
            });
        } catch (error) {
            if (error.message.includes('no encontrado') || error.message.includes('no válido')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            res.status(400).json({ success: false, message: error.message });
        }
    }
}