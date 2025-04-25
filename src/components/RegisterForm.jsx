import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import offlineManager from '../utils/offlineManager';
import networkManager from '../utils/networkManager';
import './RegisterForm.css';


function RegisterForm({ onSuccess }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationSuccessful, setRegistrationSuccessful] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    
    const { register, resendVerification } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize form from URL parameters and check network status
    useEffect(() => {
        // Parse the query string
        const searchParams = new URLSearchParams(location.search);
        const nameFromQuery = searchParams.get('name');
        const emailFromQuery = searchParams.get('email');
        const pendingAuth = searchParams.get('pendingAuth');
        
        // If params are provided in the URL, use them
        if (nameFromQuery) setName(nameFromQuery);
        if (emailFromQuery) setEmail(emailFromQuery);
        
        // If this is a pending auth, show a message
        if (pendingAuth === 'true') {
            setFormError('Please re-enter your password to complete the registration after connection loss.');
        }
        
        // Check network status on mount
        const checkConnection = async () => {
            const isOnline = await networkManager.checkNetworkStatus();
            setIsOffline(!isOnline);
        };
        
        checkConnection();
        
        // Set up listener for online/offline status
        const handleOnlineStatus = () => {
            setIsOffline(!navigator.onLine);
        };
        
        window.addEventListener('online', handleOnlineStatus);
        window.addEventListener('offline', handleOnlineStatus);
        
        return () => {
            window.removeEventListener('online', handleOnlineStatus);
            window.removeEventListener('offline', handleOnlineStatus);
        };
    }, [location]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            
            // Create a preview URL for the image
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResendVerification = async () => {
        if (isOffline) {
            setFormError('You are currently offline. Please check your connection and try again.');
            return;
        }

        try {
            const result = await resendVerification(email);
            if (result.success) {
                addNotification(
                    'Verification email has been resent. Please check your inbox.', 
                    NOTIFICATION_TYPES.SUCCESS
                );
            } else {
                setFormError(result.message || 'Failed to resend verification email. Please try again.');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            
            // Check if it's a network error
            if (!navigator.onLine || (error.message && error.message.includes('network'))) {
                setIsOffline(true);
                setFormError('Network error. Verification email cannot be sent while offline.');
            } else {
                setFormError('Failed to resend verification email. Please try again later.');
            }
        }
    };

    // Retry connection if offline
    const retryConnection = async () => {
        const isOnline = await networkManager.checkNetworkStatus();
        setIsOffline(!isOnline);
        
        if (isOnline) {
            setFormError('Connection restored! You can now complete your registration.');
        } else {
            setFormError('Still offline. Please check your connection and try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setIsSubmitting(true);
        
        // Validate terms acceptance
        if (!acceptTerms) {
            setFormError('You must accept the Terms of Use and Privacy Policy to register');
            setIsSubmitting(false);
            return;
        }
        
        // Validate passwords match
        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            setIsSubmitting(false);
            return;
        }
        
        // If offline, save the registration for later
        if (isOffline) {
            offlineManager.saveAuthOperation('register', { 
                name, 
                email, 
                password,
                // We can't easily save profile pictures for offline operation
                // They'll need to be re-uploaded when online
            });
            setFormError('You appear to be offline. Your registration has been saved and will be processed when your connection is restored.');
            setIsSubmitting(false);
            return;
        }
        
        try {
            const result = await register(name, email, password, profilePicture, confirmPassword);
            if (result.success) {
                console.log('Registration successful, email verification needed');
                
                // Set registration successful state
                setRegistrationSuccessful(true);
                
                // Add a notification about verification
                addNotification(
                    `Thanks for registering, ${name}! Please check your email to verify your account.`, 
                    NOTIFICATION_TYPES.SUCCESS
                );
                
                if (onSuccess) {
                    onSuccess(email);
                }
            } else {
                setFormError(result.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            // Check if it's a network error
            if (!navigator.onLine || (error.message && error.message.includes('network'))) {
                setIsOffline(true);
                offlineManager.saveAuthOperation('register', { 
                    name, 
                    email, 
                    password,
                    // We can't easily save profile pictures for offline operation
                });
                setFormError('Network error. Your registration has been saved and will be processed when your connection is restored.');
            } else {
                setFormError('Registration failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // If registration was successful, show verification instructions
    if (registrationSuccessful) {
        return (
            <div className="verification-instructions">
                <h2>Verify Your Email</h2>
                <p>We've sent a verification email to <strong>{email}</strong>.</p>
                <p>Please check your inbox and click the verification link to complete your registration.</p>
                
                <div className="verification-actions">
                    <button 
                        type="button" 
                        className="resend-button"
                        onClick={handleResendVerification}
                        disabled={isOffline}
                    >
                        {isOffline ? 'Cannot Resend While Offline' : 'Resend Verification Email'}
                    </button>
                    
                    <button 
                        type="button"
                        className="login-button"
                        onClick={() => navigate('/login')}
                    >
                        Go to Login
                    </button>
                </div>
                
                {isOffline && (
                    <div className="offline-warning">
                        <p>
                            <span role="img" aria-label="Warning">⚠️</span> 
                            You're currently offline. Some features may not work until your connection is restored.
                            <button 
                                type="button" 
                                className="retry-button"
                                onClick={retryConnection}
                            >
                                Retry Connection
                            </button>
                        </p>
                    </div>
                )}
                
                <div className="verification-help">
                    <p>Having trouble? Check your spam folder or contact support at <a href="mailto:support@memorix.fun">support@memorix.fun</a>.</p>
                </div>
            </div>
        );
    }

    return (
        <form className="register-form" onSubmit={handleSubmit}>
            {formError && (
                <div className="error-message">
                    {formError}
                    {isOffline && (
                        <button 
                            type="button" 
                            className="retry-button"
                            onClick={retryConnection}
                        >
                            Retry Connection
                        </button>
                    )}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                />
            </div>
            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength="6"
                />
            </div>
            <div className="form-group">
                <label htmlFor="profilePicture">
                    Profile Picture:{isOffline && ' (Will be uploaded when online)'}
                </label>
                <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isOffline}
                />
                {previewUrl && (
                    <div className="image-preview">
                        <img src={previewUrl} alt="Profile Preview" style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }} />
                    </div>
                )}
            </div>
            
            <div className="form-group terms-checkbox">
                <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    required
                />
                <label htmlFor="terms">
                    I accept the <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Use</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
                </label>
            </div>
            
            <button 
                type="submit" 
                disabled={!acceptTerms || isSubmitting}
                className={isOffline ? 'offline-mode' : ''}
            >
                {isSubmitting ? 'Registering...' : isOffline ? 'Save for Later' : 'Register'}
            </button>
            
            {isOffline && (
                <p className="offline-note">
                    <span role="img" aria-label="Offline">📴</span> You're currently offline. Registration will be processed when connection is restored.
                </p>
            )}
            
            <div className="login-link">
                Already have an account? <Link to="/login">Log in</Link>
            </div>
        </form>
    );
}

export default RegisterForm;
