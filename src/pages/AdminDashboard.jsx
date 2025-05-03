import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import UserManagement from '../components/UserManagement';
import ContentManagement from '../components/ContentManagement';
import SystemLogs from '../components/SystemLogs';
import PaymentStats from '../components/PaymentStats';
import UserStats from '../components/UserStats';
import DashboardSummary from '../components/DashboardSummary';
import SEO from '../components/SEO';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if user is admin
  const isAdmin = user && user.role === 'admin';
  
  // Handle auth redirects
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  if (isLoggedIn && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="admin-dashboard">
      <SEO 
        title="Admin Dashboard - Memorix"
        description="Memorix admin dashboard for managing users, content, and system statistics."
        keywords="admin dashboard, user management, content management, payment statistics, system metrics"
        noindex={true} // Prevent search engines from indexing the admin area
      />
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-welcome">
          <span>Welcome, {user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
      </header>
      
      <div className="tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={activeTab === 'content' ? 'active' : ''}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button 
          className={activeTab === 'logs' ? 'active' : ''}
          onClick={() => setActiveTab('logs')}
        >
          System
        </button>
      </div>
      
      {activeTab === 'overview' && (
        <>
          <DashboardSummary />
          <UserStats />
          <PaymentStats />
        </>
      )}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'content' && <ContentManagement />}
      {activeTab === 'logs' && <SystemLogs />}
    </div>
  );
};

export default AdminDashboard;
