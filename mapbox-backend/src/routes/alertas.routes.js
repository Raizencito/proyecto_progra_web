import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET /api/alertas
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ag.*,
        e.paterno,
        e.materno,
        e.nombres,
        lt.nombre as lugar_trabajo,
        ST_X(ag.ubicacion) as lng,
        ST_Y(ag.ubicacion) as lat
      FROM alertas_geocerca ag
      INNER JOIN empleados e ON ag.id_empleado = e.id
      INNER JOIN lugares_trabajo lt ON ag.id_lugar_trabajo = lt.id
      ORDER BY ag.fecha_hora DESC
      LIMIT 100
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener alertas" });
  }
});

// GET /api/alertas/hoy
router.get("/hoy", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ag.*,
        e.paterno,
        e.materno,
        e.nombres,
        lt.nombre as lugar_trabajo,
        ST_X(ag.ubicacion) as lng,
        ST_Y(ag.ubicacion) as lat
      FROM alertas_geocerca ag
      INNER JOIN empleados e ON ag.id_empleado = e.id
      INNER JOIN lugares_trabajo lt ON ag.id_lugar_trabajo = lt.id
      WHERE DATE(ag.fecha_hora) = CURRENT_DATE
      ORDER BY ag.fecha_hora DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener alertas de hoy" });
  }
});

export default router;