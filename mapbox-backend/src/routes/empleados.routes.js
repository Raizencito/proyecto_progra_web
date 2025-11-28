import express from "express";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// GET /api/empleados
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.paterno,
        e.materno,
        e.nombres,
        e.ci,
        e.telefono,
        e.activo,
        e.usuario,
        r.nombre as rol,
        lt.nombre as lugar_trabajo,
        d.nombre as departamento,
        (
          SELECT estado 
          FROM alertas_geocerca 
          WHERE id_empleado = e.id 
          ORDER BY fecha_hora DESC 
          LIMIT 1
        ) as ultimo_estado
      FROM empleados e
      INNER JOIN roles r ON e.id_rol = r.id
      LEFT JOIN lugares_trabajo lt ON e.id_lugar_trabajo = lt.id
      LEFT JOIN departamentos d ON lt.id_departamento = d.id
      ORDER BY e.paterno, e.materno
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

// POST /api/empleados
router.post("/", async (req, res) => {
  const { paterno, materno, nombres, ci, telefono, id_rol, id_lugar_trabajo } = req.body;

  try {
    // Generar usuario y contraseña automáticamente
    const usuario = generarUsuario(nombres, paterno);
    const password_hash = await bcrypt.hash(`${paterno.toLowerCase()}123`, 10);

    const result = await pool.query(`
      INSERT INTO empleados (paterno, materno, nombres, ci, telefono, id_rol, usuario, password_hash, id_lugar_trabajo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [paterno, materno, nombres, ci, telefono, id_rol, usuario, password_hash, id_lugar_trabajo || null]);

    res.status(201).json({ 
      message: "Empleado creado exitosamente",
      empleado: result.rows[0] 
    });

  } catch (error) {
    console.error('Error creando empleado:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: "La cédula de identidad ya existe" });
    }
    
    res.status(500).json({ error: "Error al crear empleado" });
  }
});

// PUT /api/empleados/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { paterno, materno, nombres, ci, telefono, id_rol, id_lugar_trabajo, activo } = req.body;

  try {
    const result = await pool.query(`
      UPDATE empleados 
      SET paterno = $1, materno = $2, nombres = $3, ci = $4, 
          telefono = $5, id_rol = $6, id_lugar_trabajo = $7, activo = $8
      WHERE id = $9
      RETURNING *
    `, [paterno, materno, nombres, ci, telefono, id_rol, id_lugar_trabajo, activo, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.json({ 
      message: "Empleado actualizado exitosamente",
      empleado: result.rows[0] 
    });

  } catch (error) {
    console.error('Error actualizando empleado:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: "La cédula de identidad ya existe" });
    }
    
    res.status(500).json({ error: "Error al actualizar empleado" });
  }
});

// PUT /api/empleados/:id/lugar - Solo actualizar lugar de trabajo
// PUT /api/empleados/:id - Actualizar empleado (actualización parcial)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { paterno, materno, nombres, ci, telefono, id_rol, id_lugar_trabajo, activo } = req.body;

  try {
    // Construir la consulta dinámicamente para actualizar solo los campos proporcionados
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (paterno !== undefined) {
      updates.push(`paterno = $${paramCount}`);
      values.push(paterno);
      paramCount++;
    }
    if (materno !== undefined) {
      updates.push(`materno = $${paramCount}`);
      values.push(materno);
      paramCount++;
    }
    if (nombres !== undefined) {
      updates.push(`nombres = $${paramCount}`);
      values.push(nombres);
      paramCount++;
    }
    if (ci !== undefined) {
      updates.push(`ci = $${paramCount}`);
      values.push(ci);
      paramCount++;
    }
    if (telefono !== undefined) {
      updates.push(`telefono = $${paramCount}`);
      values.push(telefono);
      paramCount++;
    }
    if (id_rol !== undefined) {
      updates.push(`id_rol = $${paramCount}`);
      values.push(id_rol);
      paramCount++;
    }
    if (id_lugar_trabajo !== undefined) {
      updates.push(`id_lugar_trabajo = $${paramCount}`);
      values.push(id_lugar_trabajo);
      paramCount++;
    }
    if (activo !== undefined) {
      updates.push(`activo = $${paramCount}`);
      values.push(activo);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    values.push(id);

    const query = `
      UPDATE empleados 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.json({ 
      message: "Empleado actualizado exitosamente",
      empleado: result.rows[0] 
    });

  } catch (error) {
    console.error('Error actualizando empleado:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: "La cédula de identidad ya existe" });
    }
    
    res.status(500).json({ error: "Error al actualizar empleado" });
  }
});


// DELETE /api/empleados/:id - Eliminación lógica
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE empleados SET activo = false WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.json({ 
      message: "Empleado eliminado exitosamente",
      empleado: result.rows[0] 
    });

  } catch (error) {
    console.error('Error eliminando empleado:', error);
    res.status(500).json({ error: "Error al eliminar empleado" });
  }
});

// Función para generar usuario automáticamente
function generarUsuario(nombres, paterno) {
  const primeraLetraNombre = nombres.charAt(0).toLowerCase();
  const apellido = paterno.toLowerCase().replace(/\s/g, '');
  return `${primeraLetraNombre}${apellido}`;
}

// PATCH /api/empleados/:id/activar - Activar empleado
router.patch("/:id/activar", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      UPDATE empleados 
      SET activo = true
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.json({ 
      message: "Empleado activado exitosamente",
      empleado: result.rows[0] 
    });

  } catch (error) {
    console.error('Error activando empleado:', error);
    res.status(500).json({ error: "Error al activar empleado" });
  }
});

// PATCH /api/empleados/:id/desactivar - Desactivar empleado
router.patch("/:id/desactivar", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      UPDATE empleados 
      SET activo = false
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.json({ 
      message: "Empleado desactivado exitosamente",
      empleado: result.rows[0] 
    });

  } catch (error) {
    console.error('Error desactivando empleado:', error);
    res.status(500).json({ error: "Error al desactivar empleado" });
  }
});
export default router;