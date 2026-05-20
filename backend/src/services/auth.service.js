import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario, Rol, ConfiguracionToken, ConfiguracionBloqueo, EstadoUsuario } from '../models/index.js';
import { sendEmail } from './email.service.js';
import { getHtmlTemplate } from '../utils/email.utils.js';
import { ESTADOS_USUARIO, ROLES } from '../constants/codigos.js';
import { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, AppError } from '../utils/errors.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

export class AuthService {
    // Helper privado: Obtiene el ID numérico a partir del código inmutable
    async _getIdEstadoByCodigo(codigo) {
        const estado = await EstadoUsuario.findOne({ where: { codigo } });
        if (!estado) throw new AppError(`Estado de sistema no configurado: ${codigo}`, 500);
        return estado.id_estado_usuario;
    }

    async getCurrentUser(userId) {
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
            throw new NotFoundError('Usuario no encontrado');
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
            primer_ingreso: usuario.primer_ingreso,
            creado_en: usuario.creado_en,
            actualizado_en: usuario.actualizado_en
        };
    }

    async login(email, password) {
        // 1. Obtener la configuración de bloqueo y de token
        const configBloqueo = await ConfiguracionBloqueo.findByPk(1);
        const configToken = await ConfiguracionToken.findByPk(1);

        const MAX_INTENTOS = configBloqueo ? configBloqueo.intentos_maximos : 3;
        const DURACION_BLOQUEO_MIN = configBloqueo ? configBloqueo.duracion_bloqueo_minutos : 15;
        const TIEMPO_EXPIRACION = configToken ? configToken.tiempo_expiracion : '1h';

        const duracionBloqueoMS = DURACION_BLOQUEO_MIN * 60 * 1000;

        // 2. Buscar al usuario
        const usuario = await Usuario.findOne({
            where: { email },
            include: [
                { model: Rol, attributes: ['rol', 'codigo'] },
                { model: EstadoUsuario, attributes: ['estado_usuario', 'codigo'] }
            ]
        });

        if (!usuario) throw new UnauthorizedError('Credenciales inválidas');

        const codigoEstadoActual = usuario.EstadoUsuario.codigo;

        // 3. Verificar si está BLOQUEADO
        if (codigoEstadoActual === ESTADOS_USUARIO.BLOQUEADO) {
            const horaActual = new Date();
            const tiempoBloqueo = new Date(usuario.tiempo_bloqueo);

            if (horaActual - tiempoBloqueo < duracionBloqueoMS) {
                const tiempoRestanteMs = duracionBloqueoMS - (horaActual - tiempoBloqueo);
                const minutosRestantes = Math.ceil(tiempoRestanteMs / 60000);
                throw new ForbiddenError(`Cuenta bloqueada. Intenta de nuevo en ${minutosRestantes} ${minutosRestantes > 1 ? 'minutos' : 'minuto'}.`);
            } else {
                // Desbloquear: Buscar ID del estado Activo
                usuario.id_estado_usuario = await this._getIdEstadoByCodigo(ESTADOS_USUARIO.ACTIVO);
                usuario.intentos_fallidos = 0;
                usuario.tiempo_bloqueo = null;
                await usuario.save();
            }
        }

        // 4. Verificar si está INACTIVO
        if (codigoEstadoActual === ESTADOS_USUARIO.INACTIVO) {
            throw new ForbiddenError('Cuenta inactiva. Comuníquese con el administrador.');
        }

        // 5. Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, usuario.password);

        if (!isPasswordValid) {
            usuario.intentos_fallidos++;

            if (usuario.intentos_fallidos >= MAX_INTENTOS) {
                const idBloqueado = await this._getIdEstadoByCodigo(ESTADOS_USUARIO.BLOQUEADO);
                usuario.id_estado_usuario = idBloqueado;
                usuario.tiempo_bloqueo = new Date();
                await usuario.save();
                throw new ForbiddenError('Cuenta bloqueada. Has superado el número de intentos.');
            }

            await usuario.save();

            const intentosRestantes = MAX_INTENTOS - usuario.intentos_fallidos;
            throw new UnauthorizedError(`Credenciales inválidas. Te quedan ${intentosRestantes} ${intentosRestantes === 1 ? 'intento' : 'intentos'}.`);
        }

        // 6. Primer ingreso
        if (usuario.primer_ingreso === true) {
            const payload = { id: usuario.id_usuario, type: 'FIRST_LOGIN' };
            const tempToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });

            return {
                code: 'FORCE_CHANGE_PASSWORD',
                message: 'Inicio de sesión por primera vez. Debes cambiar tu contraseña.',
                tempToken: tempToken
            };
        }

        // 7. Éxito: Resetear contadores
        usuario.intentos_fallidos = 0;
        if (usuario.EstadoUsuario.codigo !== ESTADOS_USUARIO.ACTIVO) {
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

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TIEMPO_EXPIRACION });

        return {
            token,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                id_rol: usuario.id_rol,
                rol: usuario.Rol.rol,
                rol_codigo: usuario.Rol.codigo
            }
        };
    }

    async completeFirstPasswordChange(userId, newPassword) {
        const usuario = await Usuario.findByPk(userId, {
            include: [{ model: Rol }]
        });
        if (!usuario) throw new NotFoundError('Usuario no encontrado.');

        const isSamePassword = await bcrypt.compare(newPassword, usuario.password);
        if (isSamePassword) throw new ValidationError('La nueva contraseña no puede ser igual a la anterior.');

        usuario.password = await bcrypt.hash(newPassword, 10);
        usuario.primer_ingreso = false;
        usuario.intentos_fallidos = 0;
        usuario.id_estado_usuario = await this._getIdEstadoByCodigo(ESTADOS_USUARIO.ACTIVO);

        await usuario.save();

        const payload = {
            id: usuario.id_usuario,
            id_rol: usuario.id_rol,
            rol_codigo: usuario.Rol.codigo
        };

        const configToken = await ConfiguracionToken.findByPk(1);
        const token = jwt.sign(payload, JWT_SECRET, {
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
                rol_codigo: usuario.Rol.codigo
            }
        };
    }

    async forgotPassword(email) {
        try {
            const usuario = await Usuario.findOne({ where: { email } });

            // Seguridad silenciosa: Si no existe, no hacemos nada pero respondemos OK al front
            if (!usuario) {
                console.log(`[Auth] Intento de restablecer la contraseña para email no existente: ${email}`);
                return;
            }

            // Crear Token (15 min de vida)
            const payload = { id: usuario.id_usuario };
            const token = jwt.sign(payload, JWT_RESET_SECRET, { expiresIn: '15m' });

            // URL del Frontend donde el usuario pondrá su nueva pass
            const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;

            // GENERAR EL HTML PROFESIONAL
            const html = getHtmlTemplate('reset-password', {
                nombre: usuario.nombre,
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

    async resetPassword(token, newPassword) {
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_RESET_SECRET);
        } catch (err) {
            throw new ValidationError('El enlace de recuperación es inválido o ha expirado.');
        }

        const usuario = await Usuario.findByPk(decoded.id, {
            include: [
                { model: Rol },
                { model: EstadoUsuario }
            ]
        });
        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado.');
        }

        const isSamePassword = await bcrypt.compare(newPassword, usuario.password);
        if (isSamePassword) {
            throw new ValidationError('La nueva contraseña no puede ser igual a la anterior.');
        }

        usuario.password = await bcrypt.hash(newPassword, 10);
        usuario.intentos_fallidos = 0;
        usuario.tiempo_bloqueo = null;
        usuario.id_estado_usuario = await this._getIdEstadoByCodigo(ESTADOS_USUARIO.ACTIVO);

        await usuario.save();

        return { message: 'Contraseña restablecida exitosamente.' };
    }
}