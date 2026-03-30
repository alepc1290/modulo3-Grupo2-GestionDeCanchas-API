import { Router } from "express";
import {
  getProductos,
  getProducto,
  addProducto,
  editProducto,
  removeProducto,
} from "../controllers/productoController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyAdmin } from "../middlewares/adminMiddleware.js";

const router = Router();

// Públicos
router.get("/", getProductos);
router.get("/:id", getProducto);

// Solo admin
router.post("/", verifyToken, verifyAdmin, addProducto);
router.put("/:id", verifyToken, verifyAdmin, editProducto);
router.delete("/:id", verifyToken, verifyAdmin, removeProducto);

export default router;
