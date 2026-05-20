// src/services/userSettings.service.js
import bcrypt from 'bcryptjs';
import { Usuario, Rol } from '../models/index.js';
import { Op } from 'sequelize';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';

export class UserSettingsService {
    /**
     * Obtener perfil del usuario
     */
    async getUserProfile(userId) {
        console.log('🔍 Buscando usuario con ID:', userId);

        const usuario = await Usuario.findOne({
            where: { id_usuario: userId },
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Rol,
                    attributes: ['id_rol', 'rol']
                }
            ]
        });

        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado.');
        }

        return usuario;
    }

    /**
     * Actualizar perfil del usuario
     */
    async updateProfile(userId, profileData) {
        const { nombre, apellido, email } = profileData;

        // Buscar usuario
        const usuario = await Usuario.findByPk(userId);
        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado.');
        }

        // Verificar si el email ya existe (excluyendo al usuario actual)
        if (email && email !== usuario.email) {
            const emailExists = await Usuario.findOne({
                where: {
                    email: email,
                    id_usuario: { [Op.ne]: userId }
                }
            });

            if (emailExists) {
                throw new ConflictError('El email ya está en uso por otra cuenta.');
            }
        }

        // Preparar datos para actualizar
        const updateFields = {};
        if (nombre !== undefined) updateFields.nombre = nombre;
        if (apellido !== undefined) updateFields.apellido = apellido;
        if (email !== undefined) updateFields.email = email;

        // Actualizar usuario
        await usuario.update(updateFields);

        // Recargar con relaciones
        await usuario.reload({
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Rol,
                    attributes: ['id_rol', 'rol']
                }
            ]
        });

        return usuario;
    }

    /**
     * Cambiar contraseña del usuario
     */
    async changePassword(userId, passwordData) {
        const { currentPassword, newPassword } = passwordData;

        // Buscar usuario
        const usuario = await Usuario.findByPk(userId);
        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado.');
        }

        // Verificar contraseña actual
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, usuario.password);
        if (!isCurrentPasswordValid) {
            throw new ValidationError('La contraseña actual es incorrecta.');
        }

        // Verificar que la nueva contraseña no sea igual a la actual
        const isSamePassword = await bcrypt.compare(newPassword, usuario.password);
        if (isSamePassword) {
            throw new ValidationError('La nueva contraseña no puede ser igual a la actual.');
        }

        // Hashear nueva contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña y resetear primer_ingreso si es necesario
        const updateData = {
            password: hashedNewPassword,
            primer_ingreso: false // Ya no es primer ingreso después de cambiar contraseña
        };

        await usuario.update(updateData);

        return {
            message: 'Contraseña actualizada exitosamente.',
            primer_ingreso: false
        };
    }

    /**
     * Actualizar configuración completa (perfil y/o contraseña)
     */
    async updateUserSettings(userId, settingsData) {
        const results = {};

        // Actualizar perfil si se proporciona
        if (settingsData.profile) {
            results.profile = await this.updateProfile(userId, settingsData.profile);
        }

        // Cambiar contraseña si se proporciona
        if (settingsData.password) {
            results.password = await this.changePassword(userId, settingsData.password);
        }

        return results;
    }
}