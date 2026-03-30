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
        console.log("✅ GOOGLE PROFILE:", profile);

        // ⚠️ VALIDACIÓN FUERTE
        if (!profile || !profile.emails || profile.emails.length === 0) {
          return done(new Error("No se pudo obtener el perfil de Google"), null);
        }

        const email = profile.emails[0].value;
        const nombre = profile.displayName;
        const googleId = profile.id;

        // 1. Buscar por googleId
        let user = await getUserByGoogleId(googleId);
        if (user) {
          return done(null, user);
        }

        // 2. Buscar por email
        user = await getUserByEmail(email);
        if (user) {
          user.googleId = googleId;
          user.provider = "google";
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }

        // 3. Crear nuevo
        const newUser = await createUser({
          nombre,
          email,
          provider: "google",
          googleId,
          isVerified: true,
          password: null,
        });

        return done(null, newUser);
      } catch (error) {
        console.error("❌ ERROR GOOGLE:", error);
        return done(error, null);
      }
    }
  )
);

export default passport;