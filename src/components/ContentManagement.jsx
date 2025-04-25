import React, { useState, useEffect } from 'react';

const ContentManagement = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [publicFilter, setPublicFilter] = useState('');
  
  useEffect(() => {
    fetchCapsules();
  }, [currentPage, search, publicFilter]);
  
  const fetchCapsules = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(search && { search }),
        ...(publicFilter && { public: publicFilter })
      });
      
      const response = await fetch(`/api/capsules?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authTokens')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setCapsules(data.capsules || []);
      setTotalPages(data.pagination?.pages || 1);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching capsules:', err);
      setError('Failed to load capsules');
      setLoading(false);
    }
  };
  
  const togglePublicStatus = async (capsuleId, currentStatus) => {
    try {
      const response = await fetch(`/api/capsules/${capsuleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authTokens')}`
        },
        body: JSON.stringify({ isPublic: !currentStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setCapsules(capsules.map(capsule => {
        if (capsule._id === capsuleId) {
          return { ...capsule, isPublic: !currentStatus };
        }
        return capsule;
      }));
    } catch (err) {
      console.error('Error updating capsule:', err);
      setError('Failed to update capsule');
    }
  };
  
  const featureCapsule = async (capsuleId, featured) => {
    try {
      const response = await fetch(`/api/capsules/${capsuleId}/feature`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authTokens')}`
        },
        body: JSON.stringify({ featured: !featured })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setCapsules(capsules.map(capsule => {
        if (capsule._id === capsuleId) {
          return { ...capsule, featured: !featured };
        }
        return capsule;
      }));
    } catch (err) {
      console.error('Error featuring capsule:', err);
      setError('Failed to feature capsule');
    }
  };
  
  const removeCapsule = async (capsuleId) => {
    if (!window.confirm('Are you sure you want to remove this capsule?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/capsules/${capsuleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authTokens')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setCapsules(capsules.filter(capsule => capsule._id !== capsuleId));
    } catch (err) {
      console.error('Error deleting capsule:', err);
      setError('Failed to delete capsule');
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading content...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchCapsules} className="primary-button">Retry</button>
      </div>
    );
  }
  
  return (
    <div className="content-management">
      <h2>Content Management</h2>
      
      <div className="content-filters">
        <div className="filter-group">
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            id="search"
            className="search-input"
            placeholder="Search capsules"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="public">Visibility:</label>
          <select 
            id="public" 
            className="filter-select"
            value={publicFilter}
            onChange={e => setPublicFilter(e.target.value)}
          >
            <option value="">All Capsules</option>
            <option value="true">Public Only</option>
            <option value="false">Private Only</option>
          </select>
        </div>
      </div>
      
      <div className="capsules-grid">
        {capsules.length === 0 ? (
          <p className="no-content">No capsules found.</p>
        ) : (
          capsules.map(capsule => (
            <div key={capsule._id} className="capsule-card">
              <div className="capsule-header">
                <h3>{capsule.title}</h3>
                {capsule.featured && <span className="featured-badge">Featured</span>}
              </div>
              
              <div className="capsule-body">
                <p>{capsule.description.substring(0, 100)}...</p>
                <div className="capsule-meta">
                  <span>By: {capsule.user?.name || 'Unknown'}</span>
                  <span>Created: {new Date(capsule.createdAt).toLocaleDateString()}</span>
                  <span className={`visibility-status ${capsule.isPublic ? 'public' : 'private'}`}>
                    {capsule.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              
              <div className="capsule-actions">
                <button 
                  className="action-button"
                  onClick={() => togglePublicStatus(capsule._id, capsule.isPublic)}
                >
                  {capsule.isPublic ? '🔒 Make Private' : '🌎 Make Public'}
                </button>
                
                <button 
                  className="action-button" 
                  onClick={() => featureCapsule(capsule._id, capsule.featured)}
                >
                  {capsule.featured ? '⭐ Unfeature' : '⭐ Feature'}
                </button>
                
                <button 
                  className="action-button delete-button" 
                  onClick={() => removeCapsule(capsule._id)}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ContentManagement;
