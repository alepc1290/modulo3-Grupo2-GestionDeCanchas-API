import { getAllUsers, getUserById, deleteUser } from "../services/userService.js";

// GET /api/users
export async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/users/:id
export async function getUser(req, res) {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /api/users/:id
export async function removeUser(req, res) {
  try {
    const user = await deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    return res.status(200).json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
