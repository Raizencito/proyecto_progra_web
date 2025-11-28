import express from "express";
import { pool } from "../config/db.js";
import { requireAdmin, requireAdminOrSupervisor } from '../middleware/authMiddleware.js';
const router = express.Router();

// GET /api/lugares (YA EXISTE)
router.get("/", requireAdminOrSupervisor,async (req, res) => {
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

// POST /api/lugares - CREAR NUEVO LUGAR
router.post("/",requireAdmin, async (req, res) => {
  const { nombre, direccion, id_departamento, geocerca } = req.body;
  
  try {
    // Validar que el departamento existe
    const departamentoCheck = await pool.query(
      "SELECT id FROM departamentos WHERE id = $1",
      [id_departamento]
    );
    
    if (departamentoCheck.rows.length === 0) {
      return res.status(400).json({ error: "Departamento no válido" });
    }

    const result = await pool.query(`
      INSERT INTO lugares_trabajo (nombre, direccion, id_departamento, geocerca)
      VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326))
      RETURNING *
    `, [nombre, direccion, id_departamento, JSON.stringify(geocerca)]);

    // Obtener el lugar creado con información del departamento
    const lugarCreado = await pool.query(`
      SELECT lt.*, d.nombre as departamento
      FROM lugares_trabajo lt
      INNER JOIN departamentos d ON lt.id_departamento = d.id
      WHERE lt.id = $1
    `, [result.rows[0].id]);

    res.status(201).json({
      message: "Lugar de trabajo creado exitosamente",
      lugar: lugarCreado.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear lugar de trabajo" });
  }
});

// PUT /api/lugares/:id - ACTUALIZAR LUGAR
router.put("/:id",requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, id_departamento, activo } = req.body;

  try {
    const result = await pool.query(`
      UPDATE lugares_trabajo 
      SET nombre = $1, direccion = $2, id_departamento = $3, activo = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [nombre, direccion, id_departamento, activo, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lugar de trabajo no encontrado" });
    }

    res.json({
      message: "Lugar de trabajo actualizado exitosamente",
      lugar: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar lugar de trabajo" });
  }
});

// PUT /api/lugares/:id/geocerca - ACTUALIZAR SOLO GEOCERCA
router.put("/:id/geocerca",requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { geocerca } = req.body;

  try {
    const result = await pool.query(`
      UPDATE lugares_trabajo 
      SET geocerca = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326), updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [JSON.stringify(geocerca), id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lugar de trabajo no encontrado" });
    }

    res.json({
      message: "Geocerca actualizada exitosamente",
      lugar: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar geocerca" });
  }
});

// DELETE /api/lugares/:id - ELIMINAR LUGAR (BORRADO LÓGICO)
router.delete("/:id",requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si hay empleados asignados
    const asignacionesCheck = await pool.query(`
      SELECT COUNT(*) as asignaciones_activas
      FROM asignaciones 
      WHERE id_lugar_trabajo = $1 AND activa = true
    `, [id]);

    if (parseInt(asignacionesCheck.rows[0].asignaciones_activas) > 0) {
      return res.status(400).json({ 
        error: "No se puede eliminar el lugar, tiene empleados asignados" 
      });
    }

    // Borrado lógico
    const result = await pool.query(`
      UPDATE lugares_trabajo 
      SET activo = false, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lugar de trabajo no encontrado" });
    }

    res.json({
      message: "Lugar de trabajo eliminado exitosamente",
      lugar: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar lugar de trabajo" });
  }
});

// GET /api/departamentos - OBTENER DEPARTAMENTOS PARA SELECT
router.get("/departamentos",requireAdminOrSupervisor, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre 
      FROM departamentos 
      ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener departamentos" });
  }
});

export default router;