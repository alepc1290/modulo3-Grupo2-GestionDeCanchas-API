import Producto from "../models/Producto.js";

export async function getAllProductos() {
  return await Producto.find({ deleted: false });
}

export async function getProductoById(id) {
  return await Producto.findOne({ _id: id, deleted: false });
}

export async function createProducto(data) {
  return await Producto.create(data);
}

export async function updateProducto(id, data) {
  return await Producto.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteProducto(id) {
  return await Producto.findByIdAndUpdate(id, { deleted: true }, { new: true });
}
