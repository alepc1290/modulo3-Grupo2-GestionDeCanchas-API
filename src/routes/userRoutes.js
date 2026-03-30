import { Router } from "express";
import { getUsers, getUser, removeUser } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyAdmin } from "../middlewares/adminMiddleware.js";

const router = Router();

// Solo admin puede gestionar usuarios
router.get("/", verifyToken, verifyAdmin, getUsers);
router.get("/:id", verifyToken, verifyAdmin, getUser);
router.delete("/:id", verifyToken, verifyAdmin, removeUser);

export default router;
