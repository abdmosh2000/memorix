import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import './ResendVerification.css';

function ResendVerification() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState(false);
    const { resendVerification } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess(false);
        setIsSubmitting(true);

        // Simple email validation
        if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            setFormError('Please enter a valid email address');
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await resendVerification(email);
            
            if (result.success) {
                setFormSuccess(true);
                addNotification(
                    'Verification email has been sent. Please check your inbox.',
                    NOTIFICATION_TYPES.SUCCESS
                );
            } else {
                setFormError(result.message || 'Failed to send verification email. Please try again.');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            setFormError('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="resend-verification-page">
            <div className="resend-verification-container">
                <h1>Resend Verification Email</h1>
                
                {formSuccess ? (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h2>Email Sent!</h2>
                        <p>A verification email has been sent to <strong>{email}</strong></p>
                        <p>Please check your inbox and click the verification link to verify your account.</p>
                        
                        <div className="verification-actions">
                            <button 
                                className="secondary-button"
                                onClick={() => setFormSuccess(false)}
                            >
                                Send to Another Email
                            </button>
                            <button 
                                className="primary-button"
                                onClick={() => navigate('/login')}
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="description">
                            Enter the email address you used to register, and we'll send you a new verification link.
                        </p>
                        
                        <form onSubmit={handleSubmit} className="resend-form">
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                            
                            {formError && <div className="error-message">{formError}</div>}
                            
                            <button 
                                type="submit" 
                                className="primary-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Sending...' : 'Send Verification Email'}
                            </button>
                        </form>
                        
                        <div className="form-links">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </>
                )}
                
                <div className="help-section">
                    <h3>Still having problems?</h3>
                    <p>If you're experiencing issues with email verification:</p>
                    <ul>
                        <li>Check your spam or junk folder</li>
                        <li>Make sure you entered the correct email address</li>
                        <li>Allow emails from memorix.fun</li>
                        <li>Contact <a href="mailto:support@memorix.fun">support@memorix.fun</a> for assistance</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ResendVerification;
