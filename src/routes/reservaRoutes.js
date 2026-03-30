import { Router } from "express";
import {
  addReserva,
  getReservas,
  getReserva,
  removeReserva,
  getDisponibilidad,
  getReservasAdmin,
  patchConfirmarPago,
  patchCancelarPago,
  getDatosTransferencia,
} from "../controllers/reservaController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyAdmin } from "../middlewares/adminMiddleware.js";

const router = Router();

// ── Rutas específicas PRIMERO (antes de /:id) ─────────────────────────────────

// GET /api/reservas/disponibilidad?canchaId=...&fecha=...  — pública
router.get("/disponibilidad", getDisponibilidad);

// GET /api/reservas/datos-transferencia  — pública, devuelve alias/CBU/WhatsApp
router.get("/datos-transferencia", getDatosTransferencia);

// GET /api/reservas/admin  — solo admin
router.get("/admin", verifyToken, verifyAdmin, getReservasAdmin);

// ── Rutas con parámetro /:id ──────────────────────────────────────────────────

// PATCH /api/reservas/:id/confirmar-pago  — solo admin
router.patch("/:id/confirmar-pago", verifyToken, verifyAdmin, patchConfirmarPago);

// PATCH /api/reservas/:id/cancelar-pago  — solo admin
router.patch("/:id/cancelar-pago", verifyToken, verifyAdmin, patchCancelarPago);

// ── CRUD existente (sin cambios) ──────────────────────────────────────────────
router.post("/",      verifyToken, addReserva);
router.get("/",       verifyToken, getReservas);
router.get("/:id",    verifyToken, getReserva);
router.delete("/:id", verifyToken, removeReserva);

export default router;
