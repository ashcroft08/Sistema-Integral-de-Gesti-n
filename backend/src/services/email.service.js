import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// 1. Configurar el "transporter" (el servicio que envía)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,   // smtp.gmail.com
    port: process.env.EMAIL_PORT,   // 465
    secure: true, // ⚠️ ¡IMPORTANTE! true para el puerto 465 (SSL)
    auth: {
        user: process.env.EMAIL_USER, // tu-correo@gmail.com
        pass: process.env.EMAIL_PASS, // tu contraseña de 16 letras
    },
});

/**
 * Función para enviar correos.
 * @param {string} to - Email del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} html - Contenido del correo en HTML
 */
export const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"SIG-KALLARI" <${process.env.EMAIL_USER}>`,// De quién
            to: to, // Para quién
            subject: subject, // Asunto
            html: html, // Cuerpo en HTML
        });

        console.log(`✅ Email enviado a: ${to}`);
        // Cuando usas Ethereal, Nodemailer imprime una URL en la consola
        // para ver el correo enviado. ¡Búscala!

    } catch (error) {
        console.error(`Error al enviar email: ${error.message}`);
    }
};