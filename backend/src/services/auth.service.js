import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario, Rol, ConfiguracionToken, ConfiguracionBloqueo, EstadoUsuario } from '../models/index.js';
import { sendEmail } from './email.service.js';
import { getHtmlTemplate } from '../utils/email.utils.js';
import { ESTADOS_USUARIO, ROLES } from '../constants/codigos.js'; // Importamos constantes


import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

export class AuthService {
    // Helper privado: Obtiene el ID numérico a partir del código inmutable
    // Esto es vital para hacer updates (ej: usuario.id_estado_usuario = id_bloqueado)
    async _getIdEstadoByCodigo(codigo) {
        const estado = await EstadoUsuario.findOne({ where: { codigo } });
        if (!estado) throw new Error(`Estado de sistema no configurado: ${codigo}`);
        return estado.id_estado_usuario;
    }

    async getCurrentUser(userId) {
        try {
            const usuario = await Usuario.findByPk(userId, {
                include: [
                    {
                        model: Rol,
                        attributes: ['id_rol', 'rol', 'codigo']
                    },
                    {
                        model: EstadoUsuario,
                        attributes: ['id_estado_usuario', 'estado_usuario', 'codigo']
                    }
                ],
                attributes: {
                    exclude: ['password', 'resetPasswordToken', 'primer_ingreso', 'intentos_fallidos', 'tiempo_bloqueo']
                }
            });

            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }

            return {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono,
                id_rol: usuario.id_rol,
                rol: usuario.Rol.rol,
                rol_codigo: usuario.Rol.codigo,
                id_estado_usuario: usuario.id_estado_usuario,
                estado_usuario: usuario.EstadoUsuario.estado_usuario,
                estado_codigo: usuario.EstadoUsuario.codigo,
                primer_ingreso: usuario.primer_ingreso, // Opcional: si lo necesitas en el front
                creado_en: usuario.creado_en,
                actualizado_en: usuario.actualizado_en
            };

        } catch (error) {
            console.error('Error en AuthService.getCurrentUser:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            // 1. Obtener la configuración de bloqueo y de token
            // Asumimos que ambas configuraciones tienen id = 1
            const configBloqueo = await ConfiguracionBloqueo.findByPk(1);
            const configToken = await ConfiguracionToken.findByPk(1);

            // Valores por defecto si no están en la BD
            const MAX_INTENTOS = configBloqueo ? configBloqueo.intentos_maximos : 3;
            const DURACION_BLOQUEO_MIN = configBloqueo ? configBloqueo.duracion_bloqueo_minutos : 15;
            const TIEMPO_EXPIRACION = configToken ? configToken.tiempo_expiracion : '1h';

            // Convertir duración a milisegundos
            const duracionBloqueoMS = DURACION_BLOQUEO_MIN * 60 * 1000;

            // 2. Buscar al usuario
            const usuario = await Usuario.findOne({
                where: { email },
                include: [
                    { model: Rol, attributes: ['rol', 'codigo'] }, // ✨ Traemos el código
                    { model: EstadoUsuario, attributes: ['estado_usuario', 'codigo'] } // ✨ Traemos el código
                ]
            });

            if (!usuario) throw new Error('Credenciales inválidas');

            // Extraemos el código del estado actual para comparar semánticamente
            const codigoEstadoActual = usuario.EstadoUsuario.codigo;

            // 3. Verificar si está BLOQUEADO usando constante
            if (codigoEstadoActual === ESTADOS_USUARIO.BLOQUEADO) {
                const horaActual = new Date();
                const tiempoBloqueo = new Date(usuario.tiempo_bloqueo);

                if (horaActual - tiempoBloqueo < duracionBloqueoMS) {
                    const tiempoRestanteMs = duracionBloqueoMS - (horaActual - tiempoBloqueo);
                    const minutosRestantes = Math.ceil(tiempoRestanteMs / 60000);
                    throw new Error(`Cuenta bloqueada. Intenta de nuevo en ${minutosRestantes} ${minutosRestantes > 1 ? 'minutos' : 'minuto'}.`);
                } else {
                    // Desbloquear: Buscar ID del estado Activo dinámicamente
                    usuario.id_estado_usuario = await this._getIdEstadoByCodigo(ESTADOS_USUARIO.ACTIVO);
                    usuario.intentos_fallidos = 0;
                    usuario.tiempo_bloqueo = null;
                    await usuario.save();
                }
            }

            // 4. Verificar si está INACTIVO
            if (codigoEstadoActual === ESTADOS_USUARIO.INACTIVO) {
                throw new Error('Cuenta inactiva. Comuníquese con el administrador.');
            }

            // 5. Verificar la contraseña
            const isPasswordValid = await bcrypt.compare(password, usuario.password);

            if (!isPasswordValid) {
                // Contraseña incorrecta, incrementar intentos
                usuario.intentos_fallidos++;

                // Verificar si se alcanzó el límite de intentos dinámico
                if (usuario.intentos_fallidos >= MAX_INTENTOS) {
                    usuario.id_estado_usuario = 3; // Bloquear la cuenta
                    usuario.tiempo_bloqueo = new Date(); // Establecer el tiempo de bloqueo
                    await usuario.save();
                    throw new Error('Cuenta bloqueada. Has superado el número de intentos.');
                }

                await usuario.save(); // Guarda el incremento de intentos fallidos

                // ⚠️ FIX: Mensaje de error corregido y dinámico
                const intentosRestantes = MAX_INTENTOS - usuario.intentos_fallidos;
                throw new Error(`Credenciales inválidas. Te quedan ${intentosRestantes} ${intentosRestantes === 1 ? 'intento' : 'intentos'}.`);
            }

            // 6. Primer ingreso
            if (usuario.primer_ingreso === true) {
                const payload = { id: usuario.id_usuario, type: 'FIRST_LOGIN' };
                const tempToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10m' });

                return {
                    code: 'FORCE_CHANGE_PASSWORD',
                    message: 'Inicio de sesión por primera vez. Debes cambiar tu contraseña.',
                    tempToken: tempToken
                };
            }

            // 7. Éxito: Resetear contadores y asegurar estado activo
            usuario.intentos_fallidos = 0;
            // ✨ Solo hacemos update si no estaba activo por alguna razón extraña
            if (codigoEstadoActual !== ESTADOS_USUARIO.ACTIVO) {
                usuario.id_estado_usuario = await this._getIdEstadoByCodigo(ESTADOS_USUARIO.ACTIVO);
            }
            usuario.tiempo_bloqueo = null;
            await usuario.save();

            // 8. Generar Token
            const payload = {
                id: usuario.id_usuario,
                id_rol: usuario.id_rol,
                rol_codigo: usuario.Rol.codigo
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TIEMPO_EXPIRACION });

            // 9. Retornar info
            return {
                token,
                usuario: {
                    id: usuario.id_usuario,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    email: usuario.email,
                    id_rol: usuario.id_rol,
                    rol: usuario.Rol.rol,      // Nombre bonito (Admin)
                    rol_codigo: usuario.Rol.codigo // ✨ Código lógico (ROL_ADMIN) -> Para el Frontend
                }
            };

        } catch (error) {
            // Re-lanzamos el error para que el controlador lo atrape
            throw error;
        }
    }

    /**
     * Completa el primer ingreso cambiando la contraseña
     * y desactivando el flag 'primer_ingreso'.
     * @param {number} userId - ID del usuario (viene del tempToken)
     * @param {string} newPassword - Nueva contraseña
     */
    async completeFirstPasswordChange(userId, newPassword) {
        try {
            const usuario = await Usuario.findByPk(userId, {
                include: [{ model: Rol }]
            });
            if (!usuario) throw new Error('Usuario no encontrado.');

            const isSamePassword = await bcrypt.compare(newPassword, usuario.password);
            if (isSamePassword) throw new Error('La nueva contraseña no puede ser igual a la anterior.');

            usuario.password = await bcrypt.hash(newPassword, 10);
            usuario.primer_ingreso = false;
            usuario.intentos_fallidos = 0;
            // ✨ Usar helper
            usuario.id_estado_usuario = await this._getIdEstadoByCodigo(ESTADOS_USUARIO.ACTIVO);

            await usuario.save();

            const payload = {
                id: usuario.id_usuario,
                id_rol: usuario.id_rol,
                rol_codigo: usuario.Rol.codigo
            };

            const configToken = await ConfiguracionToken.findByPk(1); // Asumiendo config singleton
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: configToken ? configToken.tiempo_expiracion : '1h'
            });

            return {
                code: 'LOGIN_SUCCESS',
                token,
                usuario: {
                    id: usuario.id_usuario,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    id_rol: usuario.id_rol,
                    rol: usuario.Rol.rol,
                    rol_codigo: usuario.Rol.codigo // ✨
                }
            };

        } catch (error) {
            throw error;
        }
    }

    /**
     * Solicita un reseteo de contraseña.
     * @param {string} email - Email del usuario.
     */
    async forgotPassword(email) {
        try {
            const usuario = await Usuario.findOne({ where: { email } });

            // 3. ¡Importante por seguridad!
            // NUNCA le digas al cliente si el email existe o no.
            // Simplemente envía una respuesta 200 OK y, si el usuario existe,
            // envías el correo "en silencio".
            if (!usuario) {
                // No lanzamos error, solo retornamos.
                console.log(`Solicitud de reseteo para email no existente: ${email}`);
                return;
            }

            // 4. Crear un token JWT especial, de corta duración (ej: 15 minutos)
            const payload = { id: usuario.id_usuario };
            const token = jwt.sign(payload, JWT_RESET_SECRET, {
                expiresIn: '15m' // ¡Debe ser corto!
            });

            // 5. Construir el enlace que irá en el correo
            const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

            // 6. Definir el cuerpo del email
            const emailBody = `
                <h2>Recuperación de Contraseña</h2>
                <p>Has solicitado un cambio de contraseña. Haz clic en el siguiente enlace para continuar:</p>
                <a href="${resetLink}" target="_blank">Restablecer mi contraseña</a>
                <p>Si no solicitaste esto, ignora este correo. El enlace expira en 15 minutos.</p>
            `;

            // 7. Enviar el correo
            await sendEmail(usuario.email, 'Recuperación de Contraseña', emailBody);

        } catch (error) {
            // Manejamos errores internos, pero no lanzamos al controlador
            // para no exponer información.
            console.error('Error en forgotPassword service:', error);
        }
    }

    /**
     * Resetea la contraseña usando un token válido.
     * @param {string} token - El token JWT de reseteo
     * @param {string} newPassword - La nueva contraseña en texto plano
     */
    async forgotPassword(email) {
        try {
            const usuario = await Usuario.findOne({ where: { email } });

            // Seguridad silenciosa: Si no existe, no hacemos nada pero respondemos OK al front
            if (!usuario) {
                console.log(`[Auth] Intento de restablecer la contraeña para email no existente: ${email}`);
                return;
            }

            // Crear Token (15 min de vida)
            const payload = { id: usuario.id_usuario };
            const token = jwt.sign(payload, process.env.JWT_RESET_SECRET, { expiresIn: '15m' });

            // URL del Frontend donde el usuario pondrá su nueva pass
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

            // GENERAR EL HTML PROFESIONAL
            const html = getHtmlTemplate('reset-password', {
                nombre: usuario.nombre, // Asegúrate de que tu modelo tenga 'nombre'
                resetUrl: resetUrl
            });

            // Enviar
            await sendEmail(usuario.email, 'Recuperación de Contraseña - SIG KALLARI', html);
            console.log(`[Auth] Correo de recuperación enviado a ${email}`);

        } catch (error) {
            console.error('[Auth] Error en forgotPassword:', error);
            // No lanzamos error al controller para no revelar info del sistema
        }
    }
}