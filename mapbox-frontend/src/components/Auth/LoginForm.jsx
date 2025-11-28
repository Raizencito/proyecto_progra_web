import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    usuario: 'admin',
    password: '123456'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Intentando login con:', credentials);

    try {
      const result = await login(credentials);
      console.log('✅ Login exitoso:', result);
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Error completo en login:', err);
      console.error('❌ Tipo de error:', typeof err);
      console.error('❌ Keys del error:', Object.keys(err));
      
      // Mostrar diferentes tipos de errores
      if (err.error) {
        setError(`Error: ${err.error}`);
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Error desconocido al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <br />
          <small>Revisa la consola (F12) para más detalles</small>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="usuario">Usuario</label>
        <input
          type="text"
          id="usuario"
          name="usuario"
          value={credentials.usuario}
          onChange={handleChange}
          placeholder="Ingresa tu usuario"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Ingresa tu contraseña"
          required
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary btn-block"
        disabled={loading}
      >
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            Iniciando sesión...
          </>
        ) : (
          <>
            <i className="fas fa-sign-in-alt"></i>
            Iniciar Sesión
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;