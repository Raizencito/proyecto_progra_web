import React, { useState, useEffect } from 'react';
import { empleadoService } from '../../services/empleadoService';
import { lugarService } from '../../services/lugarService';

const EmployeeTab = () => {
  const [empleados, setEmpleados] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [passwordGenerada, setPasswordGenerada] = useState('');
  const [formData, setFormData] = useState({
    paterno: '',
    materno: '',
    nombres: '',
    ci: '',
    telefono: '',
    id_rol: 3, // Por defecto empleado
    id_lugar_trabajo: ''
  });
  const [editFormData, setEditFormData] = useState({
    paterno: '',
    materno: '',
    nombres: '',
    telefono: '',
    id_lugar_trabajo: '',
    password: ''
  });

  const roles = [
    { id: 1, nombre: 'administrador' },
    { id: 2, nombre: 'supervisor' },
    { id: 3, nombre: 'empleado' }
  ];

  useEffect(() => {
    loadEmpleados();
    loadLugares();
  }, []);

  const loadEmpleados = async () => {
    try {
      setLoading(true);
      const data = await empleadoService.getEmpleados();
      setEmpleados(data);
    } catch (error) {
      console.error('Error cargando empleados:', error);
      alert('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const loadLugares = async () => {
    try {
      const data = await lugarService.getLugares();
      setLugares(data);
    } catch (error) {
      console.error('Error cargando lugares:', error);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await empleadoService.createEmpleado(formData);
      
      if (result.password_generada) {
        setPasswordGenerada(result.password_generada);
        alert(`Empleado creado exitosamente!\nUsuario: ${result.empleado.usuario}\nContraseña: ${result.password_generada}`);
      } else {
        alert('Empleado creado exitosamente');
      }
      
      resetForm();
      loadEmpleados();
    } catch (error) {
      console.error('Error creando empleado:', error);
      alert(error.error || 'Error al crear empleado');
    }
  };

  const handleEditSubmit = async (e) => {
  e.preventDefault();
  try {
    // Filtrar solo los campos que han cambiado y no están vacíos
    const datosActualizados = {};
    
    if (editFormData.paterno !== editingEmpleado.paterno) {
      datosActualizados.paterno = editFormData.paterno;
    }
    if (editFormData.materno !== editingEmpleado.materno) {
      datosActualizados.materno = editFormData.materno;
    }
    if (editFormData.nombres !== editingEmpleado.nombres) {
      datosActualizados.nombres = editFormData.nombres;
    }
    if (editFormData.telefono !== editingEmpleado.telefono) {
      datosActualizados.telefono = editFormData.telefono;
    }
    if (editFormData.id_lugar_trabajo !== (editingEmpleado.id_lugar_trabajo || '')) {
      datosActualizados.id_lugar_trabajo = editFormData.id_lugar_trabajo;
    }
    if (editFormData.password && editFormData.password !== '') {
      datosActualizados.password = editFormData.password;
    }

    // Si no hay cambios, mostrar mensaje
    if (Object.keys(datosActualizados).length === 0) {
      alert('No se detectaron cambios para actualizar');
      return;
    }

    console.log('📤 Enviando actualización:', datosActualizados); // Debug

    await empleadoService.updateEmpleado(editingEmpleado.id, datosActualizados);
    alert('Empleado actualizado exitosamente');
    
    resetEditForm();
    loadEmpleados();
  } catch (error) {
    console.error('Error actualizando empleado:', error);
    alert(error.error || 'Error al actualizar empleado');
  }
};

  const handleEdit = (empleado) => {
    setEditingEmpleado(empleado);
    setEditFormData({
      paterno: empleado.paterno,
      materno: empleado.materno,
      nombres: empleado.nombres,
      telefono: empleado.telefono,
      id_lugar_trabajo: empleado.id_lugar_trabajo || '',
      password: ''
    });
  };

  const resetForm = () => {
    setFormData({
      paterno: '',
      materno: '',
      nombres: '',
      ci: '',
      telefono: '',
      id_rol: 3,
      id_lugar_trabajo: ''
    });
    setPasswordGenerada('');
    setShowForm(false);
  };

  const resetEditForm = () => {
    setEditingEmpleado(null);
    setEditFormData({
      paterno: '',
      materno: '',
      nombres: '',
      telefono: '',
      id_lugar_trabajo: '',
      password: ''
    });
  };

  const handleToggleActivo = async (empleado) => {
  const accion = empleado.activo ? 'desactivar' : 'activar';
  
  if (!confirm(`¿Estás seguro de que quieres ${accion} a ${empleado.nombres} ${empleado.paterno}?`)) {
    return;
  }

  try {
    await empleadoService.toggleActivo(empleado.id);
    alert(`Empleado ${accion}do exitosamente`);
    loadEmpleados();
  } catch (error) {
    console.error('Error cambiando estado:', error);
    alert(error.error || 'Error al cambiar estado del empleado');
  }
};
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones en tiempo real
    if ((name === 'paterno' || name === 'materno' || name === 'nombres') && !/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]*$/.test(value)) {
      return; // No permitir números en nombres
    }
    
    if (name === 'telefono' && !/^[67]?\d{0,7}$/.test(value)) {
      return; // Solo números que empiecen con 6 o 7, máximo 8 dígitos
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones en tiempo real
    if ((name === 'paterno' || name === 'materno' || name === 'nombres') && !/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]*$/.test(value)) {
      return;
    }
    
    if (name === 'telefono' && value !== '' && !/^[67]?\d{0,7}$/.test(value)) {
      return;
    }

    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getEstadoBadge = (empleado) => {
    if (!empleado.activo) return <span className="badge badge-danger">Inactivo</span>;
    if (empleado.ultimo_estado === 'fuera') return <span className="badge badge-warning">Fuera</span>;
    if (empleado.ultimo_estado === 'dentro') return <span className="badge badge-success">Dentro</span>;
    return <span className="badge badge-secondary">Sin datos</span>;
  };

  return (
    <div className="employee-tab">
      <div className="tab-header">
        <h2>Gestión de Empleados</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus"></i>
          Nuevo Empleado
        </button>
      </div>

      {/* Formulario de Creación */}
      {showForm && (
        <div className="form-card">
          <h3>Nuevo Empleado</h3>
          <form onSubmit={handleCreateSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Apellido Paterno *</label>
                <input
                  type="text"
                  name="paterno"
                  value={formData.paterno}
                  onChange={handleCreateChange}
                  required
                  pattern="[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+"
                  title="Solo se permiten letras"
                />
              </div>

              <div className="form-group">
                <label>Apellido Materno *</label>
                <input
                  type="text"
                  name="materno"
                  value={formData.materno}
                  onChange={handleCreateChange}
                  required
                  pattern="[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+"
                  title="Solo se permiten letras"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Nombres *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleCreateChange}
                required
                pattern="[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+"
                title="Solo se permiten letras"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Carnet de Identidad *</label>
                <input
                  type="text"
                  name="ci"
                  value={formData.ci}
                  onChange={handleCreateChange}
                  required
                  pattern="[0-9]+"
                  title="Solo se permiten números"
                />
              </div>

              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleCreateChange}
                  required
                  pattern="[67][0-9]{7}"
                  title="8 dígitos que comiencen con 6 o 7"
                  placeholder="71234567"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rol *</label>
                <select
                  name="id_rol"
                  value={formData.id_rol}
                  onChange={handleCreateChange}
                  required
                >
                  {roles.map(rol => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Lugar de Trabajo (Opcional)</label>
                <select
                  name="id_lugar_trabajo"
                  value={formData.id_lugar_trabajo}
                  onChange={handleCreateChange}
                >
                  <option value="">Sin asignar</option>
                  {lugares.map(lugar => (
                    <option key={lugar.id} value={lugar.id}>
                      {lugar.nombre} - {lugar.departamento}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {passwordGenerada && (
              <div className="alert alert-info">
                <strong>Credenciales generadas:</strong><br />
                Usuario: <code>{formData.paterno.toLowerCase()}</code><br />
                Contraseña: <code>{passwordGenerada}</code>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Crear Empleado
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario de Edición */}
      {editingEmpleado && (
        <div className="form-card">
          <h3>Editar Empleado: {editingEmpleado.nombres} {editingEmpleado.paterno}</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Apellido Paterno</label>
                <input
                  type="text"
                  name="paterno"
                  value={editFormData.paterno}
                  onChange={handleEditChange}
                  pattern="[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+"
                  title="Solo se permiten letras"
                />
              </div>

              <div className="form-group">
                <label>Apellido Materno</label>
                <input
                  type="text"
                  name="materno"
                  value={editFormData.materno}
                  onChange={handleEditChange}
                  pattern="[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+"
                  title="Solo se permiten letras"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Nombres</label>
              <input
                type="text"
                name="nombres"
                value={editFormData.nombres}
                onChange={handleEditChange}
                pattern="[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+"
                title="Solo se permiten letras"
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={editFormData.telefono}
                onChange={handleEditChange}
                pattern="[67][0-9]{7}"
                title="8 dígitos que comiencen con 6 o 7"
                placeholder="71234567"
              />
            </div>

            <div className="form-group">
              <label>Lugar de Trabajo</label>
              <select
                name="id_lugar_trabajo"
                value={editFormData.id_lugar_trabajo}
                onChange={handleEditChange}
              >
                <option value="">Sin asignar</option>
                {lugares.map(lugar => (
                  <option key={lugar.id} value={lugar.id}>
                    {lugar.nombre} - {lugar.departamento}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Nueva Contraseña (Opcional)</label>
              <input
                type="password"
                name="password"
                value={editFormData.password}
                onChange={handleEditChange}
                placeholder="Dejar vacío para mantener la actual"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Actualizar Empleado
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetEditForm}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Empleados */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Cargando empleados...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>CI</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Lugar de Trabajo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map(empleado => (
                <tr key={empleado.id}>
                  <td>
                    <strong>{empleado.nombres} {empleado.paterno} {empleado.materno}</strong>
                  </td>
                  <td>{empleado.ci}</td>
                  <td>{empleado.telefono}</td>
                  <td>
                    <span className={`badge badge-${empleado.rol === 'administrador' ? 'primary' : 'secondary'}`}>
                      {empleado.rol}
                    </span>
                  </td>
                  <td>{empleado.lugar_trabajo || 'Sin asignar'}</td>
                  <td>{getEstadoBadge(empleado)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEdit(empleado)}
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      
                      {/* BOTÓN PARA ACTIVAR/DESACTIVAR */}
                      <button
                        className={`btn btn-sm btn-outline ${empleado.activo ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleActivo(empleado)}
                        title={empleado.activo ? 'Desactivar empleado' : 'Activar empleado'}
                      >
                        <i className={`fas ${empleado.activo ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmployeeTab;