import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET /api/lugares
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        lt.*,
        d.nombre as departamento,
        COUNT(a.id) as empleados_asignados
      FROM lugares_trabajo lt
      INNER JOIN departamentos d ON lt.id_departamento = d.id
      LEFT JOIN asignaciones a ON lt.id = a.id_lugar_trabajo AND a.activa = true
      WHERE lt.activo = true
      GROUP BY lt.id, d.nombre
      ORDER BY lt.nombre
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener lugares" });
  }
});

// POST /api/lugares (NUEVO - CREAR LUGAR DE TRABAJO)
router.post("/", async (req, res) => {
  const { 
    nombre, 
    direccion, 
    id_departamento, 
    geocerca 
  } = req.body;

  // Validaciones
  if (!nombre || !id_departamento || !geocerca) {
    return res.status(400).json({ 
      error: "Faltan campos obligatorios: nombre, id_departamento, geocerca" 
    });
  }

  try {
    const result = await pool.query(`
      INSERT INTO lugares_trabajo 
        (nombre, direccion, id_departamento, geocerca)
      VALUES ($1, $2, $3, ST_GeomFromText($4, 4326))
      RETURNING *
    `, [nombre, direccion || null, id_departamento, geocerca]);

    res.status(201).json({
      message: "Lugar de trabajo creado exitosamente",
      lugar: result.rows[0]
    });

  } catch (error) {
    console.error("Error al crear lugar:", error);
    
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: "El departamento no existe" });
    }
    
    res.status(500).json({ error: "Error al crear lugar de trabajo" });
  }
});
export default router;