import express from "express";
import { pool } from "../config/db.js";
//import bcrypt from "bcrypt";

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { usuario, password } = req.body;

  console.log('🔐 Login attempt:', { usuario }); // Debug

  try {
    // Buscar usuario por nombre de usuario
    const result = await pool.query(`
      SELECT e.*, r.nombre as rol_nombre 
      FROM empleados e 
      INNER JOIN roles r ON e.id_rol = r.id 
      WHERE e.usuario = $1 AND e.activo = true
    `, [usuario]);

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado:', usuario);
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const empleado = result.rows[0];
    console.log('✅ Usuario encontrado:', empleado.nombres);

    // Verificar contraseña (en producción usaríamos bcrypt.compare)
    // Por ahora, simplificamos para pruebas
    if (password !== "123456") {
      console.log('❌ Contraseña incorrecta para:', usuario);
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Eliminar password_hash de la respuesta
    const { password_hash, ...empleadoSinPassword } = empleado;

    console.log('✅ Login exitoso para:', empleado.nombres);

    res.json({
      message: "Login exitoso",
      empleado: empleadoSinPassword,
      token: "jwt-token-simulado"
    });

  } catch (error) {
    console.error('🔥 Error en login:', error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;