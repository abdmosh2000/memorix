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
            if (result.success) {
                console.log('Login successful, navigating to dashboard');
                // Add a small delay to ensure state updates before navigation
                setTimeout(() => {
                    navigate('/dashboard');
                }, 100);
            } else {
                setErrorMessage(result.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // Check if it's a network error
            if (!navigator.onLine || error.message.includes('network')) {
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

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            {errorMessage && (
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
            )}
            
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
