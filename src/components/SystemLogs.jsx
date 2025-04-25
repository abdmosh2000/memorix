import React, { useState, useEffect } from 'react';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtering
  const [levelFilter, setLevelFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    fetchLogs();
  }, [currentPage, levelFilter, startDate, endDate]);
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(levelFilter && { level: levelFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });
      
      const response = await fetch(`/api/admin/logs?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authTokens')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      setLogs(data.data);
      setTotalPages(data.pagination.pages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching system logs:', err);
      setError('Failed to load system logs');
      setLoading(false);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error': return '#E74C3C';
      case 'warn': return '#F39C12';
      case 'info': return '#3498DB';
      default: return '#95A5A6';
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading system logs...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchLogs} className="primary-button">Retry</button>
      </div>
    );
  }
  
  return (
    <div className="system-logs">
      <h2>System Logs</h2>
      
      <div className="logs-filters">
        <div className="filter-group">
          <label htmlFor="level">Log Level:</label>
          <select 
            id="level" 
            className="filter-select"
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="startDate">Start Date:</label>
          <input 
            type="date" 
            id="startDate"
            className="date-input"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="endDate">End Date:</label>
          <input 
            type="date" 
            id="endDate"
            className="date-input"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        
        <button 
          className="primary-button"
          onClick={() => {
            setStartDate('');
            setEndDate('');
            setLevelFilter('');
          }}
        >
          Clear Filters
        </button>
      </div>
      
      <div className="logs-container">
        {logs.length === 0 ? (
          <p className="no-logs">No logs found for the selected filters.</p>
        ) : (
          <div className="logs-list">
            {logs.map(log => (
              <div key={log.id} className="log-entry">
                <div className="log-header">
                  <span 
                    className="log-level" 
                    style={{ backgroundColor: getLogLevelColor(log.level) }}
                  >
                    {log.level.toUpperCase()}
                  </span>
                  <span className="log-timestamp">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="log-source">{log.source}</span>
                </div>
                <div className="log-message">{log.message}</div>
                {log.details && (
                  <div className="log-details">
                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="pagination">
          <button 
            className="pagination-button" 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-current">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="pagination-button" 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
