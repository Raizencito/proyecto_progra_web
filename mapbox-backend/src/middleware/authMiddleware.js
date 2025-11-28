export const requireAdmin = (req, res, next) => {
  // En una app real, verificaríamos el JWT y los roles
  // Por ahora, simulamos la verificación
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.id_rol !== 1) { // 1 = administrador
    return res.status(403).json({ 
      error: "Acceso denegado. Se requiere rol de administrador." 
    });
  }
  
  next();
};

export const requireAdminOrSupervisor = (req, res, next) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.id_rol !== 1 && user.id_rol !== 2) { // 1 = admin, 2 = supervisor
    return res.status(403).json({ 
      error: "Acceso denegado. Se requiere rol de administrador o supervisor." 
    });
  }
  
  next();
};