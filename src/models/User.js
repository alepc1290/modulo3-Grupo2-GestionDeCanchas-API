import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // no es requerido para usuarios de Google
    },
    // Proveedor de autenticación
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    // ID de Google (solo para usuarios con provider = "google")
    googleId: {
      type: String,
      default: null,
    },
    rol: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    // Tokens de Google OAuth2 para Calendar (se guardan tras autorizar)
    googleAccessToken: { type: String, default: null },
    googleRefreshToken: { type: String, default: null },
    // Verificación de email
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpires: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
