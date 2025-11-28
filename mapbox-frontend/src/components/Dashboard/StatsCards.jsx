import React, { useState, useEffect } from 'react';
import { empleadoService } from '../../services/empleadoService';
import { alertaService } from '../../services/alertaService';
import { lugarService } from '../../services/lugarService';

const StatsCards = () => {
  const [stats, setStats] = useState({
    totalEmpleados: 0,
    empleadosDentro: 0,
    empleadosFuera: 0,
    totalLugares: 0,
    alertasHoy: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch datos en paralelo
        const [empleados, lugares, alertasHoy] = await Promise.all([
          empleadoService.getEmpleados(),
          lugarService.getLugares(),
          alertaService.getAlertasHoy()
        ]);

        // Calcular estadísticas
        const empleadosDentro = empleados.filter(emp => emp.ultimo_estado === 'dentro').length;
        const empleadosFuera = empleados.filter(emp => emp.ultimo_estado === 'fuera').length;

        setStats({
          totalEmpleados: empleados.length,
          empleadosDentro,
          empleadosFuera,
          totalLugares: lugares.length,
          alertasHoy: alertasHoy.length
        });

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="stat-card loading">
            <div className="stat-skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Empleados',
      value: stats.totalEmpleados,
      icon: 'fas fa-users',
      color: 'blue',
      description: 'Empleados activos en el sistema'
    },
    {
      title: 'Dentro de Geocerca',
      value: stats.empleadosDentro,
      icon: 'fas fa-check-circle',
      color: 'green',
      description: 'En su área de trabajo'
    },
    {
      title: 'Fuera de Geocerca',
      value: stats.empleadosFuera,
      icon: 'fas fa-exclamation-triangle',
      color: 'orange',
      description: 'Fuera de su área asignada'
    },
    {
      title: 'Lugares de Trabajo',
      value: stats.totalLugares,
      icon: 'fas fa-map-marker-alt',
      color: 'purple',
      description: 'Geocercas activas'
    },
    {
      title: 'Alertas Hoy',
      value: stats.alertasHoy,
      icon: 'fas fa-bell',
      color: 'red',
      description: 'Alertas del día'
    }
  ];

  return (
    <div className="stats-grid">
      {statCards.map((stat, index) => (
        <div key={index} className={`stat-card stat-${stat.color}`}>
          <div className="stat-icon">
            <i className={stat.icon}></i>
          </div>
          <div className="stat-content">
            <h3>{stat.value}</h3>
            <p>{stat.title}</p>
            <small>{stat.description}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;