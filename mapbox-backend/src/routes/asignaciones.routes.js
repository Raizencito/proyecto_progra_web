import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        e.paterno,
        e.materno,
        e.nombres,
        lt.nombre as lugar_trabajo,
        d.nombre as departamento
      FROM asignaciones a
      INNER JOIN empleados e ON a.id_empleado = e.id
      INNER JOIN lugares_trabajo lt ON a.id_lugar_trabajo = lt.id
      INNER JOIN departamentos d ON lt.id_departamento = d.id
      WHERE a.activa = true
      ORDER BY e.paterno, e.materno
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener asignaciones" });
  }
});

router.post("/", async (req, res) => {
  const { id_empleado, id_lugar_trabajo } = req.body;

  try {
    const empleadoCheck = await pool.query(
      "SELECT id FROM empleados WHERE id = $1 AND activo = true",
      [id_empleado]
    );
    
    if (empleadoCheck.rows.length === 0) {
      return res.status(400).json({ error: "Empleado no válido o inactivo" });
    }

    const lugarCheck = await pool.query(
      "SELECT id FROM lugares_trabajo WHERE id = $1 AND activo = true",
      [id_lugar_trabajo]
    );
    
    if (lugarCheck.rows.length === 0) {
      return res.status(400).json({ error: "Lugar de trabajo no válido o inactivo" });
    }

    await pool.query(`
      UPDATE asignaciones 
      SET activa = false, fecha_finalizacion = CURRENT_DATE
      WHERE id_empleado = $1 AND activa = true
    `, [id_empleado]);

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

router.get("/empleado/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        lt.nombre as lugar_trabajo,
        d.nombre as departamento,
        lt.geocerca
      FROM asignaciones a
      INNER JOIN lugares_trabajo lt ON a.id_lugar_trabajo = lt.id
      INNER JOIN departamentos d ON lt.id_departamento = d.id
      WHERE a.id_empleado = $1
      ORDER BY a.fecha_asignacion DESC
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener asignaciones del empleado" });
  }
});

// GET /api/asignaciones/lugar/:id - EMPLEADOS ASIGNADOS A UN LUGAR
router.get("/lugar/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        e.paterno,
        e.materno,
        e.nombres,
        e.ci,
        e.telefono,
        r.nombre as rol
      FROM asignaciones a
      INNER JOIN empleados e ON a.id_empleado = e.id
      INNER JOIN roles r ON e.id_rol = r.id
      WHERE a.id_lugar_trabajo = $1 AND a.activa = true
      ORDER BY e.paterno, e.materno
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener empleados del lugar" });
  }
});

// PATCH /api/asignaciones/:id/desactivar - DESACTIVAR ASIGNACIÓN
router.patch("/:id/desactivar", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      UPDATE asignaciones 
      SET activa = false, fecha_finalizacion = CURRENT_DATE
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asignación no encontrada" });
    }

    res.json({
      message: "Asignación desactivada exitosamente",
      asignacion: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar asignación" });
  }
});

export default router;