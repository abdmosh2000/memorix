import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter })
      });
      
      const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authTokens')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data.data);
      setTotalPages(data.pagination.pages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setLoading(false);
    }
  };
  
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authTokens')}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setUsers(users.map(u => {
        if (u._id === userId) {
          return { ...u, role: newRole };
        }
        return u;
      }));
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };
  
  const handleVerifyUser = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authTokens')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setUsers(users.map(u => {
        if (u._id === userId) {
          return { ...u, verified: true };
        }
        return u;
      }));
    } catch (err) {
      console.error('Error verifying user:', err);
      setError('Failed to verify user');
    }
  };
  
  const giftUserSubscription = async (userId, subscriptionType) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/gift-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authTokens')}`
        },
        body: JSON.stringify({
          subscriptionType,
          durationMonths: 1,
          message: 'Enjoy your complimentary subscription!'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setUsers(users.map(u => {
        if (u._id === userId) {
          return { ...u, subscription: subscriptionType };
        }
        return u;
      }));
    } catch (err) {
      console.error('Error gifting subscription:', err);
      setError('Failed to gift subscription');
    }
  };
  
  const renderRoleBadge = (role) => {
    let badgeClass = 'role-badge ';
    switch(role) {
      case 'admin': badgeClass += 'role-admin'; break;
      case 'moderator': badgeClass += 'role-moderator'; break;
      case 'content_curator': badgeClass += 'role-curator'; break;
      default: badgeClass += 'role-user';
    }
    
    return <span className={badgeClass}>{role}</span>;
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchUsers} className="primary-button">Retry</button>
      </div>
    );
  }
  
  const isHeadAdmin = user?.email?.toLowerCase() === 'abdmosh2000@gmail.com';
  
  return (
    <div className="users-table-container">
      <div className="users-filters">
        <div className="filter-group">
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            id="search"
            className="search-input"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="role">Role:</label>
          <select 
            id="role" 
            className="filter-select"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="content_curator">Content Curator</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      
      <table className="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Subscription</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{renderRoleBadge(user.role)}</td>
              <td>{user.subscription}</td>
              <td>
                {user.verified ? 
                  <span style={{ color: '#2ECC71' }}>✓ Verified</span> : 
                  <span style={{ color: '#E74C3C' }}>✗ Unverified</span>}
              </td>
              <td>
                <div className="user-actions">
                  {(isHeadAdmin || user.email.toLowerCase() !== 'abdmosh2000@gmail.com') && (
                    <>
                      <button 
                        className="action-button edit-button"
                        onClick={() => handleRoleChange(user._id, user.role === 'user' ? 'moderator' : 'user')}
                      >
                        👑 Change Role
                      </button>
                      
                      {!user.verified && (
                        <button 
                          className="action-button verify-button" 
                          onClick={() => handleVerifyUser(user._id)}
                        >
                          ✓ Verify
                        </button>
                      )}
                      
                      <button 
                        className="action-button" 
                        onClick={() => giftUserSubscription(user._id, 'premium')}
                      >
                        🎁 Gift Premium
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
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

export default UserManagement;
