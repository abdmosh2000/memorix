import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import config from '../config';

const PaymentStats = () => {
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Colors for charts
  const colors = {
    primary: '#8E44AD',
    secondary: '#3498DB',
    accent: '#2ECC71',
    warning: '#F39C12',
    error: '#E74C3C'
  };

  // Color array for pie charts
  const pieColors = [colors.primary, colors.secondary, colors.accent];
  
  const fetchPaymentStats = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      if (refresh) {
        setRefreshing(true);
      }
      
      const endpoint = refresh ? '/api/stats/refresh-payment' : '/api/stats';
      
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
      
      const response = await fetch(endpoint, { 
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (refresh) {
        setPaymentStats(data.data);
      } else {
        setPaymentStats(data.paymentStats);
      }
    } catch (err) {
      console.error('Error fetching payment stats:', err);
      setError('Failed to load payment statistics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchPaymentStats();
  }, []);
  
  const handleRefreshStats = () => {
    fetchPaymentStats(true);
  };
  
  if (loading && !refreshing) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading payment statistics...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => fetchPaymentStats()} className="primary-button">Retry</button>
      </div>
    );
  }
  
  // Check if paymentStats is available, or create a default structure to prevent UI errors
  const stats = paymentStats || {
    totalRevenue: 0,
    transactions: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    subscriptionCounts: {
      free: 0,
      premium: 0,
      vip: 0
    },
    monthlyRevenue: {}
  };
  
  // Check if we have any data at all
  const hasAnyData = stats.subscriptionCounts && 
    (stats.subscriptionCounts.free > 0 || 
     stats.subscriptionCounts.premium > 0 || 
     stats.subscriptionCounts.vip > 0);
     
  if (!paymentStats && !hasAnyData) {
    return (
      <div className="empty-data">
        <h2>No Payment Data Available</h2>
        <p>There are no payment statistics to display yet. This could be because no users have registered or made payments in the system.</p>
        <button onClick={handleRefreshStats} className="primary-button">Refresh Stats</button>
      </div>
    );
  }
  
  // Prepare subscription data for pie chart
  const subscriptionData = [
    { name: 'Free', value: stats.subscriptionCounts.free || 0 },
    { name: 'Premium', value: stats.subscriptionCounts.premium || 0 },
    { name: 'VIP', value: stats.subscriptionCounts.vip || 0 }
  ];
  
  // Prepare monthly revenue data for line chart
  const monthlyRevenueData = Object.entries(stats.monthlyRevenue || {})
    .map(([month, amount]) => ({ month, revenue: amount }))
    .sort((a, b) => a.month.localeCompare(b.month));
  
  // If there's less than 2 months of data, add some placeholder months
  if (monthlyRevenueData.length < 2) {
    const currentDate = new Date();
    for (let i = 0; i < (2 - monthlyRevenueData.length); i++) {
      const month = new Date(currentDate);
      month.setMonth(currentDate.getMonth() - i - 1);
      const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyRevenueData.find(d => d.month === monthStr)) {
        monthlyRevenueData.unshift({ month: monthStr, revenue: 0 });
      }
    }
    
    // Sort again after adding placeholders
    monthlyRevenueData.sort((a, b) => a.month.localeCompare(b.month));
  }
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  return (
    <div className="payment-stats">
      <div className="stats-header">
        <h2>Payment Statistics</h2>
        <button 
          onClick={handleRefreshStats} 
          className="refresh-button"
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      <div className="stats-cards">
        <div className="card">
          <div className="card-content">
            <h2>{formatCurrency(paymentStats.totalRevenue || 0)}</h2>
            <p>Total Revenue</p>
          </div>
          <div className="card-icon">💰</div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <h2>{paymentStats.transactions || 0}</h2>
            <p>Total Transactions</p>
          </div>
          <div className="card-icon">📊</div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <h2>{formatCurrency(paymentStats.averageOrderValue || 0)}</h2>
            <p>Average Order Value</p>
          </div>
          <div className="card-icon">📈</div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <h2>{formatPercent(paymentStats.conversionRate || 0)}</h2>
            <p>Conversion Rate</p>
          </div>
          <div className="card-icon">🔄</div>
        </div>
      </div>
      
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Revenue" 
                stroke={colors.primary} 
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h3>Subscription Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {subscriptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Users']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="subscription-details">
        <h3>Subscription Details</h3>
        <div className="subscription-table">
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Users</th>
                <th>% of Total</th>
                <th>Monthly Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Free</td>
                <td>{paymentStats.subscriptionCounts?.free || 0}</td>
                <td>
                  {formatPercent(
                    (paymentStats.subscriptionCounts?.free || 0) / 
                    ((paymentStats.subscriptionCounts?.free || 0) + 
                     (paymentStats.subscriptionCounts?.premium || 0) + 
                     (paymentStats.subscriptionCounts?.vip || 0)) * 100 || 0
                  )}
                </td>
                <td>$0.00</td>
              </tr>
              <tr>
                <td>Premium</td>
                <td>{paymentStats.subscriptionCounts?.premium || 0}</td>
                <td>
                  {formatPercent(
                    (paymentStats.subscriptionCounts?.premium || 0) / 
                    ((paymentStats.subscriptionCounts?.free || 0) + 
                     (paymentStats.subscriptionCounts?.premium || 0) + 
                     (paymentStats.subscriptionCounts?.vip || 0)) * 100 || 0
                  )}
                </td>
                <td>{formatCurrency((paymentStats.subscriptionCounts?.premium || 0) * 9.99)}</td>
              </tr>
              <tr>
                <td>VIP</td>
                <td>{paymentStats.subscriptionCounts?.vip || 0}</td>
                <td>
                  {formatPercent(
                    (paymentStats.subscriptionCounts?.vip || 0) / 
                    ((paymentStats.subscriptionCounts?.free || 0) + 
                     (paymentStats.subscriptionCounts?.premium || 0) + 
                     (paymentStats.subscriptionCounts?.vip || 0)) * 100 || 0
                  )}
                </td>
                <td>{formatCurrency((paymentStats.subscriptionCounts?.vip || 0) * 24.99)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total</strong></td>
                <td>
                  <strong>
                    {(paymentStats.subscriptionCounts?.free || 0) +
                     (paymentStats.subscriptionCounts?.premium || 0) +
                     (paymentStats.subscriptionCounts?.vip || 0)}
                  </strong>
                </td>
                <td>100%</td>
                <td>
                  <strong>
                    {formatCurrency(
                      (paymentStats.subscriptionCounts?.premium || 0) * 9.99 +
                      (paymentStats.subscriptionCounts?.vip || 0) * 24.99
                    )}
                  </strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentStats;
