import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import UserManagement from '../components/UserManagement';
import ContentManagement from '../components/ContentManagement';
import SystemLogs from '../components/SystemLogs';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isLoggedIn } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if user is admin
  const isAdmin = user && user.role === 'admin';
  
  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  // If not admin, redirect to dashboard
  if (isLoggedIn && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  // Colors for charts
  const colors = {
    primary: '#8E44AD',
    secondary: '#3498DB',
    accent: '#2ECC71',
    warning: '#F39C12',
    error: '#E74C3C',
    grey: '#95A5A6'
  };
  
  // Color array for pie charts
  const pieColors = [
    colors.primary, 
    colors.secondary, 
    colors.accent, 
    colors.warning, 
    colors.error
  ];
  
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab]);
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      // Get token and ensure it's properly formatted
      const authTokens = localStorage.getItem('authTokens');
      let token;
      
      if (authTokens) {
        try {
          // If it's a JSON string, parse it
          const tokenData = JSON.parse(authTokens);
          token = tokenData;
        } catch (e) {
          // If not a valid JSON, use as is
          token = authTokens;
        }
      }
      
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load admin statistics');
      setLoading(false);
    }
  };
  
  const renderOverviewTab = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="primary-button">Retry</button>
        </div>
      );
    }
    
    // For demo purposes, use mock data if stats is null
    const mockData = {
      users: {
        total: 1250,
        new: 87,
        byRole: [
          { _id: 'user', count: 1200 },
          { _id: 'moderator', count: 20 },
          { _id: 'content_curator', count: 15 },
          { _id: 'admin', count: 15 }
        ],
        bySubscription: [
          { _id: 'free', count: 980 },
          { _id: 'premium', count: 210 },
          { _id: 'vip', count: 60 }
        ],
        monthlyTrend: [
          { month: '2025-01', count: 1080 },
          { month: '2025-02', count: 1150 },
          { month: '2025-03', count: 1210 },
          { month: '2025-04', count: 1250 }
        ]
      },
      capsules: {
        total: 3450,
        public: 1230,
        new: 342,
        dailyTrend: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          count: Math.floor(Math.random() * 40) + 10
        }))
      },
      activeSessions: {
        current: 42,
        peak: 65
      },
      systemStatus: {
        healthy: true,
        errorRate: 0.5,
        avgResponseTime: 135
      }
    };
    
    // Use real data if available, otherwise use mock data
    const data = stats || mockData;
    
    // Prepare data for role pie chart
    const roleData = data.users.byRole.map(role => ({
      name: role._id.charAt(0).toUpperCase() + role._id.slice(1),
      value: role.count
    }));
    
    // Prepare data for subscription pie chart
    const subscriptionData = data.users.bySubscription.map(sub => ({
      name: sub._id.charAt(0).toUpperCase() + sub._id.slice(1),
      value: sub.count
    }));
    
    // Format monthly data for trend chart
    const monthlyData = data.users.monthlyTrend.map(item => ({
      month: item.month.substring(5), // Get just MM
      users: item.count
    }));
    
    // Format daily capsule trend data
    const dailyCapsuleData = data.capsules.dailyTrend.map(item => ({
      date: item.date.substring(5), // Get just MM-DD
      capsules: item.count
    }));
    
    return (
      <div className="dashboard-overview">
        <div className="stats-cards">
          <div className="card">
            <div className="card-content">
              <h2>{data.users.total.toLocaleString()}</h2>
              <p>Total Users</p>
            </div>
            <div className="card-icon users-icon">👥</div>
          </div>
          
          <div className="card">
            <div className="card-content">
              <h2>{data.users.new.toLocaleString()}</h2>
              <p>New Users (30 days)</p>
            </div>
            <div className="card-icon new-users-icon">🆕</div>
          </div>
          
          <div className="card">
            <div className="card-content">
              <h2>{data.capsules.total.toLocaleString()}</h2>
              <p>Total Capsules</p>
            </div>
            <div className="card-icon capsules-icon">📦</div>
          </div>
          
          <div className="card">
            <div className="card-content">
              <h2>{data.activeSessions.current.toLocaleString()}</h2>
              <p>Active Users</p>
            </div>
            <div className="card-icon active-icon">🟢</div>
          </div>
        </div>
        
        <div className="charts-grid">
          <div className="chart-container">
            <h3>User Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={colors.primary}
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3>Daily Capsules Created</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyCapsuleData.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="capsules" fill={colors.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3>User Roles Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={colors.primary}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3>Subscriptions Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={colors.primary}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="system-status-panel">
          <h3>System Status</h3>
          <div className="status-indicators">
            <div className={`status-item ${data.systemStatus.healthy ? 'healthy' : 'unhealthy'}`}>
              <div className="status-icon">{data.systemStatus.healthy ? '✅' : '❌'}</div>
              <div className="status-label">System Health</div>
            </div>
            
            <div className="status-item">
              <div className="status-value">{data.systemStatus.errorRate.toFixed(2)}%</div>
              <div className="status-label">Error Rate</div>
            </div>
            
            <div className="status-item">
              <div className="status-value">{data.systemStatus.avgResponseTime} ms</div>
              <div className="status-label">Avg Response Time</div>
            </div>
            
            <div className="status-item">
              <div className="status-value">{data.activeSessions.peak}</div>
              <div className="status-label">Peak Sessions</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-welcome">
          <span>Welcome, {user.name}</span>
          <span className="user-role">{user.role}</span>
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
      
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'content' && <ContentManagement />}
      {activeTab === 'logs' && <SystemLogs />}
    </div>
  );
};

export default AdminDashboard;
