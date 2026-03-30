import {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../services/productoService.js";

// GET /api/productos
export async function getProductos(req, res) {
  try {
    const productos = await getAllProductos();
    return res.status(200).json({ success: true, data: productos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/productos/:id
export async function getProducto(req, res) {
  try {
    const producto = await getProductoById(req.params.id);
    if (!producto) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }
    return res.status(200).json({ success: true, data: producto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/productos (admin)
export async function addProducto(req, res) {
  try {
    const { nombre, precio, stock, descripcion, imagen } = req.body;

    if (!nombre || precio === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "nombre, precio y stock son requeridos",
      });
    }

    const producto = await createProducto({ nombre, precio, stock, descripcion, imagen });
    return res.status(201).json({ success: true, message: "Producto creado", data: producto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// PUT /api/productos/:id (admin)
export async function editProducto(req, res) {
  try {
    const producto = await updateProducto(req.params.id, req.body);
    if (!producto) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }
    return res.status(200).json({ success: true, message: "Producto actualizado", data: producto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /api/productos/:id (admin)
export async function removeProducto(req, res) {
  try {
    const producto = await deleteProducto(req.params.id);
    if (!producto) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }
    return res.status(200).json({ success: true, message: "Producto eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
