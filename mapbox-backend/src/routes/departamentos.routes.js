import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET /api/departamentos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, COUNT(lt.id) as cantidad_lugares
      FROM departamentos d
      LEFT JOIN lugares_trabajo lt ON d.id = lt.id_departamento AND lt.activo = true
      GROUP BY d.id
      ORDER BY d.nombre
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener departamentos" });
  }
});

// POST /api/departamentos
router.post("/", async (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  try {
    const result = await pool.query(`
      INSERT INTO departamentos (nombre)
      VALUES ($1)
      RETURNING *
    `, [nombre]);

    res.status(201).json({
      message: "Departamento creado exitosamente",
      departamento: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: "El departamento ya existe" });
    }
    
    console.error(error);
    res.status(500).json({ error: "Error al crear departamento" });
  }
});

export default router;