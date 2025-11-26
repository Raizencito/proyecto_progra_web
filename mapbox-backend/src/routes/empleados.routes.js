import express from "express";
import { pool } from "../config/db.js";
//import bcrypt from "bcryptjs";

const router = express.Router();

// GET /api/empleados (YA EXISTE)
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
        r.nombre as rol,
        d.nombre as departamento,
        lt.nombre as lugar_trabajo,
        (
          SELECT estado 
          FROM alertas_geocerca 
          WHERE id_empleado = e.id 
          ORDER BY fecha_hora DESC 
          LIMIT 1
        ) as ultimo_estado
      FROM empleados e
      INNER JOIN roles r ON e.id_rol = r.id
      LEFT JOIN asignaciones a ON e.id = a.id_empleado AND a.activa = true
      LEFT JOIN lugares_trabajo lt ON a.id_lugar_trabajo = lt.id
      LEFT JOIN departamentos d ON lt.id_departamento = d.id
      ORDER BY e.paterno, e.materno
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

// POST /api/empleados (NUEVO - CREAR EMPLEADO)
router.post("/", async (req, res) => {
  const { 
    paterno, 
    materno, 
    nombres, 
    ci, 
    telefono, 
    id_rol, 
    usuario, 
    password,
    id_lugar_trabajo 
  } = req.body;

  // Validaciones básicas
  if (!paterno || !materno || !nombres || !ci || !id_rol) {
    return res.status(400).json({ 
      error: "Faltan campos obligatorios: paterno, materno, nombres, ci, id_rol" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Crear el empleado
    const empleadoResult = await client.query(`
      INSERT INTO empleados 
        (paterno, materno, nombres, ci, telefono, id_rol, usuario, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      paterno, 
      materno, 
      nombres, 
      ci, 
      telefono || null, 
      id_rol, 
      usuario || null, 
      password ? await bcrypt.hash(password, 10) : null
    ]);

    const nuevoEmpleado = empleadoResult.rows[0];

    // 2. Si se proporcionó un lugar de trabajo, crear asignación
    if (id_lugar_trabajo) {
      await client.query(`
        INSERT INTO asignaciones (id_empleado, id_lugar_trabajo)
        VALUES ($1, $2)
      `, [nuevoEmpleado.id, id_lugar_trabajo]);
    }

    await client.query('COMMIT');

    // Eliminar password_hash de la respuesta
    const { password_hash, ...empleadoSinPassword } = nuevoEmpleado;

    res.status(201).json({
      message: "Empleado creado exitosamente",
      empleado: empleadoSinPassword
    });

  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === '23505') { // Violación de unique constraint
      if (error.constraint === 'empleados_ci_key') {
        return res.status(400).json({ error: "El CI ya existe en el sistema" });
      }
      if (error.constraint === 'empleados_usuario_key') {
        return res.status(400).json({ error: "El usuario ya existe" });
      }
    }
    
    console.error("Error al crear empleado:", error);
    res.status(500).json({ error: "Error al crear empleado" });
  } finally {
    client.release();
  }
});

export default router;