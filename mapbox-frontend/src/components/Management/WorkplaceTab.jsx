import React, { useState, useEffect } from 'react';
import { lugarService } from '../../services/lugarService';
import { useNavigate } from 'react-router-dom';

const WorkplaceTab = () => {
  const [lugares, setLugares] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLugar, setEditingLugar] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    id_departamento: ''
  });

  const navigate = useNavigate();

  // Cargar datos iniciales
  useEffect(() => {
    loadLugares();
    loadDepartamentos();
  }, []);

  const loadLugares = async () => {
    try {
      setLoading(true);
      const data = await lugarService.getLugares();
      setLugares(data);
    } catch (error) {
      console.error('Error cargando lugares:', error);
      alert('Error al cargar lugares de trabajo');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartamentos = async () => {
    try {
      const data = await lugarService.getDepartamentos();
      setDepartamentos(data);
    } catch (error) {
      console.error('Error cargando departamentos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLugar) {
        // ✅ ACTUALIZAR lugar existente (solo datos básicos)
        await lugarService.updateLugar(editingLugar.id, formData);
        alert('Lugar actualizado exitosamente');
        resetForm();
        loadLugares();
      } else {
        // ✅ CREAR nuevo lugar (sin geocerca - se agregará después en el mapa)
        const lugarData = {
          ...formData,
          geocerca: {
            type: "Polygon",
            coordinates: [[
              [-68.152, -16.500],
              [-68.148, -16.500],
              [-68.148, -16.496], 
              [-68.152, -16.496],
              [-68.152, -16.500]
            ]]
          }
        };
        const nuevoLugar = await lugarService.createLugar(lugarData);
        alert('Lugar creado exitosamente. Ahora puedes definir la geocerca en el mapa.');
        
        // 🔥 NUEVO: Redirigir al mapa para definir geocerca
        navigate('/mapa', { 
          state: { 
            modoGeocerca: true, 
            lugarId: nuevoLugar.lugar.id,
            lugarNombre: nuevoLugar.lugar.nombre 
          } 
        });
      }
    } catch (error) {
      console.error('Error guardando lugar:', error);
      alert(error.error || 'Error al guardar lugar');
    }
  };

  // ... el resto del código permanece igual
  const handleEdit = (lugar) => {
    setEditingLugar(lugar);
    setFormData({
      nombre: lugar.nombre,
      direccion: lugar.direccion || '',
      id_departamento: lugar.id_departamento
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este lugar?')) {
      return;
    }

    try {
      await lugarService.deleteLugar(id);
      alert('Lugar eliminado exitosamente');
      loadLugares();
    } catch (error) {
      console.error('Error eliminando lugar:', error);
      alert(error.error || 'Error al eliminar lugar');
    }
  };

  // 🔥 NUEVA FUNCIÓN: Editar geocerca desde la lista
  const handleEditGeocerca = (lugar) => {
    navigate('/mapa', { 
      state: { 
        modoGeocerca: true, 
        lugarId: lugar.id,
        lugarNombre: lugar.nombre 
      } 
    });
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      id_departamento: ''
    });
    setEditingLugar(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="workplace-tab">
      <div className="tab-header">
        <h2>Lugares de Trabajo</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus"></i>
          Nuevo Lugar
        </button>
      </div>

      {/* Formulario (igual que antes) */}
      {showForm && (
        <div className="form-card">
          <h3>{editingLugar ? 'Editar Lugar' : 'Nuevo Lugar'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre del Lugar *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Sede Central La Paz"
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Dirección completa del lugar"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Departamento *</label>
              <select
                name="id_departamento"
                value={formData.id_departamento}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar departamento</option>
                {departamentos.map(depto => (
                  <option key={depto.id} value={depto.id}>
                    {depto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingLugar ? 'Actualizar' : 'Crear'} Lugar
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

      {/* Lista de Lugares - AGREGAR BOTÓN DE GEOCERCA */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Cargando lugares...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Departamento</th>
                <th>Empleados Asignados</th>
                <th>Geocerca</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lugares.map(lugar => (
                <tr key={lugar.id}>
                  <td>
                    <strong>{lugar.nombre}</strong>
                    {lugar.direccion && (
                      <div className="text-muted">{lugar.direccion}</div>
                    )}
                  </td>
                  <td>{lugar.departamento}</td>
                  <td>
                    <span className={`badge ${lugar.empleados_asignados > 0 ? 'badge-primary' : 'badge-secondary'}`}>
                      {lugar.empleados_asignados} empleados
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${lugar.geocerca ? 'badge-success' : 'badge-warning'}`}>
                      {lugar.geocerca ? 'Definida' : 'Por definir'}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${lugar.activo ? 'active' : 'inactive'}`}>
                      {lugar.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEdit(lugar)}
                        title="Editar datos"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline btn-info"
                        onClick={() => handleEditGeocerca(lugar)}
                        title="Editar geocerca en mapa"
                      >
                        <i className="fas fa-draw-polygon"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline btn-danger"
                        onClick={() => handleDelete(lugar.id)}
                        disabled={lugar.empleados_asignados > 0}
                        title={lugar.empleados_asignados > 0 ? 
                          "No se puede eliminar, tiene empleados asignados" : 
                          "Eliminar"
                        }
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && lugares.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-map-marker-alt fa-3x"></i>
            <h3>No hay lugares de trabajo</h3>
            <p>Crea el primer lugar de trabajo para empezar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkplaceTab;