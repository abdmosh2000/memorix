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
      
      const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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
      
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
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
      
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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
      
      const response = await fetch(`/api/admin/users/${userId}/gift-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
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
                      <div className="dropdown-menu">
                        <button className="action-button edit-button">
                          👑 Role Actions
                        </button>
                        <div className="dropdown-content">
                          <button 
                            onClick={() => handleRoleChange(user._id, 'user')}
                            className={user.role === 'user' ? 'active' : ''}
                          >
                            Set as User
                          </button>
                          <button 
                            onClick={() => handleRoleChange(user._id, 'moderator')}
                            className={user.role === 'moderator' ? 'active' : ''}
                          >
                            Set as Moderator
                          </button>
                          <button 
                            onClick={() => handleRoleChange(user._id, 'content_curator')}
                            className={user.role === 'content_curator' ? 'active' : ''}
                          >
                            Set as Content Curator
                          </button>
                          {isHeadAdmin && (
                            <button 
                              onClick={() => handleRoleChange(user._id, 'admin')}
                              className={user.role === 'admin' ? 'active' : ''}
                            >
                              Set as Admin
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {!user.verified && (
                        <button 
                          className="action-button verify-button" 
                          onClick={() => handleVerifyUser(user._id)}
                        >
                          ✓ Verify
                        </button>
                      )}
                      
                      <div className="dropdown-menu">
                        <button className="action-button gift-button">
                          🎁 Gift Subscription
                        </button>
                        <div className="dropdown-content">
                          <button onClick={() => giftUserSubscription(user._id, 'free')}>
                            Basic (Free)
                          </button>
                          <button onClick={() => giftUserSubscription(user._id, 'premium')}>
                            Premium (1 Month)
                          </button>
                          <button onClick={() => giftUserSubscription(user._id, 'vip')}>
                            VIP (1 Month)
                          </button>
                        </div>
                      </div>
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
