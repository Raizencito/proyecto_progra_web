import React from 'react';
import LoginForm from '../components/Auth/LoginForm';

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <i className="fas fa-map-marker-alt fa-3x"></i>
            <h1>Sistema de Geocercas</h1>
            <p>Control de Asistencia por Geocercas</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;