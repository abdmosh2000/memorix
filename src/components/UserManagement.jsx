import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import { getAdminUsers, updateUserRole, verifyUser, giftSubscription } from '../api';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      
      // Create subscription object based on the type
      const subscriptionObject = {
        plan_name: subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1),
        subscribed_at: new Date(),
        payment_method: 'Manual',
        status: subscriptionType === 'vip' ? 'lifetime' : 'active',
        expiry_date: subscriptionType === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days for non-free
      };
      
      setUsers(users.map(u => {
        if (u._id === userId) {
          return { ...u, subscription: subscriptionObject };
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
              <td>
                {typeof user.subscription === 'string' ? (
                  // Legacy string format
                  <span className={`subscription-badge ${user.subscription}-subscription`}>
                    {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
                  </span>
                ) : user.subscription && user.subscription.plan_name ? (
                  // New object format
                  <div className="subscription-info">
                    <span className={`subscription-badge ${user.subscription.plan_name.toLowerCase()}-subscription`}>
                      {user.subscription.plan_name}
                    </span>
                    <span className="subscription-status">
                      {user.subscription.status === 'lifetime' ? 'Lifetime' : 
                       user.subscription.status === 'active' ? 'Active' : 
                       user.subscription.status}
                    </span>
                    {user.subscription.expiry_date && (
                      <span className="subscription-expiry">
                        Expires: {new Date(user.subscription.expiry_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  // Fallback for missing subscription data
                  <span className="subscription-badge free-subscription">Free</span>
                )}
              </td>
              <td>
                <div className="verified-status">
                  {user.verified ? 
                    <span className="verified-badge verified">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                      </svg>
                      Verified
                    </span> : 
                    <span className="verified-badge unverified">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
                      </svg>
                      Unverified
                    </span>}
                </div>
              </td>
              <td>
                <div className="user-actions">
                  {(isHeadAdmin || user.email.toLowerCase() !== 'abdmosh2000@gmail.com') && (
                    <button 
                      className="action-button edit-user-button"
                      onClick={() => navigate(`/admin/edit-user/${user._id}`)}
                    >
                      ✏️ Edit User
                    </button>
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
