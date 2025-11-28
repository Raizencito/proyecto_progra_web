import React, { useState, useEffect } from 'react';
import { useEmpleados } from '../../hooks/useEmpleados';
import { empleadoService } from '../../services/empleadoService';
import { lugarService } from '../../services/lugarService';

const EmployeeTab = () => {
  const { data: empleados, loading, error, refetch } = useEmpleados();
  const [lugares, setLugares] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAsignacionModal, setShowAsignacionModal] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    paterno: '',
    materno: '',
    nombres: '',
    ci: '',
    telefono: '',
    id_rol: 3,
    id_lugar_trabajo: ''
  });
  const [asignacionData, setAsignacionData] = useState({
    id_lugar_trabajo: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [asignacionLoading, setAsignacionLoading] = useState(false);

  // Cargar lugares de trabajo
  useEffect(() => {
    const fetchLugares = async () => {
      try {
        const lugaresData = await lugarService.getLugares();
        setLugares(lugaresData);
      } catch (error) {
        console.error('Error cargando lugares:', error);
      }
    };
    fetchLugares();
  }, []);

  // Filtrar empleados por búsqueda
  const filteredEmpleados = empleados?.filter(empleado => 
    empleado.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.ci.includes(searchTerm)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAsignacionChange = (e) => {
    const { name, value } = e.target;
    setAsignacionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setFormLoading(true);

  try {
    if (editingEmpleado) {
      // Actualizar empleado completo (incluye lugar)
      await empleadoService.updateEmpleado(editingEmpleado.id, formData);
    } else {
      // Crear nuevo empleado
      await empleadoService.createEmpleado(formData);
    }

    setFormData({
      paterno: '',
      materno: '',
      nombres: '',
      ci: '',
      telefono: '',
      id_rol: 3,
      id_lugar_trabajo: ''
    });
    setShowModal(false);
    setEditingEmpleado(null);
    refetch();

    alert(editingEmpleado ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente');

  } catch (error) {
    console.error('Error guardando empleado:', error);
    const errorMessage = error.error || 'Error al guardar empleado';
    alert(`Error: ${errorMessage}`);
  } finally {
    setFormLoading(false);
  }
};

const handleAsignacionSubmit = async (e) => {
  e.preventDefault();
  setAsignacionLoading(true);

  try {
    // Solo actualizar el lugar de trabajo
    await empleadoService.updateLugarTrabajo(selectedEmpleado.id, asignacionData.id_lugar_trabajo);
    
    setShowAsignacionModal(false);
    setSelectedEmpleado(null);
    setAsignacionData({ id_lugar_trabajo: '' });
    refetch();

    alert('Lugar de trabajo asignado correctamente');

  } catch (error) {
    console.error('Error asignando lugar:', error);
    const errorMessage = error.error || 'Error al asignar lugar de trabajo';
    alert(`Error: ${errorMessage}`);
  } finally {
    setAsignacionLoading(false);
  }
};

  const handleDelete = async (empleado) => {
  if (window.confirm(`¿Estás seguro de que quieres desactivar a ${empleado.nombres} ${empleado.paterno}?\n\nEl empleado permanecerá en el sistema pero no podrá acceder a la aplicación.`)) {
    try {
      await empleadoService.deactivateEmpleado(empleado.id);
      refetch();
      alert('Empleado desactivado correctamente');
    } catch (error) {
      console.error('Error desactivando empleado:', error);
      const errorMessage = error.error || 'Error al desactivar empleado';
      alert(`Error: ${errorMessage}`);
    }
  }
};

  const handleActivate = async (empleado) => {
  if (window.confirm(`¿Estás seguro de que quieres reactivar a ${empleado.nombres} ${empleado.paterno}?`)) {
    try {
      await empleadoService.activateEmpleado(empleado.id);
      refetch();
      alert('Empleado reactivado correctamente');
    } catch (error) {
      console.error('Error reactivando empleado:', error);
      const errorMessage = error.error || 'Error al reactivar empleado';
      alert(`Error: ${errorMessage}`);
    }
  }
};

  const handleEdit = (empleado) => {
    setEditingEmpleado(empleado);
    setFormData({
      paterno: empleado.paterno,
      materno: empleado.materno,
      nombres: empleado.nombres,
      ci: empleado.ci,
      telefono: empleado.telefono || '',
      id_rol: empleado.rol === 'administrador' ? 1 : empleado.rol === 'supervisor' ? 2 : 3,
      id_lugar_trabajo: '' // Se puede obtener de la asignación actual si es necesario
    });
    setShowModal(true);
  };

  const handleAsignarLugar = (empleado) => {
    setSelectedEmpleado(empleado);
    setAsignacionData({
      id_lugar_trabajo: ''
    });
    setShowAsignacionModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmpleado(null);
    setFormData({
      paterno: '',
      materno: '',
      nombres: '',
      ci: '',
      telefono: '',
      id_rol: 3,
      id_lugar_trabajo: ''
    });
  };

  const handleCloseAsignacionModal = () => {
    setShowAsignacionModal(false);
    setSelectedEmpleado(null);
    setAsignacionData({
      id_lugar_trabajo: ''
    });
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Cargando empleados...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <i className="fas fa-exclamation-triangle"></i>
      <p>Error: {error}</p>
      <button onClick={refetch} className="btn-retry">Reintentar</button>
    </div>
  );

  return (
    <div className="employee-tab">
      <div className="section-header">
        <div className="header-left">
          <h2>
            <i className="fas fa-users"></i>
            Gestión de Empleados
          </h2>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar empleados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowModal(true)}
        >
          <i className="fas fa-plus"></i> Nuevo Empleado
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>CI</th>
              <th>Teléfono</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Lugar Trabajo</th>
              <th>Estado Geocerca</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmpleados?.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  <i className="fas fa-user-slash"></i>
                  No se encontraron empleados
                </td>
              </tr>
            ) : (
              filteredEmpleados?.map(empleado => (
                <tr key={empleado.id} className={!empleado.activo ? 'inactive' : ''}>
                  <td>
                    <div className="employee-name">
                      <strong>{empleado.nombres} {empleado.paterno} {empleado.materno}</strong>
                    </div>
                  </td>
                  <td>{empleado.ci}</td>
                  <td>{empleado.telefono || '-'}</td>
                  <td>
                    {empleado.usuario || '-'}
                    {empleado.usuario && (
                      <small className="password-hint">
                        Contraseña: {empleado.paterno.toLowerCase()}123
                      </small>
                    )}
                  </td>
                  <td>
                    <span className={`role-badge ${empleado.rol}`}>
                      {empleado.rol}
                    </span>
                  </td>
                  <td>
                    <div className="lugar-asignacion">
                      <span>{empleado.lugar_trabajo || 'Sin asignar'}</span>
                      <button 
                        className="btn-asignar"
                        onClick={() => handleAsignarLugar(empleado)}
                        title="Asignar/ Cambiar lugar de trabajo"
                        disabled={!empleado.activo}
                      >
                        <i className="fas fa-map-marker-alt"></i>
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${empleado.ultimo_estado}`}>
                      {empleado.ultimo_estado === 'dentro' ? '✅ Dentro' : 
                       empleado.ultimo_estado === 'fuera' ? '❌ Fuera' : '⚪ Sin datos'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${empleado.activo ? 'active' : 'inactive'}`}>
                      {empleado.activo ? '🟢 Activo' : '🔴 Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(empleado)}
                        title="Editar empleado"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      
                      {empleado.activo ? (
                        <button 
                          className="btn-delete"
                          onClick={() => handleDelete(empleado)}
                          title="Desactivar empleado"
                        >
                          <i className="fas fa-user-slash"></i>
                        </button>
                      ) : (
                        <button 
                          className="btn-activate"
                          onClick={() => handleActivate(empleado)}
                          title="Reactivar empleado"
                        >
                          <i className="fas fa-user-check"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear/Editar Empleado */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                <i className="fas fa-user"></i>
                {editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              <button className="btn-close" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Apellido Paterno *</label>
                  <input
                    type="text"
                    name="paterno"
                    value={formData.paterno}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Apellido Materno *</label>
                  <input
                    type="text"
                    name="materno"
                    value={formData.materno}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cédula de Identidad *</label>
                  <input
                    type="text"
                    name="ci"
                    value={formData.ci}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Rol *</label>
                  <select
                    name="id_rol"
                    value={formData.id_rol}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={3}>Empleado</option>
                    <option value={2}>Supervisor</option>
                    <option value={1}>Administrador</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Lugar de Trabajo (Opcional)</label>
                  <select
                    name="id_lugar_trabajo"
                    value={formData.id_lugar_trabajo}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar lugar de trabajo</option>
                    {lugares.map(lugar => (
                      <option key={lugar.id} value={lugar.id}>
                        {lugar.nombre} - {lugar.departamento}
                      </option>
                    ))}
                  </select>
                </div>

                {!editingEmpleado && (
                  <div className="form-info full-width">
                    <div className="info-card">
                      <i className="fas fa-info-circle"></i>
                      <div>
                        <strong>Credenciales automáticas:</strong>
                        <p>Usuario: {formData.nombres && formData.paterno ? 
                          `${formData.nombres.charAt(0).toLowerCase()}${formData.paterno.toLowerCase()}` : 
                          '...'}</p>
                        <p>Contraseña: {formData.paterno ? `${formData.paterno.toLowerCase()}123` : '...'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {editingEmpleado ? 'Actualizar' : 'Crear'} Empleado
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Asignar Lugar de Trabajo */}
      {showAsignacionModal && selectedEmpleado && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                <i className="fas fa-map-marker-alt"></i>
                Asignar Lugar de Trabajo
              </h3>
              <button className="btn-close" onClick={handleCloseAsignacionModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleAsignacionSubmit} className="modal-form">
              <div className="form-info full-width">
                <div className="info-card">
                  <i className="fas fa-user"></i>
                  <div>
                    <strong>Empleado:</strong>
                    <p>{selectedEmpleado.nombres} {selectedEmpleado.paterno} {selectedEmpleado.materno}</p>
                    <p><strong>CI:</strong> {selectedEmpleado.ci}</p>
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Lugar de Trabajo *</label>
                <select
                  name="id_lugar_trabajo"
                  value={asignacionData.id_lugar_trabajo}
                  onChange={handleAsignacionChange}
                  required
                >
                  <option value="">Seleccionar lugar de trabajo</option>
                  {lugares.map(lugar => (
                    <option key={lugar.id} value={lugar.id}>
                      {lugar.nombre} - {lugar.departamento}
                    </option>
                  ))}
                </select>
                <small className="form-hint">
                  Al asignar un nuevo lugar, la asignación anterior se desactivará automáticamente.
                </small>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleCloseAsignacionModal}
                  disabled={asignacionLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={asignacionLoading}
                >
                  {asignacionLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Asignando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Asignar Lugar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTab;