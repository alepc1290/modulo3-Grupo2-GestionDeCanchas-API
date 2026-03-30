import nodemailer from "nodemailer";
import {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  BACKEND_URL,
  FRONT_URL,
} from "../config/env.js";

// Crea el transporter reutilizable
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: Number(EMAIL_PORT) === 465, // true para 465, false para 587
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Envía el email de verificación al usuario recién registrado.
 * @param {string} toEmail   - Email del destinatario
 * @param {string} nombre    - Nombre del usuario
 * @param {string} token     - Token de verificación generado con crypto
 */
export async function sendVerificationEmail(toEmail, nombre, token) {
  const verifyUrl = `${FRONT_URL}/verify-email?token=${token}`;


  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Verificá tu cuenta</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:#198754;padding:32px 40px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                    ⚽ Canchas &amp; Deportes
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 24px;">
                  <h2 style="color:#212529;font-size:20px;margin:0 0 12px;">
                    ¡Hola, ${nombre}!
                  </h2>
                  <p style="color:#495057;font-size:15px;line-height:1.6;margin:0 0 24px;">
                    Gracias por registrarte. Para activar tu cuenta y empezar a reservar canchas,
                    confirmá tu correo electrónico haciendo click en el botón de abajo.
                  </p>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                    <tr>
                      <td style="background:#198754;border-radius:8px;">
                        <a href="${verifyUrl}"
                          style="display:inline-block;padding:14px 36px;color:#ffffff;
                                 font-size:15px;font-weight:600;text-decoration:none;
                                 letter-spacing:0.2px;">
                          Verificar mi cuenta
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="color:#6c757d;font-size:13px;line-height:1.5;margin:0 0 8px;">
                    Si el botón no funciona, copiá y pegá este link en tu navegador:
                  </p>
                  <p style="margin:0 0 24px;">
                    <a href="${verifyUrl}"
                      style="color:#198754;font-size:13px;word-break:break-all;">
                      ${verifyUrl}
                    </a>
                  </p>

                  <p style="color:#adb5bd;font-size:12px;margin:0;">
                    Este link expira en <strong>24 horas</strong>.
                    Si no creaste esta cuenta, podés ignorar este email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f8f9fa;padding:20px 40px;text-align:center;
                           border-top:1px solid #e9ecef;">
                  <p style="color:#adb5bd;font-size:12px;margin:0;">
                    © ${new Date().getFullYear()} Canchas &amp; Deportes — Este es un email automático, no respondas este mensaje.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: toEmail,
    subject: "Verificá tu cuenta — Canchas & Deportes",
    html,
    // Versión texto plano como fallback
    text: `Hola ${nombre},\n\nVerificá tu cuenta haciendo click en el siguiente link:\n${verifyUrl}\n\nEste link expira en 24 horas.\n\nCanchas & Deportes`,
  });
}
