export const mockResponses = {
  '/api/auth/login': (data) => ({
    empleado: {
      id: 1,
      nombres: "Admin",
      paterno: "Sistema",
      rol: "administrador",
      departamento: "La Paz",
      lugar_trabajo: "Sede Central La Paz"
    },
    token: "mock-jwt-token"
  }),

  '/api/empleados': () => [
    {
      id: 1,
      paterno: "Admin",
      materno: "Sistema", 
      nombres: "Usuario",
      ci: "0000000",
      telefono: "77777777",
      rol: "administrador",
      departamento: "La Paz",
      lugar_trabajo: "Sede Central La Paz",
      ultimo_estado: "dentro"
    },
    {
      id: 2,
      paterno: "Perez",
      materno: "Gomez", 
      nombres: "Juan Carlos",
      ci: "1234567",
      telefono: "77712345",
      rol: "empleado",
      departamento: "La Paz",
      lugar_trabajo: "Sede Central La Paz",
      ultimo_estado: "fuera"
    }
  ],

  '/api/lugares': () => [
    {
      id: 1,
      nombre: "Sede Central La Paz",
      departamento: "La Paz",
      empleados_asignados: 2
    }
  ],

  '/api/alertas/hoy': () => [
    {
      id: 1,
      paterno: "Perez",
      materno: "Gomez", 
      nombres: "Juan Carlos",
      lugar_trabajo: "Sede Central La Paz",
      estado: "fuera",
      fecha_hora: new Date().toISOString()
    }
  ]
};