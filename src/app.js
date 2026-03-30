import express from "express";
import cors from "cors";
import { FRONT_URL } from "./config/env.js";
import router from "./routes/index.js";
import passport from "./config/passport.js";

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://modulo3-grupo2-gestion-de-canchas-f.vercel.app",
    ];
    if (!origin) return callback(null, true);
    if (allowed.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("CORS no permitido: " + origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use("/api", router);
app.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 API Canchas funcionando correctamente" });
});
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

export default app