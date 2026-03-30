import User from "../models/User.js";

export async function createUser(data) {
  return await User.create(data);
}

export async function getUserByEmail(email) {
  return await User.findOne({ email, deleted: false });
}

export async function getUserById(id) {
  return await User.findOne({ _id: id, deleted: false }).select("-password");
}

export async function getAllUsers() {
  return await User.find({ deleted: false }).select("-password");
}

export async function deleteUser(id) {
  return await User.findByIdAndUpdate(id, { deleted: true }, { new: true });
}

export async function updateUserTokens(userId, accessToken, refreshToken) {
  return await User.findByIdAndUpdate(
    userId,
    { googleAccessToken: accessToken, googleRefreshToken: refreshToken },
    { new: true }
  );
}

// Busca un usuario por su token de verificación (solo activos, no eliminados)
export async function getUserByVerificationToken(token) {
  return await User.findOne({
    verificationToken: token,
    deleted: false,
  });
}

// Busca un usuario por su Google ID (para login con OAuth)
export async function getUserByGoogleId(googleId) {
  return await User.findOne({ googleId, deleted: false });
}
