import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// Después de las otras rutas


// Routes
import ubicacionRoutes from "./routes/ubicacion.routes.js";

import authRoutes from "./routes/auth.routes.js";
import empleadosRoutes from "./routes/empleados.routes.js";
import lugaresRoutes from "./routes/lugares.routes.js";
import alertasRoutes from "./routes/alertas.routes.js";
import asignacionesRoutes from "./routes/asignaciones.routes.js";
import departamentosRoutes from "./routes/departamentos.routes.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado: ", socket.id);
  
  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado: ", socket.id);
  });
});

app.set("io", io);

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/ubicacion", ubicacionRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use("/api/lugares", lugaresRoutes);
app.use("/api/alertas", alertasRoutes);
app.use("/api/asignaciones", asignacionesRoutes);
app.use("/api/departamentos", departamentosRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "🌍 API de Mapbox Tracking funcionando",
    version: "2.0",
    endpoints: {
      auth: "/api/auth",
      ubicacion: "/api/ubicacion",
      empleados: "/api/empleados", 
      lugares: "/api/lugares",
      alertas: "/api/alertas"
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Sistema de Tracking Normalizado v2.0`);
});

// En el endpoint de login, antes del try-catch
