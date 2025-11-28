import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import EmployeeTab from '../components/Management/EmployeeTab';
import DepartmentTab from '../components/Management/DepartmentTab';
import WorkplaceTab from '../components/Management/WorkplaceTab';
import { useAuth } from '../context/AuthContext';

const Management = () => {
  const [activeTab, setActiveTab] = useState('empleados');
  const { user } = useAuth();

  const tabs = [
    { id: 'empleados', label: 'Empleados', icon: 'fas fa-users' },
    { id: 'departamentos', label: 'Departamentos', icon: 'fas fa-building' },
    { id: 'lugares', label: 'Lugares de Trabajo', icon: 'fas fa-map-marker-alt' }
  ];

  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-content">
        <header className="content-header">
          <h1>Gestión del Sistema</h1>
          <div className="user-info">
            <span>{user?.nombres} {user?.paterno}</span>
            <i className="fas fa-user-circle"></i>
          </div>
        </header>

        <div className="content">
          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'empleados' && <EmployeeTab />}
            {activeTab === 'departamentos' && <DepartmentTab />}
            {activeTab === 'lugares' && <WorkplaceTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;