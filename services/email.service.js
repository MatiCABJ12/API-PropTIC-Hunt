import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const enviarCodigoRecuperacion = async (mail, nombre, token) => {
  await transporter.sendMail({
    from: `"PropTIC-Hunt" <${process.env.GMAIL_USER}>`,
    to: mail,
    subject: "Recuperar contraseña - PropTIC-Hunt",
    html: `
      <p>Hola ${nombre},</p>
      <p>Este es tu código para restablecer tu contraseña (válido por 15 minutos):</p>
      <h2>${token}</h2>
      <p>Si no pediste esto, ignorá este mail.</p>
    `,
  });
};

export default { enviarCodigoRecuperacion };