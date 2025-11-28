import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <i className="fas fa-map-marker-alt"></i>
        <span>GeoAdmin</span>
      </div>
      
      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <i className="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </Link>
        
        <Link 
          to="/gestion" 
          className={`nav-item ${location.pathname === '/gestion' ? 'active' : ''}`}
        >
          <i className="fas fa-users-cog"></i>
          <span>Gestión</span>
        </Link>
        
        <Link 
          to="/mapa" 
          className={`nav-item ${location.pathname === '/mapa' ? 'active' : ''}`}
        >
          <i className="fas fa-map"></i>
          <span>Mapa</span>
        </Link>
        
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Cerrar Sesión</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;