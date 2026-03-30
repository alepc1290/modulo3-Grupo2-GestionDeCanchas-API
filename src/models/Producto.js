import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, "El precio es requerido"],
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, "El stock es requerido"],
      min: 0,
      default: 0,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    imagen: {
      type: String,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Producto", productoSchema);
