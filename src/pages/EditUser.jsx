import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { getUserById, updateUserRole, verifyUser, giftSubscription } from '../api';
import './EditUser.css';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form states
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState('free');
  const [durationMonths, setDurationMonths] = useState(1);
  const [activeTab, setActiveTab] = useState('role');
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(userId);
        setUser(userData);
        
        if (userData) {
          setSelectedRole(userData.role);
          
          // Initialize subscription form value
          if (typeof userData.subscription === 'string') {
            setSelectedSubscription(userData.subscription);
          } else if (userData.subscription && userData.subscription.plan_name) {
            setSelectedSubscription(userData.subscription.plan_name.toLowerCase());
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  // Role update handler
  const handleRoleUpdate = async () => {
    try {
      setSuccessMessage('');
      setError(null);
      
      await updateUserRole(userId, selectedRole);
      setSuccessMessage(`User role updated to ${selectedRole} successfully!`);
      
      // Update local state
      setUser(prev => ({ ...prev, role: selectedRole }));
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update user role.');
    }
  };
  
  // Verification handler
  const handleVerify = async () => {
    try {
      setSuccessMessage('');
      setError(null);
      
      if (!user.verified) {
        await verifyUser(userId);
        setSuccessMessage('User verified successfully!');
        
        // Update local state
        setUser(prev => ({ ...prev, verified: true }));
      } else {
        setSuccessMessage('This user is already verified.');
      }
    } catch (err) {
      console.error('Error verifying user:', err);
      setError('Failed to verify user.');
    }
  };
  
  // Subscription update handler
  const handleSubscriptionUpdate = async () => {
    try {
      setSuccessMessage('');
      setError(null);
      
      await giftSubscription(
        userId, 
        selectedSubscription, 
        durationMonths, 
        'Enjoy your complimentary subscription!'
      );
      
      const subscriptionName = selectedSubscription.charAt(0).toUpperCase() + selectedSubscription.slice(1);
      setSuccessMessage(`Subscription updated to ${subscriptionName} successfully!`);
      
      // Update local state with new subscription
      const isLifetime = selectedSubscription === 'lifetime';
      let expiryDate = null;
      
      if (!isLifetime && selectedSubscription !== 'free') {
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + parseInt(durationMonths));
      }
      
      const subscriptionObject = {
        plan_name: subscriptionName,
        status: isLifetime ? 'lifetime' : 'active',
        subscribed_at: new Date(),
        expiry_date: expiryDate
      };
      
      setUser(prev => ({ ...prev, subscription: subscriptionObject }));
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError('Failed to update subscription.');
    }
  };
  
  if (loading) {
    return (
      <div className="edit-user-page">
        <div className="edit-user-container">
          <div className="loading-spinner"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="edit-user-page">
        <div className="edit-user-container">
          <div className="edit-user-header">
            <Link to="/admin/dashboard" className="back-button">
              ← Back to Dashboard
            </Link>
            <h1>User Not Found</h1>
          </div>
          <div className="error-message">
            <p>Could not find user with ID: {userId}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Helper function to get subscription display info
  const getSubscriptionInfo = () => {
    if (typeof user.subscription === 'string') {
      return {
        name: user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1),
        status: 'active',
        expiry: null
      };
    } else if (user.subscription && user.subscription.plan_name) {
      return {
        name: user.subscription.plan_name,
        status: user.subscription.status || 'active',
        expiry: user.subscription.expiry_date
      };
    } else {
      return {
        name: 'Free',
        status: 'active',
        expiry: null
      };
    }
  };
  
  const subscriptionInfo = getSubscriptionInfo();
  
  return (
    <div className="edit-user-page">
      <div className="edit-user-container">
        <div className="edit-user-header">
          <Link to="/admin/dashboard" className="back-button">
            ← Back to Dashboard
          </Link>
          <h1>Edit User</h1>
        </div>
        
        {/* Success message */}
        {successMessage && (
          <div className="success-message">
            <p>✅ {successMessage}</p>
            <button className="close-button" onClick={() => setSuccessMessage('')}>✕</button>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
            <button className="close-button" onClick={() => setError(null)}>✕</button>
          </div>
        )}
        
        {/* User profile card */}
        <div className="user-profile-card">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h2>{user.name}</h2>
            <p className="user-email">{user.email}</p>
            
            <div className="user-badges">
              <span className={`role-badge role-${user.role}`}>
                {user.role}
              </span>
              
              <span className={`subscription-badge ${subscriptionInfo.name.toLowerCase()}-plan`}>
                {subscriptionInfo.name}
              </span>
              
              <span className={`status-badge ${user.verified ? 'verified' : 'unverified'}`}>
                {user.verified ? '✓ Verified' : '✗ Unverified'}
              </span>
            </div>
            
            <div className="user-details">
              <div className="detail-item">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">{user._id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Capsules:</span>
                <span className="detail-value">{user.capsuleCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Edit sections tabs */}
        <div className="edit-section-tabs">
          <button 
            className={`tab-button ${activeTab === 'role' ? 'active' : ''}`}
            onClick={() => setActiveTab('role')}
          >
            Role
          </button>
          <button 
            className={`tab-button ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
          >
            Verification
          </button>
          <button 
            className={`tab-button ${activeTab === 'subscription' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscription')}
          >
            Subscription
          </button>
        </div>
        
        <div className="edit-sections">
          {/* Role section */}
          <section 
            className={`edit-section ${activeTab === 'role' ? 'active' : ''}`} 
            id="role-section"
          >
            <h3>Change User Role</h3>
            <div className="form-group">
              <label htmlFor="role-select">Select Role:</label>
              <select
                id="role-select" 
                className="select-field"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="content_curator">Content Curator</option>
                {currentUser?.role === 'admin' && <option value="admin">Admin</option>}
              </select>
              
              <button 
                className="action-button primary"
                onClick={handleRoleUpdate}
                disabled={selectedRole === user.role}
              >
                Update Role
              </button>
            </div>
          </section>
          
          {/* Verification section */}
          <section 
            className={`edit-section ${activeTab === 'verification' ? 'active' : ''}`}
            id="verification-section"
          >
            <h3>User Verification</h3>
            <div className="verification-status">
              <div className="status">
                {user.verified ? (
                  <>
                    <span className="status-icon verified">✓</span>
                    <span className="status-text">This user is already verified</span>
                  </>
                ) : (
                  <>
                    <span className="status-icon unverified">✗</span>
                    <span className="status-text">This user is not verified</span>
                    <button 
                      className="action-button primary verify-button"
                      onClick={handleVerify}
                    >
                      Verify User
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
          
          {/* Subscription section */}
          <section 
            className={`edit-section ${activeTab === 'subscription' ? 'active' : ''}`}
            id="subscription-section"
          >
            <h3>Manage Subscription</h3>
            
            <div className="current-subscription">
              <div className="subscription-header">
                <h4>Current Subscription</h4>
                <div className={`subscription-badge ${subscriptionInfo.name.toLowerCase()}-plan`}>
                  {subscriptionInfo.name}
                </div>
              </div>
              <div className="subscription-details">
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">{subscriptionInfo.status}</span>
                </div>
                {subscriptionInfo.expiry && (
                  <div className="detail-item">
                    <span className="detail-label">Expiry:</span>
                    <span className="detail-value">
                      {new Date(subscriptionInfo.expiry).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="subscription-form">
              <div className="form-group">
                <label htmlFor="subscription-type">Subscription Type:</label>
                <select
                  id="subscription-type"
                  className="select-field"
                  value={selectedSubscription}
                  onChange={(e) => setSelectedSubscription(e.target.value)}
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
              
              {selectedSubscription === 'premium' && (
                <div className="form-group">
                  <label htmlFor="duration">Duration:</label>
                  <select
                    id="duration"
                    className="select-field"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                  >
                    <option value="1">1 month</option>
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                  </select>
                </div>
              )}
              
              <button 
                className="action-button primary"
                onClick={handleSubscriptionUpdate}
              >
                Update Subscription
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
