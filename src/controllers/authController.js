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

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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

    const esUsuarioGoogle = !!user.googleAccessToken;
    if (!user.isVerified && !esUsuarioGoogle) {
      return res.status(403).json({
        success: false,
        message: "Debes verificar tu correo antes de iniciar sesión.",
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

// GET /api/auth/verify-email
export async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token requerido",
      });
    }

    const user = await getUserByVerificationToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token inválido",
      });
    }

    if (user.verificationTokenExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Token expirado",
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Correo verificado correctamente",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 🔥 GOOGLE LOGIN CALLBACK (MODIFICADO)
export function googleLoginCallback(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`http://localhost:3000/test?error=google_auth_failed`);
    }

    const payload = {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // 🔥 CAMBIO CLAVE (SIN FRONT)
    return res.redirect(`http://localhost:3000/test?token=${token}`);
  } catch (error) {
    return res.redirect(`http://localhost:3000/test?error=server_error`);
  }
}

// GOOGLE CALENDAR (no tocar)
export function googleAuthRedirect(req, res) {
  const url = getAuthUrl();
  return res.redirect(url);
}

export async function googleAuthCallback(req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: "Código faltante" });
    }

    const tokens = await getTokensFromCode(code);

    const { userId } = req.query;
    if (userId) {
      await updateUserTokens(userId, tokens.access_token, tokens.refresh_token);
    }

    return res.status(200).json({
      success: true,
      message: "Google vinculado",
      data: tokens,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}