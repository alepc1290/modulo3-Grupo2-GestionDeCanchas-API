import mongoose from "mongoose";

const canchaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    tipo: {
      type: String,
      enum: ["futbol5", "futbol7", "futbol11"],
      required: [true, "El tipo de cancha es requerido"],
    },
    precio: {
      type: Number,
      required: [true, "El precio es requerido"],
      min: 0,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    imagen: {
      type: String,
      default: null,
    },
    estado: {
      type: String,
      enum: ["disponible", "mantenimiento", "inactiva"],
      default: "disponible",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cancha", canchaSchema);
