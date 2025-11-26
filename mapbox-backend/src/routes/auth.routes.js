import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// POST /api/auth/login (SOLO para admin web)
router.post("/login", async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const result = await pool.query(`
      SELECT e.*, r.nombre as rol_nombre 
      FROM empleados e 
      INNER JOIN roles r ON e.id_rol = r.id 
      WHERE e.usuario = $1 AND e.activo = true AND r.nombre = 'administrador'
    `, [usuario]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Acceso denegado" });
    }

    // Verificación simple
    if (password !== "123456") {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const { password_hash, ...admin } = result.rows[0];

    res.json({
      message: "Login admin exitoso",
      admin: admin
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;