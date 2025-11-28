import React from 'react';
import Sidebar from '../components/Layout/Sidebar';
import StatsCards from '../components/Dashboard/StatsCards';
import RecentAlerts from '../components/Dashboard/RecentAlerts';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-content">
        <header className="content-header">
          <h1>Dashboard</h1>
          <div className="user-info">
            <span>{user?.nombres} {user?.paterno}</span>
            <i className="fas fa-user-circle"></i>
          </div>
        </header>

        <div className="content">
          <StatsCards />
          <RecentAlerts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;