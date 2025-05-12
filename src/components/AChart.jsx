import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * AChart - A wrapper component for recharts that handles empty data gracefully
 * 
 * This component checks if the data is empty or null and displays a placeholder message
 * instead of an empty chart, which can cause rendering issues.
 */
const AChart = ({
  type = 'line', // line, bar, pie
  data = [],
  dataKey,
  nameKey, // for pie charts
  valueKey, // for pie charts
  width = "100%",
  height = 300,
  colors = {
    primary: '#8E44AD',
    secondary: '#3498DB',
    accent: '#2ECC71',
    warning: '#F39C12',
    error: '#E74C3C'
  },
  xAxisLabel = '',
  yAxisLabel = '',
  title = '',
  tooltip = true,
  legend = true,
  emptyMessage = 'No data available',
  ...props
}) => {
  // Function to determine if data is empty
  const isDataEmpty = () => {
    console.log('Checking if data is empty:', data);
    
    // Check if data is missing, not an array, or an empty array
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('Data is empty (not an array or empty array)');
      return true;
    }
    
    // New projects may have valid arrays but with zero or very small values
    // We still want to show these values, not consider them "empty"
    
    // Check if data contains valid entries - NOTE: Zero (0) is now considered valid data!
    const hasValidData = data.some(item => {
      if (!item) return false;
      
      try {
        // For charts requiring dataKey
        if (type === 'line' || type === 'bar') {
          // Check if dataKey is missing
          if (!dataKey) {
            return false;
          }
          // Consider any number (even 0) as valid data
          return item[dataKey] !== undefined && 
                item[dataKey] !== null &&
                item[dataKey] !== '';
        } 
        // For pie charts
        else if (type === 'pie') {
          // Check if valueKey is missing
          if (!valueKey) {
            return false;
          }
          // Consider any number (even 0) as valid data
          return item[valueKey] !== undefined && 
                item[valueKey] !== null &&
                item[valueKey] !== '';
        }
      } catch (error) {
        console.error('Error checking data validity:', error);
        return false;
      }
      
      return false;
    });
    
    console.log('Has valid data:', hasValidData);
    return !hasValidData;
  };

  // Generate default placeholder data for empty charts
  const generatePlaceholderData = () => {
    if (type === 'line' || type === 'bar') {
      return Array.from({ length: 5 }, (_, i) => {
        const item = { name: `Item ${i+1}` };
        item[dataKey] = 0;
        return item;
      });
    } else if (type === 'pie') {
      return [{ name: 'No Data', value: 1 }];
    }
    
    return [];
  };

  // Get the actual data to render
  const chartData = isDataEmpty() ? generatePlaceholderData() : data;
  
  // Array of colors for pie chart segments
  const pieColors = [colors.primary, colors.secondary, colors.accent, colors.warning, colors.error];
  
  // Render an empty state message if data is empty
  if (isDataEmpty()) {
    return (
      <div className="chart-container" style={{ height, width, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {title && <h3>{title}</h3>}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '70%', 
          width: '100%',
          border: '1px dashed #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          color: '#666'
        }}>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width={width} height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
              <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
              {tooltip && <Tooltip />}
              {legend && <Legend />}
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={colors.primary} 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
                {...props.lineProps}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width={width} height={height}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
              <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
              {tooltip && <Tooltip />}
              {legend && <Legend />}
              <Bar 
                dataKey={dataKey} 
                fill={colors.secondary} 
                {...props.barProps}
              />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width={width} height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={props.pieProps?.outerRadius || 80}
                innerRadius={props.pieProps?.innerRadius || 0}
                fill={colors.primary}
                paddingAngle={props.pieProps?.paddingAngle || 0}
                dataKey={valueKey || 'value'}
                nameKey={nameKey || 'name'}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              {tooltip && <Tooltip />}
              {legend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Unsupported chart type: {type}</div>;
    }
  };

  return (
    <div className="chart-container">
      {title && <h3>{title}</h3>}
      {renderChart()}
    </div>
  );
};

export default AChart;
