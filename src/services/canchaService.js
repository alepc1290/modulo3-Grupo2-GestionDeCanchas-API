import Cancha from "../models/Cancha.js";

export async function getAllCanchas() {
  return await Cancha.find({ deleted: false });
}

export async function getCanchaById(id) {
  return await Cancha.findOne({ _id: id, deleted: false });
}

export async function createCancha(data) {
  return await Cancha.create(data);
}

export async function updateCancha(id, data) {
  return await Cancha.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteCancha(id) {
  return await Cancha.findByIdAndUpdate(id, { deleted: true }, { new: true });
}
