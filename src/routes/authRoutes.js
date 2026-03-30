import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  verifyEmail,
  googleAuthRedirect,
  googleAuthCallback,
  googleLoginCallback,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Verificación de email — el link del correo apunta aquí
router.get("/verify-email", verifyEmail);

// ─── Google OAuth — Login con Google ──────────────────────────────────────────
// Paso 1: redirigir a Google
router.get(
  "/google/login",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Paso 2: callback que recibe el perfil y genera el JWT
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/auth/google/failure", session: false }),
  googleLoginCallback
);

// En caso de fallo de autenticación
router.get("/google/failure", (req, res) => {
  res.status(401).json({ success: false, message: "Autenticación con Google fallida" });
});

// ─── Google Calendar OAuth2 (vinculación de agenda — mantener igual) ──────────
router.get("/google", googleAuthRedirect);

export default router;
