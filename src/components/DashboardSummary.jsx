import React, { useState, useEffect } from 'react';

const DashboardSummary = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      if (refresh) {
        setRefreshing(true);
      }
      
      // Get token from localStorage
      const authTokens = localStorage.getItem('authTokens');
      let token = '';
      
      if (authTokens) {
        try {
          const tokenData = JSON.parse(authTokens);
          if (typeof tokenData === 'string') {
            token = tokenData;
          } else if (tokenData && tokenData.token) {
            token = tokenData.token;
          }
        } catch (e) {
          token = authTokens; // Not JSON, use as is
        }
      }
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/admin/dashboard-summary', { 
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        // If the endpoint doesn't exist yet, use mock data
        if (response.status === 404) {
          console.warn('Dashboard summary endpoint not available, using mock data');
          setStats(generateMockStats());
          setLoading(false);
          setRefreshing(false);
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics. Please try again.');
      // Fall back to mock data if API fails
      setStats(generateMockStats());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const generateMockStats = () => {
    return {
      users: {
        total: 580,
        newToday: 15,
        activeNow: 48
      },
      capsules: {
        total: 1250,
        public: 750,
        createdToday: 35
      },
      revenue: {
        total: 12500,
        lastMonth: 1850,
        conversionRate: 8.5
      },
      system: {
        responseTime: 250,
        errorRate: 0.8,
        uptime: 99.95
      }
    };
  };
  
  const handleRefresh = () => {
    fetchStats(true);
  };
  
  if (loading && !refreshing) {
    return (
      <div className="dashboard-summary loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard statistics...</p>
      </div>
    );
  }
  
  // Prepare stats object with safe defaults to prevent rendering errors
  const data = stats || {
    users: { total: 0, newToday: 0, activeNow: 0 },
    capsules: { total: 0, public: 0, createdToday: 0 },
    revenue: { total: 0, lastMonth: 0, conversionRate: 0 },
    system: { responseTime: 0, errorRate: 0, uptime: 100 }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Calculate health status based on error rate and uptime
  const getSystemHealthStatus = () => {
    const { errorRate, uptime } = data.system;
    if (errorRate < 1 && uptime > 99.9) {
      return { status: 'Excellent', color: '#2ECC71' };
    } else if (errorRate < 2 && uptime > 99.5) {
      return { status: 'Good', color: '#3498DB' };
    } else if (errorRate < 5 && uptime > 99) {
      return { status: 'Fair', color: '#F39C12' };
    } else {
      return { status: 'Poor', color: '#E74C3C' };
    }
  };
  
  const healthStatus = getSystemHealthStatus();
  
  return (
    <div className="dashboard-summary">
      <div className="summary-header">
        <h2>Dashboard Overview</h2>
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="summary-grid">
        <div className="summary-section users">
          <h3>Users</h3>
          <div className="metrics">
            <div className="metric">
              <span className="value">{data.users.total.toLocaleString()}</span>
              <span className="label">Total Users</span>
            </div>
            <div className="metric">
              <span className="value">+{data.users.newToday.toLocaleString()}</span>
              <span className="label">New Today</span>
            </div>
            <div className="metric">
              <span className="value">{data.users.activeNow.toLocaleString()}</span>
              <span className="label">Active Now</span>
            </div>
          </div>
        </div>
        
        <div className="summary-section capsules">
          <h3>Capsules</h3>
          <div className="metrics">
            <div className="metric">
              <span className="value">{data.capsules.total.toLocaleString()}</span>
              <span className="label">Total Capsules</span>
            </div>
            <div className="metric">
              <span className="value">{data.capsules.public.toLocaleString()}</span>
              <span className="label">Public Capsules</span>
            </div>
            <div className="metric">
              <span className="value">+{data.capsules.createdToday.toLocaleString()}</span>
              <span className="label">Created Today</span>
            </div>
          </div>
        </div>
        
        <div className="summary-section revenue">
          <h3>Revenue</h3>
          <div className="metrics">
            <div className="metric">
              <span className="value">{formatCurrency(data.revenue.total)}</span>
              <span className="label">Total Revenue</span>
            </div>
            <div className="metric">
              <span className="value">{formatCurrency(data.revenue.lastMonth)}</span>
              <span className="label">Last Month</span>
            </div>
            <div className="metric">
              <span className="value">{data.revenue.conversionRate.toFixed(1)}%</span>
              <span className="label">Conversion Rate</span>
            </div>
          </div>
        </div>
        
        <div className="summary-section system">
          <h3>System Health</h3>
          <div className="metrics">
            <div className="metric">
              <span className="value" style={{ color: healthStatus.color }}>{healthStatus.status}</span>
              <span className="label">Status</span>
            </div>
            <div className="metric">
              <span className="value">{data.system.responseTime}ms</span>
              <span className="label">Response Time</span>
            </div>
            <div className="metric">
              <span className="value">{data.system.uptime.toFixed(2)}%</span>
              <span className="label">Uptime</span>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default DashboardSummary;
