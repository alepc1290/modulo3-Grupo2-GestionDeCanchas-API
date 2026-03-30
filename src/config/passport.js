import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BACKEND_URL } from "./env.js";
import { getUserByEmail, createUser, getUserByGoogleId } from "../services/userService.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const nombre = profile.displayName;
        const googleId = profile.id;

        if (!email) {
          return done(new Error("No se pudo obtener el email de Google"), null);
        }

        // 1. Buscar por googleId (ya existe con Google)
        let user = await getUserByGoogleId(googleId);
        if (user) {
          return done(null, user);
        }

        // 2. Buscar por email (puede tener cuenta local)
        user = await getUserByEmail(email);
        if (user) {
          // Vincular googleId a la cuenta local existente
          user.googleId = googleId;
          user.provider = "google";
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }

        // 3. Crear usuario nuevo con Google
        const newUser = await createUser({
          nombre,
          email,
          provider: "google",
          googleId,
          isVerified: true,   // usuarios de Google no necesitan verificar email
          password: null,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
