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
  
  return (
    <div className="edit-user-page">
      <div className="edit-user-container">
        <div className="edit-user-header">
          <Link to="/admin/dashboard" className="back-button">
            ← Back to Dashboard
          </Link>
          <h1>Edit User</h1>
        </div>
        
        {/* Example success message */}
        <div className="success-message">
          <p>✅ User updated successfully!</p>
          <button className="close-button">✕</button>
        </div>
        
        {/* User profile card */}
        <div className="user-profile-card">
          <div className="user-avatar">
            {mockUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h2>{mockUser.name}</h2>
            <p className="user-email">{mockUser.email}</p>
            
            <div className="user-badges">
              <span className={`role-badge role-${mockUser.role}`}>
                {mockUser.role}
              </span>
              
              <span className={`subscription-badge ${mockUser.subscription.plan_name.toLowerCase()}-plan`}>
                {mockUser.subscription.plan_name}
              </span>
              
              <span className={`status-badge ${mockUser.verified ? 'verified' : 'unverified'}`}>
                {mockUser.verified ? '✓ Verified' : '✗ Unverified'}
              </span>
            </div>
            
            <div className="user-details">
              <div className="detail-item">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">{mockUser._id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {mockUser.createdAt.toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Capsules:</span>
                <span className="detail-value">{mockUser.capsuleCount}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Edit sections */}
        <div className="edit-section-tabs">
          <button className="tab-button active">Role</button>
          <button className="tab-button">Verification</button>
          <button className="tab-button">Subscription</button>
        </div>
        
        <div className="edit-sections">
          {/* Role section */}
          <section className="edit-section active" id="role-section">
            <h3>Change User Role</h3>
            <div className="form-group">
              <label>Select Role:</label>
              <select className="select-field">
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="content_curator">Content Curator</option>
                <option value="admin">Admin</option>
              </select>
              
              <button className="action-button primary">
                Update Role
              </button>
            </div>
          </section>
          
          {/* Verification section */}
          <section className="edit-section" id="verification-section">
            <h3>User Verification</h3>
            <div className="verification-status">
              <div className="status">
                <span className="status-icon verified">✓</span>
                <span className="status-text">This user is already verified</span>
              </div>
            </div>
          </section>
          
          {/* Subscription section */}
          <section className="edit-section" id="subscription-section">
            <h3>Manage Subscription</h3>
            
            <div className="current-subscription">
              <div className="subscription-header">
                <h4>Current Subscription</h4>
                <div className="subscription-badge premium-plan">Premium</div>
              </div>
              <div className="subscription-details">
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">Active</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Expiry:</span>
                  <span className="detail-value">January 1, 2026</span>
                </div>
              </div>
            </div>
            
            <div className="subscription-form">
              <div className="form-group">
                <label>Subscription Type:</label>
                <select className="select-field">
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Duration:</label>
                <select className="select-field">
                  <option value="1">1 month</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>
              
              <button className="action-button primary">
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
