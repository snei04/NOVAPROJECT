import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Carga las variables de entorno del archivo .env
dotenv.config();

// Configura el "transporter" con los datos de tu proveedor SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true, // true para el puerto 465 de Gmail
  auth: {
    user: process.env.MAIL_USER, // tu correo de gmail
    pass: process.env.MAIL_PASS, // tu contraseña de aplicación
  },
});

/**
 * Envía un correo electrónico.
 * @param {string} to - El destinatario del correo.
 * @param {string} subject - El asunto del correo.
 * @param {string} html - El cuerpo del correo en formato HTML.
 */
export const sendMail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Novaproject" <${process.env.MAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };

    // Envía el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};