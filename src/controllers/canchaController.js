import {
  getAllCanchas,
  getCanchaById,
  createCancha,
  updateCancha,
  deleteCancha,
} from "../services/canchaService.js";

// GET /api/canchas
export async function getCanchas(req, res) {
  try {
    const canchas = await getAllCanchas();
    return res.status(200).json({ success: true, data: canchas });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/canchas/:id
export async function getCancha(req, res) {
  try {
    const cancha = await getCanchaById(req.params.id);
    if (!cancha) {
      return res.status(404).json({ success: false, message: "Cancha no encontrada" });
    }
    return res.status(200).json({ success: true, data: cancha });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/canchas (admin)
export async function addCancha(req, res) {
  try {
    const { nombre, tipo, precio, descripcion, imagen, estado } = req.body;

    if (!nombre || !tipo || !precio) {
      return res.status(400).json({
        success: false,
        message: "nombre, tipo y precio son requeridos",
      });
    }

    const cancha = await createCancha({ nombre, tipo, precio, descripcion, imagen, estado });
    return res.status(201).json({ success: true, message: "Cancha creada", data: cancha });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// PUT /api/canchas/:id (admin)
export async function editCancha(req, res) {
  try {
    const cancha = await updateCancha(req.params.id, req.body);
    if (!cancha) {
      return res.status(404).json({ success: false, message: "Cancha no encontrada" });
    }
    return res.status(200).json({ success: true, message: "Cancha actualizada", data: cancha });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /api/canchas/:id (admin)
export async function removeCancha(req, res) {
  try {
    const cancha = await deleteCancha(req.params.id);
    if (!cancha) {
      return res.status(404).json({ success: false, message: "Cancha no encontrada" });
    }
    return res.status(200).json({ success: true, message: "Cancha eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
