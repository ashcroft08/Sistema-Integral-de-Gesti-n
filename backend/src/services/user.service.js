// src/services/user.service.js
import bcrypt from 'bcryptjs';
import { Usuario, Rol, EstadoUsuario } from '../models/index.js';
import { Op } from 'sequelize';
import { sendEmail } from './email.service.js';
import { getHtmlTemplate } from '../utils/email.utils.js';
import { ROLES, ESTADOS_USUARIO } from '../constants/codigos.js'; //Importamos las constantes

// Regla de negocio (esto sí puede ser constante numérica, o venir de una tabla de config)
const MAX_ADMINS = 3;

export class UserService {
    // HELPER 1: Obtener ID de Rol dinámicamente por su código inmutable
    async _getRolIdByCode(codigo) {
        const rol = await Rol.findOne({ where: { codigo } });
        if (!rol) throw new Error(`Error de integridad: El rol ${codigo} no existe en la BD.`);
        return rol.id_rol;
    }

    // HELPER 2: Obtener ID de Estado dinámicamente
    async _getEstadoIdByCode(codigo) {
        const estado = await EstadoUsuario.findOne({ where: { codigo } });
        if (!estado) throw new Error(`Error de integridad: El estado ${codigo} no existe en la BD.`);
        return estado.id_estado_usuario;
    }

    /**
     * Crea un nuevo usuario y envía credenciales por correo
     */
    async createUser(userData) {
        try {
            const { nombre, apellido, email, password, id_rol } = userData;

            // 1. Verificar email
            const emailExists = await Usuario.findOne({ where: { email } });
            if (emailExists) throw new Error('El email ya está registrado.');

            // 2. Validar Rol existente
            const role = await Rol.findByPk(id_rol);
            if (!role) throw new Error('El ID de rol proporcionado no es válido.');

            // ✨ 3. LÓGICA DE NEGOCIO: Límite de admins
            // Buscamos dinámicamente cuál es el ID de ADMIN y ACTIVO
            const idRolAdmin = await this._getRolIdByCode(ROLES.ADMINISTRADOR);
            const idEstadoActivo = await this._getEstadoIdByCode(ESTADOS_USUARIO.ACTIVO);

            if (id_rol === idRolAdmin) {
                const adminCount = await Usuario.count({
                    where: {
                        id_rol: idRolAdmin, // Usamos la variable, no el "2"
                        id_estado_usuario: idEstadoActivo // Usamos la variable, no el "1"
                    }
                });
                if (adminCount >= MAX_ADMINS) {
                    throw new Error(`Límite de administradores alcanzado. Solo se permiten ${MAX_ADMINS} administradores activos.`);
                }
            }

            // 4. Password (Generar o usar)
            let userPassword = password;
            if (!userPassword) userPassword = generateRandomPassword(); // Asumo que tienes esta util importada o definida

            const hashedPassword = await bcrypt.hash(userPassword, 10);

            // 5. Estado inicial: Siempre buscamos el ID del estado ACTIVO
            // (Aunque venga null, forzamos activo al crear)
            const defaultEstadoId = await this._getEstadoIdByCode(ESTADOS_USUARIO.ACTIVO);

            const newUser = await Usuario.create({
                ...userData,
                password: hashedPassword,
                id_estado_usuario: userData.id_estado_usuario || defaultEstadoId
            });

            // Retornar sin password
            const { password: _, ...userWithoutPassword } = newUser.toJSON();
            return userWithoutPassword;

            /* Enviar correo con credenciales
            try {
                await this.sendWelcomeEmail(email, nombre, apellido, userPassword, isPasswordGenerated);
            } catch (emailError) {
                console.error('Error al enviar correo de bienvenida:', emailError);
                // No lanzamos error para no interrumpir la creación del usuario
            }*/
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualiza un usuario y envía correo si se cambia la contraseña
     */
    async updateUser(userId, updateData) {
        try {
            const { email, id_rol, password } = updateData;

            const usuario = await Usuario.findByPk(userId);
            if (!usuario) throw new Error('Usuario no encontrado.');

            // 1. Email único
            if (email && email !== usuario.email) {
                const emailExists = await Usuario.findOne({
                    where: { email, id_usuario: { [Op.ne]: userId } }
                });
                if (emailExists) throw new Error('El email ya está en uso por otra cuenta.');
            }

            // ✨ 2. LÓGICA DE ADMINS (Refactorizada)
            const idRolAdmin = await this._getRolIdByCode(ROLES.ADMINISTRADOR);
            const idEstadoActivo = await this._getEstadoIdByCode(ESTADOS_USUARIO.ACTIVO);

            // Caso A: Se intenta promover a alguien a Admin
            if (id_rol && id_rol === idRolAdmin && usuario.id_rol !== idRolAdmin) {
                const adminCount = await Usuario.count({
                    where: { id_rol: idRolAdmin, id_estado_usuario: idEstadoActivo }
                });
                if (adminCount >= MAX_ADMINS) {
                    throw new Error('Límite de administradores alcanzado. No se puede asignar este rol.');
                }
            }

            // 3. Password Logic
            let updateDataProcessed = { ...updateData };
            if (password) {
                // ... tu lógica de hash existente ...
                if (password === 'generate') { /* ... */ }
                else { updateDataProcessed.password = await bcrypt.hash(password, 10); }
            } else {
                delete updateDataProcessed.password;
            }

            await usuario.update(updateDataProcessed);

            // Reload y retorno
            await usuario.reload({ include: [{ model: Rol, attributes: ['rol', 'codigo'] }] });
            const { password: _, ...userClean } = usuario.toJSON();
            return userClean;

            /* ✅ Enviar correos de notificación
            try {
                // Si cambió el email
                if (email && email !== oldEmail) {
                    await this.sendEmailChangedNotification(oldEmail, email, nombre || usuario.nombre);
                }

                // Si se generó nueva contraseña
                if (newPassword) {
                    await this.sendPasswordResetEmail(
                        email || usuario.email,
                        nombre || usuario.nombre,
                        newPassword
                    );
                }
            } catch (emailError) {
                console.error('Error al enviar correos de notificación:', emailError);
            }*/

        } catch (error) {
            throw error;
        }
    }

    /**
     * 1. Bienvenida (Ya lo teníamos, lo incluyo para que esté completo)
     */
    async sendWelcomeEmail(email, nombre, apellido, password, isGenerated = false) {
        const subject = 'Bienvenido al Sistema SIG-KALLARI';
        const loginUrl = `${process.env.FRONTEND_URL}/login`;

        const html = getHtmlTemplate('welcome', {
            nombre: `${nombre} ${apellido}`,
            email,
            password,
            isGenerated,
            loginUrl
        });

        await sendEmail(email, subject, html);
    }

    /**
     * 2. Admin resetea contraseña manualmente
     */
    async sendPasswordResetEmail(email, nombre, newPassword) {
        const subject = 'Sus credenciales han sido actualizadas - SIG KALLARI';
        const loginUrl = `${process.env.FRONTEND_URL}/login`;

        // Usamos la plantilla "notification"
        const html = getHtmlTemplate('notification', {
            titulo: 'Contraseña Actualizada',
            nombre: nombre,
            mensaje: 'Un administrador ha actualizado tu contraseña manualmente. Aquí tienes tu nueva clave de acceso:',
            detalleLabel: 'Nueva Contraseña:',
            detalle: newPassword, // Mostramos la pass
            botonUrl: loginUrl,
            botonTexto: 'Acceder al Sistema',
            advertencia: 'Por seguridad, te recomendamos cambiar esta contraseña después de ingresar.'
        });

        await sendEmail(email, subject, html);
    }

    /**
     * 3. Notificación de cambio de Email (Avisar a la cuenta vieja y nueva)
     */
    async sendEmailChangedNotification(oldEmail, newEmail, nombre) {
        const loginUrl = `${process.env.FRONTEND_URL}/login`;

        // A) Correo al NUEVO email (Confirmación positiva)
        const htmlNew = getHtmlTemplate('notification', {
            titulo: 'Email Actualizado Correctamente',
            nombre: nombre,
            mensaje: 'Tu dirección de correo electrónico asociada a SIG-KALLARI ha sido actualizada.',
            detalleLabel: 'Tu nuevo email de acceso es:',
            detalle: newEmail,
            botonUrl: loginUrl,
            botonTexto: 'Ir al Login'
        });
        await sendEmail(newEmail, 'Email Actualizado - SIG KALLARI', htmlNew);

        // B) Correo al VIEJO email (Alerta de seguridad)
        const htmlOld = getHtmlTemplate('security-alert', {
            titulo: 'Aviso de Seguridad: Cambio de Email',
            nombre: nombre,
            mensaje: 'Se ha modificado la dirección de correo electrónico asociada a tu cuenta SIG-KALLARI.',
            detalle: `El correo ${oldEmail} ha sido desvinculado y reemplazado por ${newEmail}.`
        });
        await sendEmail(oldEmail, 'ALERTA: Cambio de Email en tu cuenta', htmlOld);
    }

    /**
     * 4. Aviso simple de cambio de contraseña (cuando el usuario la cambia él mismo)
     */
    async sendPasswordChangedNotification(email, nombre) {
        const html = getHtmlTemplate('notification', {
            titulo: 'Contraseña Modificada',
            nombre: nombre,
            mensaje: 'Te informamos que tu contraseña de acceso ha sido modificada exitosamente.',
            // No enviamos la contraseña ni botón, solo aviso informativo
            advertencia: 'Si no realizaste este cambio, contacta inmediatamente al administrador.'
        });

        await sendEmail(email, 'Seguridad: Contraseña Modificada', html);
    }

    /**
     * Obtiene todos los usuarios EXCEPTO el usuario logueado y usuarios con id_rol = 1
     */
    async getAllUsers(currentUserId = null) {
        try {
            const idRolSuper = await this._getRolIdByCode(ROLES.SUPERUSUARIO);
            // Construir condiciones de filtro
            const whereConditions = {
                id_rol: {
                    [Op.ne]: idRolSuper
                }
            };

            // Si se proporciona un currentUserId, excluirlo también
            if (currentUserId) {
                whereConditions.id_usuario = {
                    [Op.ne]: currentUserId
                };
            }

            const users = await Usuario.findAll({
                attributes: { exclude: ['password'] },
                where: whereConditions,
                include: [
                    {
                        model: Rol,
                        attributes: ['id_rol', 'rol']
                    },
                    {
                        model: EstadoUsuario,
                        attributes: ['id_estado_usuario', 'estado_usuario', 'codigo'] // ✨ IMPORTANTE: Traemos el código (ESTADO_ACTIVO)
                    }
                ],
                order: [['id_usuario', 'ASC']] // Ordenar por ID
            });

            return users;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene usuario por ID
     */
    async getUserById(userId) {
        try {
            const user = await Usuario.findByPk(userId, {
                attributes: { exclude: ['password'] },
                include: [{
                    model: Rol,
                    attributes: ['rol']
                }]
            });

            if (!user) {
                throw new Error('Usuario no encontrado.');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Elimina un usuario (soft delete)
     * IMPORTANTE: Superusuarios y Administradores NO pueden ser eliminados,
     * solo desactivados para mantener la integridad referencial.
     */
    async deleteUser(userId) {
        try {
            // Incluimos Rol para ver el código
            const usuario = await Usuario.findByPk(userId, {
                include: [{ model: Rol }]
            });

            if (!usuario) throw new Error('Usuario no encontrado.');

            // ✨ VALIDACIÓN ROBUSTA USANDO CÓDIGOS
            const codigoRol = usuario.Rol.codigo;

            if (codigoRol === ROLES.SUPERUSUARIO) {
                throw new Error('El Superusuario no puede ser eliminado.');
            }

            if (codigoRol === ROLES.ADMINISTRADOR) {
                throw new Error('Los administradores no pueden ser eliminados. Debe desactivarlos.');
            }

            await usuario.destroy();
            return { message: 'Usuario eliminado correctamente.' };

        } catch (error) {
            throw error;
        }
    }

    /**
         * Cambiar estado de un usuario
         */
    async changeUserStatus(userId, nuevoEstadoId) { // ✨ CORRECCIÓN 1: Renombrado argumento para coincidir
        try {
            const usuario = await Usuario.findByPk(userId, {
                include: [{ model: Rol }]
            });
            if (!usuario) throw new Error('Usuario no encontrado.');

            // Validar existencia del nuevo estado
            // ✨ CORRECCIÓN 2: Ahora 'nuevoEstadoId' sí existe
            const estadoObj = await EstadoUsuario.findByPk(nuevoEstadoId);
            if (!estadoObj) throw new Error('El ID del estado usuario no es válido.');

            // IDs importantes
            const idRolSuper = await this._getRolIdByCode(ROLES.SUPERUSUARIO);
            const idRolAdmin = await this._getRolIdByCode(ROLES.ADMINISTRADOR);
            const idEstadoActivo = await this._getEstadoIdByCode(ESTADOS_USUARIO.ACTIVO);

            // Nota: idEstadoInactivo no se usaba explícitamente abajo, pero es bueno tenerlo si amplías lógica
            // const idEstadoInactivo = await this._getEstadoIdByCode(ESTADOS_USUARIO.INACTIVO); 

            // ✨ PROTECCIÓN 1: Superusuario
            if (usuario.id_rol === idRolSuper && nuevoEstadoId !== idEstadoActivo) {
                throw new Error('El Superusuario no puede ser desactivado ni bloqueado.');
            }

            // ✨ PROTECCIÓN 2: Último Admin
            if (usuario.id_rol === idRolAdmin && nuevoEstadoId !== idEstadoActivo) {
                const adminActivos = await Usuario.count({
                    where: { id_rol: idRolAdmin, id_estado_usuario: idEstadoActivo }
                });

                if (adminActivos <= 1) {
                    throw new Error('No se puede desactivar el último administrador activo.');
                }
            }

            await usuario.update({ id_estado_usuario: nuevoEstadoId });

            // ✅ Recargar con relaciones
            await usuario.reload({
                include: [
                    { model: Rol, attributes: ['rol'] },
                    { model: EstadoUsuario, attributes: ['estado_usuario', 'codigo'] } // ✨ Agregamos 'codigo'
                ]
            });

            const { password: _, ...userClean } = usuario.toJSON();
            return userClean;

        } catch (error) {
            console.error('❌ Servicio - Error:', error.message);
            throw error;
        }
    }

    /**
     * Cambiar contraseña del usuario
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const usuario = await Usuario.findByPk(userId);
            if (!usuario) {
                throw new Error('Usuario no encontrado.');
            }

            // Verificar contraseña actual
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, usuario.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Contraseña actual incorrecta.');
            }

            // Hashear nueva contraseña
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar contraseña
            await usuario.update({ password: hashedNewPassword });

            /* Enviar correo de notificación
            try {
                await this.sendPasswordChangedNotification(usuario.email, usuario.nombre);
            } catch (emailError) {
                console.error('Error al enviar correo de notificación:', emailError);
            }*/

            return { message: 'Contraseña actualizada exitosamente.' };

        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener lista de estados disponibles para usuarios
     */
    async getUserStatuses() {
        try {
            // Importante: EstadoUsuario debe estar importado arriba
            return await EstadoUsuario.findAll({
                attributes: ['id_estado_usuario', 'estado_usuario', 'codigo']
            });
        } catch (error) {
            throw error;
        }
    }
}