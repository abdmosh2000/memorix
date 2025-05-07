import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import offlineManager from '../utils/offlineManager';
import networkManager from '../utils/networkManager';

import './LoginForm.css';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check for query parameters (for returning from offline mode)
    useEffect(() => {
        // Parse the query string
        const searchParams = new URLSearchParams(location.search);
        const emailFromQuery = searchParams.get('email');
        const pendingAuth = searchParams.get('pendingAuth');
        
        // If email is provided in the URL, use it
        if (emailFromQuery) {
            setEmail(emailFromQuery);
        }
        
        // If this is a pending auth, show a message
        if (pendingAuth === 'true') {
            setErrorMessage('Please re-enter your password to complete the login after connection loss.');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);
        
        // If we're offline, save the login attempt for later
        if (isOffline) {
            offlineManager.saveAuthOperation('login', { email, password });
            setErrorMessage('You appear to be offline. Your login has been saved and will be processed when your connection is restored.');
            setIsSubmitting(false);
            return;
        }
        
        try {
            const result = await login(email, password);
            console.log('Login result:', result);
            
            if (result.success) {
                console.log('Login successful, navigating to dashboard');
                
                // Add a longer delay to ensure state updates before navigation
                setTimeout(() => {
                    // Force a hard navigation to dashboard to ensure correct state
                    window.location.href = '/dashboard';
                }, 500);
            } else if (result.offline) {
                // Handle offline response
                setIsOffline(true);
                setErrorMessage(result.message || 'You are offline. Login will be processed when connection is restored.');
            } else if (result.verified === false) {
                // Handle unverified email
                setErrorMessage(`${result.message || 'Please verify your email before logging in.'} 
                    <a href="/resend-verification?email=${encodeURIComponent(email)}">Resend verification email</a>`);
            } else {
                // Handle other errors
                setErrorMessage(result.message || 'Login failed. Please check your credentials and try again.');
            }
        } catch (error) {
            console.error('Login form error:', error);
            
            // Check if it's a network error
            if (!navigator.onLine || (error.message && error.message.includes('network'))) {
                setIsOffline(true);
                offlineManager.saveAuthOperation('login', { email, password });
                setErrorMessage('You appear to be offline. Your login has been saved and will be processed when your connection is restored.');
            } else {
                setErrorMessage(error.message || 'Login failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Retry connection if offline
    const retryConnection = async () => {
        const isOnline = await networkManager.checkNetworkStatus();
        setIsOffline(!isOnline);
        
        if (isOnline) {
            setErrorMessage('Connection restored! You can now log in.');
        } else {
            setErrorMessage('Still offline. Please check your connection and try again.');
        }
    };

    // Function to render error message with possible HTML link
    const renderErrorMessage = () => {
        if (!errorMessage) return null;
        
        // Check if the error message includes a link (for email verification)
        if (errorMessage.includes('<a href=')) {
            // Extract the main message and the link parts
            const [mainMessage, linkPart] = errorMessage.split('<a href=');
            
            if (linkPart) {
                // Extract the URL and link text
                const hrefMatch = linkPart.match(/"([^"]+)"/);
                const href = hrefMatch ? hrefMatch[1] : '';
                const linkText = linkPart.includes('>') ? 
                    linkPart.split('>')[1].split('</a>')[0] : 
                    'Resend verification email';
                    
                return (
                    <div className="error-message">
                        {mainMessage}
                        <a href={href} className="error-link">{linkText}</a>
                        
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
                );
            }
        }
        
        // Default case, just render the error message
        return (
            <div className="error-message">
                {errorMessage}
                
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
        );
    };
    
    return (
        <form className="login-form" onSubmit={handleSubmit}>
            {renderErrorMessage()}
            
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
                />
            </div>
            
            <button 
                type="submit" 
                disabled={isSubmitting}
                className={isOffline ? 'offline-mode' : ''}
            >
                {isSubmitting ? 'Logging in...' : isOffline ? 'Save for Later' : 'Login'}
            </button>
            
            {isOffline && (
                <p className="offline-note">
                    <span role="img" aria-label="Offline">📴</span> You're currently offline. Login will be processed when connection is restored.
                </p>
            )}
        </form>
    );
}

export default LoginForm;
