import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JWT_SECRET, FRONT_URL } from "../config/env.js";
import {
  createUser,
  getUserByEmail,
  updateUserTokens,
  getUserByVerificationToken,
} from "../services/userService.js";
import {
  getAuthUrl,
  getTokensFromCode,
} from "../services/googleCalendarService.js";
import { sendVerificationEmail } from "../services/emailService.js";

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "nombre, email y password son requeridos",
      });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
    }

    // Generar token seguro de verificación (hex de 32 bytes = 64 caracteres)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const passwordHash = await bcrypt.hash(password, 10);

    await createUser({
      nombre,
      email,
      password: passwordHash,
      rol: rol === "admin" ? "admin" : "user",
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    // Enviar email (no bloqueante: si falla el email, la cuenta igual se crea)
    try {
      await sendVerificationEmail(email, nombre, verificationToken);
    } catch (emailError) {
      console.warn("Email de verificación no enviado:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente. Revisá tu correo para verificar tu cuenta.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email y password son requeridos",
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Usuarios registrados con Google no tienen contraseña local
    if (user.provider === "google" && !user.password) {
      return res.status(400).json({
        success: false,
        message: "Esta cuenta fue creada con Google. Usá el botón 'Iniciar sesión con Google'.",
        code: "USE_GOOGLE_LOGIN",
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Bloquear login si el email no está verificado.
    // Excepción: usuarios con Google OAuth2 (tienen googleAccessToken) se consideran verificados.
    const esUsuarioGoogle = !!user.googleAccessToken;
    if (!user.isVerified && !esUsuarioGoogle) {
      return res.status(403).json({
        success: false,
        message: "Debes verificar tu correo antes de iniciar sesión. Revisá tu bandeja de entrada.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const payload = {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: { token, user: payload },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/auth/verify-email?token=TOKEN
export async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token de verificación requerido",
      });
    }

    const user = await getUserByVerificationToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token inválido o ya utilizado",
      });
    }

    // Verificar que el token no esté expirado
    if (user.verificationTokenExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "El link de verificación expiró. Registrate nuevamente para recibir uno nuevo.",
        code: "TOKEN_EXPIRED",
      });
    }

    // Marcar como verificado y limpiar el token
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "¡Correo verificado correctamente! Ya podés iniciar sesión.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ─── Google OAuth Login ────────────────────────────────────────────────────────

// GET /api/auth/google/login — inicia el flujo de login con Google (Passport)
// (la redirección real la hace passport.authenticate en la ruta)

// GET /api/auth/google/callback — Passport procesa el perfil y llega aquí con req.user
export function googleLoginCallback(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${FRONT_URL}/login?error=google_auth_failed`);
    }

    const payload = {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // Redirigir al frontend con el token en la URL
    return res.redirect(`${FRONT_URL}/auth/google/success?token=${token}`);
  } catch (error) {
    return res.redirect(`${FRONT_URL}/login?error=server_error`);
  }
}

// ─── Google Calendar OAuth2 (vinculación de agenda) ──────────────────────────

// GET /api/auth/google — redirige al usuario a la pantalla de autorización de Google
export function googleAuthRedirect(req, res) {
  const url = getAuthUrl();
  return res.redirect(url);
}

// GET /api/auth/google/callback — Google llama aquí con el código de autorización
export async function googleAuthCallback(req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: "Código de autorización faltante" });
    }

    const tokens = await getTokensFromCode(code);

    const { userId } = req.query;
    if (userId) {
      await updateUserTokens(userId, tokens.access_token, tokens.refresh_token);
    }

    return res.status(200).json({
      success: true,
      message: "Google Calendar vinculado correctamente",
      data: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
