import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import { getAdminUsers, updateUserRole, verifyUser, giftSubscription } from '../api';

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
      setError(null);
      const filters = {
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter })
      };
      
      try {
        const response = await getAdminUsers(currentPage, 10, filters);
        console.log('Received user management data:', response);
        
        // Validate data before updating state
        if (response && response.data && Array.isArray(response.data)) {
          setUsers(response.data);
          setTotalPages(response.pagination?.pages || 1);
        } else {
          console.warn('Received invalid user management data structure:', response);
          // Only show error if we don't have existing data
          if (users.length === 0) {
            setError('Received user data in an unexpected format');
          } else {
            console.log('Keeping existing users data after receiving invalid structure');
          }
        }
      } catch (err) {
        if (err.status === 404) {
          console.warn('Admin users endpoint not available');
          // Don't clear existing data if we already have some
          if (users.length === 0) {
            setError('User management endpoint not available');
          } else {
            console.log('Keeping existing users data after 404 error');
          }
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Keeping existing data.');
      // Don't clear existing data on error
    } finally {
      setLoading(false);
    }
  };
  
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      
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
      await verifyUser(userId);
      
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
      await giftSubscription(userId, subscriptionType, 1, 'Enjoy your complimentary subscription!');
      
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
