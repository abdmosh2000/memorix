import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../api';
import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL query parameters
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setErrorMessage('No reset token found. Please use the reset link from your email.');
    }
  }, [location]);

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 1; // Has uppercase
    if (/[a-z]/.test(password)) strength += 1; // Has lowercase
    if (/[0-9]/.test(password)) strength += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Has special char
    
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 4) return 'Medium';
    return 'Strong';
  };

  const getPasswordStrengthColorClass = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'weak';
    if (passwordStrength <= 4) return 'medium';
    return 'strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!password || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    
    // Check password strength
    if (passwordStrength < 3) {
      setErrorMessage('Please choose a stronger password. Include uppercase, lowercase, numbers, and special characters.');
      return;
    }
    
    if (!token) {
      setErrorMessage('Missing reset token. Please use the reset link from your email.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      const result = await resetPassword(token, password);
      
      if (result.success || result.message) {
        setSuccessMessage('Your password has been successfully reset.');
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setErrorMessage('Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      
      if (error.message && error.message.includes('expired')) {
        setErrorMessage('This reset link has expired. Please request a new one.');
      } else if (error.message && error.message.includes('invalid')) {
        setErrorMessage('This reset link is invalid. Please request a new one.');
      } else {
        setErrorMessage('An error occurred while resetting your password. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="reset-password-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="reset-password-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="reset-password-header">
          <h1>Reset Password</h1>
          <p>Enter your new password below.</p>
        </div>
        
        {successMessage ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>{successMessage}</p>
            <Link to="/login" className="return-link">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            
            <div className="form-group">
              <label htmlFor="password">New Password:</label>
              <div className="password-input-container">
                <motion.input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowPasswordRequirements(true)}
                  onBlur={() => setShowPasswordRequirements(false)}
                  whileFocus={{ scale: 1.01, boxShadow: "0px 0px 8px rgba(142, 68, 173, 0.3)" }}
                />
                {password && (
                  <div className={`password-strength-indicator ${getPasswordStrengthColorClass()}`}>
                    <div className="strength-bar" style={{ width: `${(passwordStrength / 5) * 100}%` }}></div>
                    <span className="strength-text">{getPasswordStrengthLabel()}</span>
                  </div>
                )}
              </div>
              
              {showPasswordRequirements && (
                <div className="password-requirements">
                  <p>Password should have:</p>
                  <ul>
                    <li className={password.length >= 8 ? 'met' : ''}>At least 8 characters</li>
                    <li className={/[A-Z]/.test(password) ? 'met' : ''}>Upper case letters (A-Z)</li>
                    <li className={/[a-z]/.test(password) ? 'met' : ''}>Lower case letters (a-z)</li>
                    <li className={/[0-9]/.test(password) ? 'met' : ''}>Numbers (0-9)</li>
                    <li className={/[^A-Za-z0-9]/.test(password) ? 'met' : ''}>Special characters (!@#$%, etc)</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password:</label>
              <motion.input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                whileFocus={{ scale: 1.01, boxShadow: "0px 0px 8px rgba(142, 68, 173, 0.3)" }}
              />
              {password && confirmPassword && (
                <div className={`password-match ${password === confirmPassword ? 'match' : 'no-match'}`}>
                  {password === confirmPassword ? 'Passwords match ✓' : 'Passwords do not match ✗'}
                </div>
              )}
            </div>
            
            <div className="actions">
              <motion.button
                type="submit"
                className="reset-button"
                disabled={isSubmitting}
                whileHover={{ scale: 1.03, boxShadow: "0px 4px 10px rgba(142, 68, 173, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </motion.button>
              
              <Link to="/login" className="back-to-login">
                Return to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ResetPassword;
