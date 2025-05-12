import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { resetPasswordRequest } from '../api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    in: { 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    out: { 
      opacity: 0, 
      transition: { duration: 0.5, ease: "easeIn" }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  const inputVariants = {
    focus: { scale: 1.01, boxShadow: "0px 0px 8px rgba(142, 68, 173, 0.3)" }
  };

  const buttonVariants = {
    hover: { scale: 1.03, boxShadow: "0px 4px 10px rgba(142, 68, 173, 0.3)" },
    tap: { scale: 0.98 }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      const result = await resetPasswordRequest(email);
      
      if (result.success) {
        setSuccessMessage('Password reset instructions have been sent to your email address.');
        setEmail(''); // Clear the form
      } else {
        setErrorMessage(result.message || 'Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setErrorMessage('An error occurred while processing your request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="forgot-password-page"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <motion.div 
        className="forgot-password-container"
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <div className="forgot-password-header">
          <h1>Forgot Password</h1>
          <p>Enter your email address below and we'll send you instructions to reset your password.</p>
        </div>
        
        {successMessage && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>{successMessage}</p>
            <Link to="/login" className="return-link">Return to Login</Link>
          </div>
        )}
        
        {!successMessage && (
          <form onSubmit={handleSubmit}>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email Address:</label>
              <motion.input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                whileFocus="focus"
                variants={inputVariants}
              />
            </div>
            
            <div className="actions">
              <motion.button
                type="submit"
                className="reset-button"
                disabled={isSubmitting}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
              </motion.button>
              
              <Link to="/login" className="back-to-login">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;
