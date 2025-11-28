import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// POST /api/ubicacion/registrar
router.post("/registrar", async (req, res) => {
  const io = req.app.get("io");
  const { empleadoId, lat, lng, precision } = req.body;

  try {
    // 1. Obtener la asignación activa del empleado
    const asignacionResult = await pool.query(`
      SELECT a.id_lugar_trabajo, lt.geocerca, lt.nombre as lugar_nombre
      FROM asignaciones a
      INNER JOIN lugares_trabajo lt ON a.id_lugar_trabajo = lt.id
      WHERE a.id_empleado = $1 AND a.activa = true
      LIMIT 1
    `, [empleadoId]);

    if (asignacionResult.rows.length === 0) {
      return res.status(404).json({ error: "Empleado sin asignación activa" });
    }

    const asignacion = asignacionResult.rows[0];
    const punto = `POINT(${lng} ${lat})`;

    // 2. Guardar ubicación
    await pool.query(`
      INSERT INTO ubicaciones (id_empleado, ubicacion, precision, bateria)
      VALUES ($1, ST_SetSRID(ST_GeomFromText($2), 4326), $3, $4)
    `, [empleadoId, punto, precision, bateria]);

    // 3. Verificar si está dentro de la geocerca
    const dentroResult = await pool.query(`
      SELECT ST_Within(
        ST_SetSRID(ST_GeomFromText($1), 4326),
        $2
      ) AS dentro
    `, [punto, asignacion.geocerca]);

    const dentro = dentroResult.rows[0].dentro;
    const nuevoEstado = dentro ? "dentro" : "fuera";

    // 4. Obtener último estado de alerta
    const lastAlert = await pool.query(`
      SELECT estado 
      FROM alertas_geocerca 
      WHERE id_empleado = $1 
      ORDER BY fecha_hora DESC 
      LIMIT 1
    `, [empleadoId]);

    const estadoAnterior = lastAlert.rows[0]?.estado;

    // 5. Solo guardar alerta si cambió el estado
    if (estadoAnterior !== nuevoEstado) {
      await pool.query(`
        INSERT INTO alertas_geocerca (id_empleado, estado, id_lugar_trabajo, ubicacion)
        VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromText($4), 4326))
      `, [empleadoId, nuevoEstado, asignacion.id_lugar_trabajo, punto]);

      // 6. Enviar alerta en tiempo real
      io.emit("alertaGeocerca", {
        empleadoId,
        estado: nuevoEstado,
        lat,
        lng,
        lugar: asignacion.lugar_nombre,
        mensaje: nuevoEstado === "fuera" 
          ? "⚠️ Empleado salió de la geocerca" 
          : "🟢 Empleado entró a la geocerca",
        fecha_hora: new Date()
      });
    }

    res.json({ 
      success: true, 
      dentro, 
      estado: nuevoEstado,
      mensaje: `Ubicación registrada - ${nuevoEstado} de geocerca`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar ubicación" });
  }
});

// GET /api/ubicacion/empleado/:id
router.get("/empleado/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        ST_X(u.ubicacion) as lng,
        ST_Y(u.ubicacion) as lat,
        u.precision,
        u.fecha_hora
      FROM ubicaciones u
      WHERE u.id_empleado = $1
      ORDER BY u.fecha_hora DESC
      LIMIT 50
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener ubicaciones" });
  }
});

export default router;