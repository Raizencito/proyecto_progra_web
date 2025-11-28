import React, { useState, useEffect } from 'react';
import { alertaService } from '../../services/alertaService';

const RecentAlerts = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        const alertasHoy = await alertaService.getAlertasHoy();
        setAlertas(alertasHoy.slice(0, 10)); // Últimas 10 alertas
      } catch (error) {
        console.error('Error fetching alertas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertas();
  }, []);

  const getAlertIcon = (estado) => {
    switch (estado) {
      case 'fuera':
        return 'fas fa-exclamation-triangle text-orange-500';
      case 'dentro':
        return 'fas fa-check-circle text-green-500';
      default:
        return 'fas fa-info-circle text-blue-500';
    }
  };

  const getAlertColor = (estado) => {
    switch (estado) {
      case 'fuera':
        return 'alert-outside';
      case 'dentro':
        return 'alert-inside';
      default:
        return 'alert-info';
    }
  };

  const formatFecha = (fechaHora) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleTimeString('es-BO', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="recent-alerts">
        <h2>Alertas Recientes</h2>
        <div className="alerts-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="alert-item loading">
              <div className="alert-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="recent-alerts">
      <div className="section-header">
        <h2>
          <i className="fas fa-bell"></i>
          Alertas Recientes
        </h2>
        <span className="badge">{alertas.length}</span>
      </div>

      {alertas.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-check-circle"></i>
          <p>No hay alertas hoy</p>
          <small>Todo está bajo control</small>
        </div>
      ) : (
        <div className="alerts-list">
          {alertas.map((alerta) => (
            <div key={alerta.id} className={`alert-item ${getAlertColor(alerta.estado)}`}>
              <div className="alert-icon">
                <i className={getAlertIcon(alerta.estado)}></i>
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <strong>
                    {alerta.nombres} {alerta.paterno} {alerta.materno}
                  </strong>
                  <span className="alert-time">
                    {formatFecha(alerta.fecha_hora)}
                  </span>
                </div>
                <div className="alert-body">
                  <p>
                    {alerta.estado === 'fuera' 
                      ? 'Salió de la geocerca' 
                      : 'Ingresó a la geocerca'
                    }
                  </p>
                  <small>{alerta.lugar_trabajo}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentAlerts;