import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// POST /api/asignaciones (asignar empleado a lugar)
router.post("/", async (req, res) => {
  const { id_empleado, id_lugar_trabajo } = req.body;

  try {
    // Desactivar asignaciones anteriores
    await pool.query(`
      UPDATE asignaciones 
      SET activa = false, fecha_finalizacion = CURRENT_DATE
      WHERE id_empleado = $1 AND activa = true
    `, [id_empleado]);

    // Crear nueva asignación
    const result = await pool.query(`
      INSERT INTO asignaciones (id_empleado, id_lugar_trabajo)
      VALUES ($1, $2)
      RETURNING *
    `, [id_empleado, id_lugar_trabajo]);

    res.status(201).json({
      message: "Empleado asignado exitosamente",
      asignacion: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al asignar empleado" });
  }
});

export default router;