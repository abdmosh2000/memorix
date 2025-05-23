import React, { useState, useEffect } from 'react';
import { getPaymentStats } from '../api';
import AChart from './AChart';
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
      if (!refresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      
      try {
        const data = await getPaymentStats(refresh);
        console.log('Payment stats API response:', data);
        
        // Validate data format before updating state
        if (data) {
          if (refresh && data.data && typeof data.data === 'object') {
            console.log('Using data.data from refresh response');
            setPaymentStats(data.data);
          } else if (data.paymentStats && typeof data.paymentStats === 'object') {
            console.log('Using data.paymentStats from response');
            setPaymentStats(data.paymentStats);
          } else if (typeof data === 'object' && (data.totalRevenue !== undefined || 
                     data.subscriptionCounts !== undefined)) {
            // Handle case where the data might be directly in the response
            console.log('Using top-level data object from response');
            setPaymentStats(data);
          } else {
            console.warn('Received payment stats in unexpected format:', data);
            // Only set to null if we don't have existing data
            if (!paymentStats) {
              console.log('No existing payment stats, setting to empty object');
              // Instead of null, use an empty object with expected structure
              setPaymentStats({
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
              });
            } else {
              console.log('Keeping existing payment stats after receiving invalid data');
            }
            setError('Received payment statistics in an unexpected format');
          }
        } else {
          console.warn('No payment stats data received');
          if (!paymentStats) {
            console.log('No existing payment stats, setting to empty object');
            // Instead of null, use an empty object with expected structure
            setPaymentStats({
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
            });
          }
        }
      } catch (err) {
        if (err.status === 404) {
          console.warn('Payment stats endpoint not available');
          // Only set empty data if we don't already have data
          if (!paymentStats) {
            console.log('No existing payment stats, setting to empty object');
            // Instead of null, use an empty object with expected structure
            setPaymentStats({
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
            });
          } else {
            console.log('Keeping existing payment stats after 404 error');
          }
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Error fetching payment stats:', err);
      setError('Failed to load payment statistics. Please try again.');
      
      // Don't modify state if we already have data
      if (!paymentStats) {
        console.log('No existing payment stats, setting to empty object');
        setPaymentStats({
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
        });
      } else {
        console.log('Keeping existing payment stats after error');
      }
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
  
  // Check if we have any meaningful data at all
  const hasAnyData = stats && stats.subscriptionCounts && (
    (stats.subscriptionCounts.free > 0 || 
     stats.subscriptionCounts.premium > 0 || 
     stats.subscriptionCounts.vip > 0) ||
    stats.totalRevenue > 0 || 
    stats.transactions > 0
  );
     
  if (!hasAnyData) {
    console.log('No meaningful data found, showing empty data message');
    return (
      <div className="empty-data">
        <h2>No Payment Data Available</h2>
        <p>There are no payment statistics to display yet. This could be because no users have registered or made payments in the system.</p>
        <button onClick={handleRefreshStats} className="primary-button">Refresh Stats</button>
      </div>
    );
  }
  
  console.log('Rendering payment stats with data:', stats);
  
  // Prepare subscription data for pie chart with empty data handling
  const hasSubscriptionData = stats.subscriptionCounts && 
    (stats.subscriptionCounts.free > 0 || 
     stats.subscriptionCounts.premium > 0 || 
     stats.subscriptionCounts.vip > 0);
  
  const subscriptionData = hasSubscriptionData ? 
    [
      { name: 'Free', value: stats.subscriptionCounts.free || 0 },
      { name: 'Premium', value: stats.subscriptionCounts.premium || 0 },
      { name: 'VIP', value: stats.subscriptionCounts.vip || 0 }
    ] : 
    [{ name: 'No Data', value: 1 }]; // Provide default data if empty
  
  // Prepare monthly revenue data for line chart with empty data handling
  let monthlyRevenueData = [];
  
  if (stats.monthlyRevenue && Object.keys(stats.monthlyRevenue).length > 0) {
    // Use actual data if available
    monthlyRevenueData = Object.entries(stats.monthlyRevenue)
      .map(([month, amount]) => ({ month, revenue: amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
  
  // Ensure we have at least 6 months of data for a meaningful chart
  if (monthlyRevenueData.length < 6) {
    // Generate the last 6 months
    const placeholderMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }).reverse();
    
    // Merge with existing data, keeping actual values where available
    monthlyRevenueData = placeholderMonths.map(month => {
      const existingData = monthlyRevenueData.find(d => d.month === month);
      return existingData || { month, revenue: 0 };
    });
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
            <h2>{formatCurrency(stats.totalRevenue || 0)}</h2>
            <p>Total Revenue</p>
          </div>
          <div className="card-icon">💰</div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <h2>{stats.transactions || 0}</h2>
            <p>Total Transactions</p>
          </div>
          <div className="card-icon">📊</div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <h2>{formatCurrency(stats.averageOrderValue || 0)}</h2>
            <p>Average Order Value</p>
          </div>
          <div className="card-icon">📈</div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <h2>{formatPercent(stats.conversionRate || 0)}</h2>
            <p>Conversion Rate</p>
          </div>
          <div className="card-icon">🔄</div>
        </div>
      </div>
      
      <div className="charts-grid">
        <div className="chart-container">
          <AChart 
            type="line"
            data={monthlyRevenueData}
            dataKey="revenue"
            title="Monthly Revenue"
            height={300}
            colors={colors}
            emptyMessage="No revenue data available yet"
            tooltip={{formatter: (value) => [`$${value}`, 'Revenue']}}
            yAxisLabel="Revenue ($)"
          />
        </div>
        
        <div className="chart-container">
          <AChart 
            type="pie"
            data={subscriptionData}
            valueKey="value"
            nameKey="name"
            title="Subscription Distribution"
            height={300}
            colors={colors}
            emptyMessage="No subscription data available yet"
            tooltip={{formatter: (value) => [value, 'Users']}}
            pieProps={{
              innerRadius: 60,
              outerRadius: 80,
              paddingAngle: 5
            }}
          />
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
                <td>{stats.subscriptionCounts?.free || 0}</td>
                <td>
                  {formatPercent(
                    (stats.subscriptionCounts?.free || 0) / 
                    ((stats.subscriptionCounts?.free || 0) + 
                     (stats.subscriptionCounts?.premium || 0) + 
                     (stats.subscriptionCounts?.vip || 0)) * 100 || 0
                  )}
                </td>
                <td>$0.00</td>
              </tr>
              <tr>
                <td>Premium</td>
                <td>{stats.subscriptionCounts?.premium || 0}</td>
                <td>
                  {formatPercent(
                    (stats.subscriptionCounts?.premium || 0) / 
                    ((stats.subscriptionCounts?.free || 0) + 
                     (stats.subscriptionCounts?.premium || 0) + 
                     (stats.subscriptionCounts?.vip || 0)) * 100 || 0
                  )}
                </td>
                <td>{formatCurrency((stats.subscriptionCounts?.premium || 0) * 9.99)}</td>
              </tr>
              <tr>
                <td>VIP</td>
                <td>{stats.subscriptionCounts?.vip || 0}</td>
                <td>
                  {formatPercent(
                    (stats.subscriptionCounts?.vip || 0) / 
                    ((stats.subscriptionCounts?.free || 0) + 
                     (stats.subscriptionCounts?.premium || 0) + 
                     (stats.subscriptionCounts?.vip || 0)) * 100 || 0
                  )}
                </td>
                <td>{formatCurrency((stats.subscriptionCounts?.vip || 0) * 24.99)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total</strong></td>
                <td>
                  <strong>
                    {(stats.subscriptionCounts?.free || 0) +
                     (stats.subscriptionCounts?.premium || 0) +
                     (stats.subscriptionCounts?.vip || 0)}
                  </strong>
                </td>
                <td>100%</td>
                <td>
                  <strong>
                    {formatCurrency(
                      (stats.subscriptionCounts?.premium || 0) * 9.99 +
                      (stats.subscriptionCounts?.vip || 0) * 24.99
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
