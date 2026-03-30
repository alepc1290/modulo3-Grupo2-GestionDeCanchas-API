import { google } from "googleapis";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from "../config/env.js";

/**
 * Crea un cliente OAuth2 de Google.
 */
export function createOAuthClient() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * Genera la URL de autorización de Google para que el usuario vincule su cuenta.
 */
export function getAuthUrl() {
  const oAuth2Client = createOAuthClient();
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    prompt: "consent",
  });
}

/**
 * Intercambia el código de autorización por tokens de acceso/refresh.
 */
export async function getTokensFromCode(code) {
  const oAuth2Client = createOAuthClient();
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
}

/**
 * Crea un evento en Google Calendar del usuario.
 * @param {string} accessToken  - Token de acceso del usuario
 * @param {string} refreshToken - Token de refresh del usuario
 * @param {object} reserva      - Datos de la reserva
 * @param {string} nombreCancha - Nombre de la cancha
 * @returns {string} - ID del evento creado en Google Calendar
 */
export async function createCalendarEvent(
  accessToken,
  refreshToken,
  reserva,
  nombreCancha
) {
  const oAuth2Client = createOAuthClient();
  oAuth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  // Construir fechas ISO 8601
  const startDateTime = `${reserva.fecha}T${reserva.horaInicio}:00`;
  const endDateTime = `${reserva.fecha}T${reserva.horaFin}:00`;

  const event = {
    summary: `⚽ Reserva: ${nombreCancha}`,
    description: `Cancha reservada a través del sistema de reservas.`,
    start: {
      dateTime: startDateTime,
      timeZone: "America/Argentina/Buenos_Aires",
    },
    end: {
      dateTime: endDateTime,
      timeZone: "America/Argentina/Buenos_Aires",
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 60 },
        { method: "popup", minutes: 30 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  return response.data.id;
}

/**
 * Elimina un evento de Google Calendar.
 */
export async function deleteCalendarEvent(accessToken, refreshToken, eventId) {
  try {
    const oAuth2Client = createOAuthClient();
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    await calendar.events.delete({ calendarId: "primary", eventId });
  } catch (err) {
    console.warn("No se pudo eliminar el evento de Google Calendar:", err.message);
  }
}
