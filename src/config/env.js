import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const FRONT_URL = process.env.FRONT_URL;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Datos bancarios para transferencia (configurables por .env)
export const ALIAS_TRANSFERENCIA =
  process.env.ALIAS_TRANSFERENCIA || "canchas.deportes";
export const CBU_TRANSFERENCIA =
  process.env.CBU_TRANSFERENCIA || "0000000000000000000000";
export const TITULAR_CUENTA =
  process.env.TITULAR_CUENTA || "Complejo Deportivo";
export const BANCO_NOMBRE = process.env.BANCO_NOMBRE || "Banco Nación";
export const WHATSAPP_ADMIN = process.env.WHATSAPP_ADMIN || "+5493813657948";

// Nodemailer — configuración SMTP
export const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
export const EMAIL_PORT = process.env.EMAIL_PORT || 587;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_FROM =
  process.env.EMAIL_FROM || "Canchas & Deportes <no-reply@canchas.com>";
export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const JWT_PASSWORD = process.env.JWT_PASSWORD;
export const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET;
export const CLOUDINARY_CLOUDNAME = process.env.CLOUDINARY_CLOUDNAME;
export const CLOUDINARY_APIKEY = process.env.CLOUDINARY_APIKEY;
