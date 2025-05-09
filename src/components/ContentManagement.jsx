import React, { useState, useEffect } from 'react';
import { getAllCapsules, updateCapsulePublicStatus, featureCapsule, deleteCapsule } from '../api';

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
      setError(null);
      const filters = {
        ...(search && { search }),
        ...(publicFilter && { public: publicFilter })
      };
      
      try {
        const data = await getAllCapsules(currentPage, 10, filters);
        console.log('Received capsules data:', data);
        
        // Check if we got valid data before updating state
        if (data && data.capsules) {
          setCapsules(data.capsules);
          setTotalPages(data.pagination?.pages || 1);
        } else {
          console.warn('Received invalid capsules data structure:', data);
          // Don't overwrite existing data if response is empty/invalid
          if (capsules.length === 0) {
            setError('No content data available');
          }
        }
      } catch (err) {
        if (err.status === 404) {
          console.warn('Capsules endpoint not available');
          // Don't clear existing data if we already have some
          if (capsules.length === 0) {
            setError('Content management endpoint not available');
          } else {
            console.log('Keeping existing capsules data after 404 error');
          }
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Error fetching capsules:', err);
      setError('Failed to load capsules. Keeping existing data.');
      // Don't clear existing data on error
    } finally {
      setLoading(false);
    }
  };
  
  const togglePublicStatus = async (capsuleId, currentStatus) => {
    try {
      await updateCapsulePublicStatus(capsuleId, !currentStatus);
      
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
  
  const handleFeatureCapsule = async (capsuleId, featured) => {
    try {
      await featureCapsule(capsuleId, !featured);
      
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
      await deleteCapsule(capsuleId);
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
    <div className="content-management tab-content">
      <h2 className="section-title">Content Management</h2>
      
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
                <p>{capsule.content ? capsule.content.substring(0, 100) + (capsule.content.length > 100 ? '...' : '') : 'No content'}</p>
                
                {capsule.mediaType && (
                  <div className="capsule-media-indicator">
                    {capsule.mediaType === 'photo' && <span className="media-badge photo-badge">📸 Photo</span>}
                    {capsule.mediaType === 'video' && <span className="media-badge video-badge">🎥 Video</span>}
                    {capsule.mediaType === 'audio' && <span className="media-badge audio-badge">🎙️ Audio</span>}
                  </div>
                )}
                
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
                  onClick={() => handleFeatureCapsule(capsule._id, capsule.featured)}
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
