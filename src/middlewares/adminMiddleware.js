const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado: se requieren permisos de administrador",
    });
  }
  next();
};

export { verifyAdmin };
