import mongoose from "mongoose";

const reservaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es requerido"],
    },
    canchaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cancha",
      required: [true, "La cancha es requerida"],
    },
    fecha: {
      type: String, // formato: "YYYY-MM-DD"
      required: [true, "La fecha es requerida"],
    },
    horaInicio: {
      type: String, // formato: "HH:MM"
      required: [true, "La hora de inicio es requerida"],
    },
    horaFin: {
      type: String, // formato: "HH:MM"
      required: [true, "La hora de fin es requerida"],
    },
    googleEventId: {
      type: String,
      default: null,
    },
    estadoPago: {
      type: String,
      enum: ["pendiente", "confirmado", "cancelado"],
      default: "pendiente",
    },
    metodoPago: {
      type: String,
      enum: ["transferencia", "efectivo"],
      default: "transferencia",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Índice compuesto para acelerar las consultas de disponibilidad
// (canchaId + fecha es la combinación más consultada)
reservaSchema.index({ canchaId: 1, fecha: 1, deleted: 1 });

export default mongoose.model("Reserva", reservaSchema);
