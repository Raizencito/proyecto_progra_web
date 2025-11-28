import express from "express";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { requireAdmin, requireAdminOrSupervisor } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/empleados
router.get("/", requireAdminOrSupervisor, async (req, res) => {
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
        lt.id as id_lugar_trabajo,
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

// POST /api/empleados - CREAR EMPLEADO
router.post("/", requireAdmin,  async (req, res) => {
  const { paterno, materno, nombres, ci, telefono, id_rol, id_lugar_trabajo } = req.body;

  try {
    // Validaciones
    if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(paterno)) {
      return res.status(400).json({ error: "El apellido paterno solo puede contener letras" });
    }
    if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(materno)) {
      return res.status(400).json({ error: "El apellido materno solo puede contener letras" });
    }
    if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(nombres)) {
      return res.status(400).json({ error: "Los nombres solo pueden contener letras" });
    }
    if (!/^[67]\d{7}$/.test(telefono)) {
      return res.status(400).json({ error: "El teléfono debe tener 8 dígitos y comenzar con 6 o 7" });
    }

    // Generar usuario y contraseña automáticamente
    const usuario = generarUsuario(paterno, materno, nombres);
    const passwordPlana = generarPassword();
    const password_hash = await bcrypt.hash(passwordPlana, 10);

    // Insertar empleado
    const empleadoResult = await pool.query(`
      INSERT INTO empleados (paterno, materno, nombres, ci, telefono, id_rol, usuario, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [paterno, materno, nombres, ci, telefono, id_rol, usuario, password_hash]);

    const empleado = empleadoResult.rows[0];

    // Si se proporcionó lugar de trabajo, crear asignación
    if (id_lugar_trabajo) {
      await pool.query(`
        INSERT INTO asignaciones (id_empleado, id_lugar_trabajo)
        VALUES ($1, $2)
      `, [empleado.id, id_lugar_trabajo]);
    }

    res.status(201).json({
      message: "Empleado creado exitosamente",
      empleado: {
        ...empleado,
        password_generada: passwordPlana // Solo para mostrar una vez
      }
    });

  } catch (error) {
    console.error(error);
    if (error.code === '23505') { // Violación de unique constraint
      res.status(400).json({ error: "El CI o usuario ya existe" });
    } else {
      res.status(500).json({ error: "Error al crear empleado" });
    }
  }
});


router.put("/:id",requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { paterno, materno, nombres, telefono, id_lugar_trabajo, password } = req.body;

  console.log('📝 Actualizando empleado:', id, req.body); // Debug

  try {
    // Validaciones
    if (paterno && !/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(paterno)) {
      return res.status(400).json({ error: "El apellido paterno solo puede contener letras" });
    }
    if (materno && !/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(materno)) {
      return res.status(400).json({ error: "El apellido materno solo puede contener letras" });
    }
    if (nombres && !/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(nombres)) {
      return res.status(400).json({ error: "Los nombres solo pueden contener letras" });
    }
    if (telefono && !/^[67]\d{7}$/.test(telefono)) {
      return res.status(400).json({ error: "El teléfono debe tener 8 dígitos y comenzar con 6 o 7" });
    }

    // Construir query dinámicamente solo con los campos que vienen
    let query = "UPDATE empleados SET ";
    const values = [];
    let paramCount = 1;
    const updates = [];

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
    if (telefono !== undefined) {
      updates.push(`telefono = $${paramCount}`);
      values.push(telefono);
      paramCount++;
    }
    if (password && password !== '') {
      const password_hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCount}`);
      values.push(password_hash);
      paramCount++;
    }

    // Si no hay campos para actualizar, retornar error
    if (updates.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    
    
    query += updates.join(', ') + ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    console.log('🔍 Query:', query); // Debug
    console.log('🔍 Values:', values); // Debug

    const empleadoResult = await pool.query(query, values);

    if (empleadoResult.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    // Manejar asignación de lugar de trabajo si se proporciona
    if (id_lugar_trabajo !== undefined) {
      console.log('🏢 Actualizando lugar de trabajo:', id_lugar_trabajo); // Debug
      
      if (id_lugar_trabajo) {
        // Verificar si ya existe una asignación activa
        const asignacionExistente = await pool.query(`
          SELECT id FROM asignaciones 
          WHERE id_empleado = $1 AND activa = true
        `, [id]);

        if (asignacionExistente.rows.length > 0) {
          // Actualizar asignación existente
          await pool.query(`
            UPDATE asignaciones 
            SET id_lugar_trabajo = $1, fecha_asignacion = CURRENT_DATE
            WHERE id_empleado = $2 AND activa = true
          `, [id_lugar_trabajo, id]);
        } else {
          // Crear nueva asignación
          await pool.query(`
            INSERT INTO asignaciones (id_empleado, id_lugar_trabajo)
            VALUES ($1, $2)
          `, [id, id_lugar_trabajo]);
        }
      } else {
        // Remover asignación (id_lugar_trabajo es null o vacío)
        await pool.query(`
          UPDATE asignaciones 
          SET activa = false, fecha_finalizacion = CURRENT_DATE
          WHERE id_empleado = $1 AND activa = true
        `, [id]);
      }
    }

    res.json({
      message: "Empleado actualizado exitosamente",
      empleado: empleadoResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error al actualizar empleado:', error);
    res.status(500).json({ error: "Error al actualizar empleado: " + error.message });
  }
});

// PATCH /api/empleados/:id/toggle-activo - ACTIVAR/DESACTIVAR EMPLEADO
router.patch("/:id/toggle-activo",requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener estado actual
    const empleadoActual = await pool.query(
      "SELECT activo FROM empleados WHERE id = $1",
      [id]
    );

    if (empleadoActual.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    const nuevoEstado = !empleadoActual.rows[0].activo;

    // Actualizar estado
    const result = await pool.query(`
      UPDATE empleados 
      SET activo = $1
      WHERE id = $2
      RETURNING *
    `, [nuevoEstado, id]);

    res.json({
      message: `Empleado ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
      empleado: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cambiar estado del empleado" });
  }
});

// Funciones auxiliares
function generarUsuario(paterno, materno, nombres) {
  // Primera letra del primer nombre + apellido paterno
  const primerNombre = nombres.split(' ')[0].toLowerCase();
  const usuarioBase = (primerNombre.charAt(0) + paterno.toLowerCase())
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9]/g, ""); // Remover caracteres especiales
  
  return usuarioBase;
}

function generarPassword() {
  const longitud = 8;
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < longitud; i++) {
    password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return password;
}

export default router;