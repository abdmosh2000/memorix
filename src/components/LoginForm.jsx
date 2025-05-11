import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../auth';
import offlineManager from '../utils/offlineManager';
import networkManager from '../utils/networkManager';
import loginSound from '../assets/sounds/login.mp3';
import './LoginForm.css';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loginSuccess, setLoginSuccess] = useState(false);
    
    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const audioRef = useRef(null);
    
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
                
                // Set success state for animation
                setLoginSuccess(true);
                
                // Play login sound
                if (audioRef.current) {
                    audioRef.current.volume = 0.6; // Set appropriate volume
                    audioRef.current.play().catch(e => console.log('Audio play failed:', e));
                }
                
                // Add a longer delay to ensure animations can play before navigation
                setTimeout(() => {
                    // Force a hard navigation to dashboard to ensure correct state
                    window.location.href = '/dashboard';
                }, 1200); // Longer delay to allow animation to complete
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
    
    // Animation variants for form elements
    const formVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1, 
                delayChildren: 0.2 
            } 
        },
        success: { 
            scale: 1.02,
            transition: { duration: 0.2 }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };
    
    const successVariants = {
        initial: { scale: 1 },
        animate: { 
            scale: [1, 1.05, 1],
            boxShadow: [
                "0px 0px 0px rgba(142, 68, 173, 0)",
                "0px 0px 30px rgba(142, 68, 173, 0.7)",
                "0px 0px 0px rgba(142, 68, 173, 0)"
            ],
            transition: { 
                duration: 1, 
                times: [0, 0.5, 1],
                ease: "easeInOut" 
            }
        }
    };

    return (
        <motion.form 
            className={`login-form ${loginSuccess ? 'login-success' : ''}`}
            variants={formVariants}
            initial="hidden"
            animate={loginSuccess ? "success" : "visible"}
            onSubmit={handleSubmit}
        >
            {renderErrorMessage()}
            
            <motion.div className="form-group" variants={itemVariants}>
                <label htmlFor="email">Email:</label>
                <motion.input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    whileFocus={{ scale: 1.01, boxShadow: "0px 0px 8px rgba(142, 68, 173, 0.3)" }}
                />
            </motion.div>
            
            <motion.div className="form-group" variants={itemVariants}>
                <label htmlFor="password">Password:</label>
                <motion.input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    whileFocus={{ scale: 1.01, boxShadow: "0px 0px 8px rgba(142, 68, 173, 0.3)" }}
                />
            </motion.div>
            
            <motion.button 
                type="submit" 
                disabled={isSubmitting}
                className={isOffline ? 'offline-mode' : ''}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                variants={loginSuccess ? successVariants : itemVariants}
                animate={loginSuccess ? "animate" : "visible"}
            >
                {isSubmitting ? 'Logging in...' : isOffline ? 'Save for Later' : 'Login'}
            </motion.button>
            
            {isOffline && (
                <motion.p 
                    className="offline-note"
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <span role="img" aria-label="Offline">📴</span> You're currently offline. Login will be processed when connection is restored.
                </motion.p>
            )}
            
            {/* Hidden audio element for login sound */}
            <audio 
                ref={audioRef} 
                src={loginSound} 
                preload="auto"
                onError={(e) => {
                    console.warn('Sound file could not be loaded:', e);
                    // Prevent console errors by removing the source
                    e.target.removeAttribute('src');
                }}
            />
            
            {/* Success animation */}
            {loginSuccess && (
                <motion.div 
                    className="success-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div 
                        className="success-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.1
                        }}
                    >
                        ✓
                    </motion.div>
                </motion.div>
            )}
        </motion.form>
    );
}

export default LoginForm;
