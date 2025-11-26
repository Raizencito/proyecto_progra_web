import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

router.get("/empleados", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM empleados");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

export default router;
