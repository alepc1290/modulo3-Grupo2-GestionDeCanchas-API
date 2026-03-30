import { Router } from "express";
import {
  getCanchas,
  getCancha,
  addCancha,
  editCancha,
  removeCancha,
} from "../controllers/canchaController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyAdmin } from "../middlewares/adminMiddleware.js";

const router = Router();

// Públicos
router.get("/", getCanchas);
router.get("/:id", getCancha);

// Solo admin
router.post("/", verifyToken, verifyAdmin, addCancha);
router.put("/:id", verifyToken, verifyAdmin, editCancha);
router.delete("/:id", verifyToken, verifyAdmin, removeCancha);

export default router;
