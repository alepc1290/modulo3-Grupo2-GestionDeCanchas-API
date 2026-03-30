import {
  checkConflicto,
  createReserva,
  getAllReservas,
  getReservaById,
  deleteReserva,
  updateGoogleEventId,
  getReservasPorCanchaYFecha,
  getAllReservasAdmin,
  confirmarPago,
  cancelarPago,
} from "../services/reservaService.js";
import { getCanchaById } from "../services/canchaService.js";
import { getUserById } from "../services/userService.js";
import {
  createCalendarEvent,
  deleteCalendarEvent,
} from "../services/googleCalendarService.js";
import {
  ALIAS_TRANSFERENCIA,
  CBU_TRANSFERENCIA,
  TITULAR_CUENTA,
  BANCO_NOMBRE,
  WHATSAPP_ADMIN,
} from "../config/env.js";

// POST /api/reservas
export async function addReserva(req, res) {
  try {
    const { canchaId, fecha, horaInicio, horaFin } = req.body;
    const userId = req.user.id;

    // Validar campos requeridos
    if (!canchaId || !fecha || !horaInicio || !horaFin) {
      return res.status(400).json({
        success: false,
        message: "canchaId, fecha, horaInicio y horaFin son requeridos",
      });
    }

    // Validar que horaFin > horaInicio
    if (horaFin <= horaInicio) {
      return res.status(400).json({
        success: false,
        message: "La hora de fin debe ser posterior a la hora de inicio",
      });
    }

    // Verificar que la cancha existe
    const cancha = await getCanchaById(canchaId);
    if (!cancha) {
      return res.status(404).json({ success: false, message: "Cancha no encontrada" });
    }

    if (cancha.estado !== "disponible") {
      return res.status(400).json({
        success: false,
        message: `La cancha no está disponible (estado: ${cancha.estado})`,
      });
    }

    // ✅ Verificar conflicto de horario
    const conflicto = await checkConflicto(canchaId, fecha, horaInicio, horaFin);
    if (conflicto) {
      return res.status(400).json({
        success: false,
        message: "La cancha ya tiene una reserva en ese horario. Elegí otro turno.",
      });
    }

    // Crear la reserva
    const reserva = await createReserva({ userId, canchaId, fecha, horaInicio, horaFin });

    // Intentar crear evento en Google Calendar (opcional, no rompe el flujo si falla)
    try {
      const user = await getUserById(userId);
      if (user?.googleAccessToken && user?.googleRefreshToken) {
        const eventId = await createCalendarEvent(
          user.googleAccessToken,
          user.googleRefreshToken,
          reserva,
          cancha.nombre
        );
        await updateGoogleEventId(reserva._id, eventId);
        reserva.googleEventId = eventId;
      }
    } catch (calendarError) {
      console.warn("Google Calendar: no se pudo crear el evento →", calendarError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Reserva creada correctamente",
      data: reserva,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/reservas
export async function getReservas(req, res) {
  try {
    const reservas = await getAllReservas();
    return res.status(200).json({ success: true, data: reservas });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/reservas/:id
export async function getReserva(req, res) {
  try {
    const reserva = await getReservaById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ success: false, message: "Reserva no encontrada" });
    }
    return res.status(200).json({ success: true, data: reserva });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /api/reservas/:id
export async function removeReserva(req, res) {
  try {
    const reserva = await getReservaById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ success: false, message: "Reserva no encontrada" });
    }

    // Intentar eliminar el evento de Google Calendar si existe
    if (reserva.googleEventId) {
      try {
        const user = await getUserById(reserva.userId._id || reserva.userId);
        if (user?.googleAccessToken) {
          await deleteCalendarEvent(
            user.googleAccessToken,
            user.googleRefreshToken,
            reserva.googleEventId
          );
        }
      } catch (calendarError) {
        console.warn("Google Calendar: no se pudo eliminar el evento →", calendarError.message);
      }
    }

    await deleteReserva(req.params.id);
    return res.status(200).json({ success: true, message: "Reserva eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/reservas/disponibilidad?canchaId=...&fecha=...
export async function getDisponibilidad(req, res) {
  try {
    const { canchaId, fecha } = req.query;

    if (!canchaId || !fecha) {
      return res.status(400).json({
        success: false,
        message: "canchaId y fecha son requeridos como query params",
      });
    }

    // Validar formato de fecha YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido. Usar YYYY-MM-DD",
      });
    }

    // Traer solo los horarios reservados para esa cancha y fecha
    const reservasExistentes = await getReservasPorCanchaYFecha(canchaId, fecha);

    // Generar todos los slots posibles: 08:00 a 23:00 en intervalos de 1 hora
    // Un slot "08:00" representa el turno de 08:00 a 09:00
    const HORA_INICIO = 8;
    const HORA_FIN    = 23;
    const todosLosSlots = [];
    for (let h = HORA_INICIO; h < HORA_FIN; h++) {
      todosLosSlots.push(`${String(h).padStart(2, "0")}:00`);
    }

    // Un slot está ocupado si alguna reserva existente se superpone con él
    const horariosOcupados = [];
    const horariosDisponibles = [];

    for (const slot of todosLosSlots) {
      const slotInicio = slot;
      const slotFin    = `${String(parseInt(slot) + 1).padStart(2, "0")}:00`;

      const ocupado = reservasExistentes.some(
        (r) => slotInicio < r.horaFin && slotFin > r.horaInicio
      );

      if (ocupado) {
        horariosOcupados.push(slot);
      } else {
        horariosDisponibles.push(slot);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        canchaId,
        fecha,
        horariosDisponibles,
        horariosOcupados,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/reservas/admin  (solo admin)
export async function getReservasAdmin(req, res) {
  try {
    const reservas = await getAllReservasAdmin();

    // Formatear la respuesta con la estructura exacta pedida
    const data = reservas.map((r) => ({
      _id:        r._id,
      usuario:    r.userId?.nombre  || "Usuario eliminado",
      email:      r.userId?.email   || "-",
      cancha:     r.canchaId?.nombre || "Cancha eliminada",
      tipoCacha:  r.canchaId?.tipo   || "-",
      precio:     r.canchaId?.precio || 0,
      fecha:      r.fecha,
      horaInicio: r.horaInicio,
      horaFin:    r.horaFin,
      estadoPago: r.estadoPago,
      metodoPago: r.metodoPago,
      createdAt:  r.createdAt,
    }));

    return res.status(200).json({
      success: true,
      total: data.length,
      reservas: data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// PATCH /api/reservas/:id/confirmar-pago  (solo admin)
export async function patchConfirmarPago(req, res) {
  try {
    const reserva = await confirmarPago(req.params.id);
    if (!reserva) {
      return res.status(404).json({ success: false, message: "Reserva no encontrada" });
    }
    return res.status(200).json({
      success: true,
      message: "Pago confirmado correctamente",
      reserva: {
        _id:        reserva._id,
        usuario:    reserva.userId?.nombre,
        cancha:     reserva.canchaId?.nombre,
        fecha:      reserva.fecha,
        horaInicio: reserva.horaInicio,
        horaFin:    reserva.horaFin,
        estadoPago: reserva.estadoPago,
        metodoPago: reserva.metodoPago,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// PATCH /api/reservas/:id/cancelar-pago  (solo admin)
export async function patchCancelarPago(req, res) {
  try {
    const reserva = await cancelarPago(req.params.id);
    if (!reserva) {
      return res.status(404).json({ success: false, message: "Reserva no encontrada" });
    }
    return res.status(200).json({
      success: true,
      message: "Pago cancelado",
      reserva: {
        _id:        reserva._id,
        usuario:    reserva.userId?.nombre,
        cancha:     reserva.canchaId?.nombre,
        fecha:      reserva.fecha,
        estadoPago: reserva.estadoPago,
        metodoPago: reserva.metodoPago,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/reservas/datos-transferencia  (público)
export function getDatosTransferencia(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      alias:    ALIAS_TRANSFERENCIA,
      cbu:      CBU_TRANSFERENCIA,
      titular:  TITULAR_CUENTA,
      banco:    BANCO_NOMBRE,
      whatsapp: WHATSAPP_ADMIN,
    },
  });
}
