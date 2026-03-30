import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import canchaRoutes from "./canchaRoutes.js";
import productoRoutes from "./productoRoutes.js";
import reservaRoutes from "./reservaRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/canchas", canchaRoutes);
router.use("/productos", productoRoutes);
router.use("/reservas", reservaRoutes);

export default router;
