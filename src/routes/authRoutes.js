import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  verifyEmail,
  googleLoginCallback,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Verificación de email
router.get("/verify-email", verifyEmail);

// ─── Google OAuth — Login con Google (PASSPORT) ─────────────────────────────

// Paso 1: redirigir a Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Paso 2: callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure",
    session: false,
  }),
  googleLoginCallback
);

// En caso de error
router.get("/google/failure", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Autenticación con Google fallida",
  });
});

export default router;