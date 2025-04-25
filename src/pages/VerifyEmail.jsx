import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import './VerifyEmail.css';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [verificationStatus, setVerificationStatus] = useState('processing');
    const [error, setError] = useState('');
    const { verifyEmail, login, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleVerification = async () => {
            // If no token is provided in the URL
            if (!token) {
                setVerificationStatus('error');
                setError('No verification token provided.');
                return;
            }

            try {
                const result = await verifyEmail(token);
                if (result.success) {
                    setVerificationStatus('success');
                    // Show success notification
                    addNotification(
                        'Email verified successfully! You can now log in.',
                        NOTIFICATION_TYPES.SUCCESS
                    );
                } else {
                    setVerificationStatus('error');
                    setError(result.message || 'Failed to verify email. The link may be expired or invalid.');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setVerificationStatus('error');
                setError('An error occurred during verification. Please try again later.');
            }
        };

        handleVerification();
    }, [token, verifyEmail]);

    const handleGoToLogin = () => {
        navigate('/login');
    };

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="verify-email-page">
            <div className="verify-email-container">
                <h1>Email Verification</h1>
                
                {verificationStatus === 'processing' && (
                    <div className="verification-processing">
                        <div className="spinner"></div>
                        <p>Verifying your email address...</p>
                    </div>
                )}
                
                {verificationStatus === 'success' && (
                    <div className="verification-success">
                        <div className="success-icon">✓</div>
                        <h2>Email Verified!</h2>
                        <p>Your email has been successfully verified.</p>
                        <p>Thank you for completing your registration. You can now access all features of your account.</p>
                        
                        <div className="verification-actions">
                            {isLoggedIn ? (
                                <button 
                                    className="primary-button"
                                    onClick={handleGoToDashboard}
                                >
                                    Go to Dashboard
                                </button>
                            ) : (
                                <button 
                                    className="primary-button"
                                    onClick={handleGoToLogin}
                                >
                                    Log In
                                </button>
                            )}
                        </div>
                    </div>
                )}
                
                {verificationStatus === 'error' && (
                    <div className="verification-error">
                        <div className="error-icon">!</div>
                        <h2>Verification Failed</h2>
                        <p className="error-message">{error}</p>
                        
                        <div className="verification-actions">
                            <button 
                                className="secondary-button"
                                onClick={() => navigate('/resend-verification')}
                            >
                                Resend Verification Email
                            </button>
                            <button 
                                className="primary-button"
                                onClick={() => navigate('/')}
                            >
                                Go to Homepage
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
