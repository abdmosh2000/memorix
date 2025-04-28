import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import config from './config';
import networkManager from './utils/networkManager';
import offlineManager from './utils/offlineManager';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isLoggedIn = authTokens !== null;
    
    // Load tokens and user data from localStorage
    useEffect(() => {
        const loadTokens = async () => {
            setIsLoading(true);
            try {
                const storedTokens = localStorage.getItem('authTokens');
                const storedUser = localStorage.getItem('user');
                
                if (storedTokens) {
                    setAuthTokens(JSON.parse(storedTokens));
                }
                
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Error loading tokens:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTokens();
    }, []);

    // Fetch user data whenever auth tokens change
    useEffect(() => {
        const fetchUserData = async () => {
            if (authTokens) {
                try {
                    // Ensure token is properly extracted
                    let token;
                    if (typeof authTokens === 'string') {
                        try {
                            // Try to parse JSON if it's a string
                            token = JSON.parse(authTokens);
                        } catch (e) {
                            // If parsing fails, use as is
                            token = authTokens;
                        }
                    } else {
                        // Use the object directly
                        token = authTokens;
                    }
                    
                    const response = await fetch(`${config.apiUrl}/auth/user`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };
        
        fetchUserData();
    }, [authTokens]);

    const setTokens = (tokens) => {
      console.log('Setting tokens:', tokens);
      localStorage.setItem('authTokens', JSON.stringify(tokens));
      setAuthTokens(tokens);
  };

    const logout = () => {
        localStorage.removeItem('authTokens');
        localStorage.removeItem('user');
        setAuthTokens(null);
        setUser(null);
    };

    // Function to verify email with token
    const verifyEmail = async (token) => {
        try {
            // Properly append the token to the URL as a query parameter
            const url = `${config.apiUrl}/auth/verify-email?token=${token}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...config.defaultHeaders,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            return { 
                success: response.ok, 
                verified: response.ok ? true : false,
                message: data.message
            };
        } catch (error) {
            console.error('Email verification error:', error);
            return { success: false, message: 'Network error during verification' };
        }
    };

    // Function to resend verification email
    const resendVerification = async (email) => {
        try {
            const response = await fetch(`${config.apiUrl}/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    ...config.defaultHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            return { 
                success: response.ok, 
                message: data.message 
            };
        } catch (error) {
            console.error('Resend verification error:', error);
            return { success: false, message: 'Network error' };
        }
    };

    // Function to request password reset
    const forgotPassword = async (email) => {
        try {
            const response = await fetch(`${config.apiUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    ...config.defaultHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            return { 
                success: response.ok, 
                message: data.message 
            };
        } catch (error) {
            console.error('Password reset request error:', error);
            return { success: false, message: 'Network error' };
        }
    };

    // Function to reset password with token
    const resetPassword = async (token, password) => {
        try {
            const response = await fetch(`${config.apiUrl}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    ...config.defaultHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();
            return { 
                success: response.ok, 
                message: data.message 
            };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, message: 'Network error' };
        }
    };

    const register = async (name, email, password, profilePicture = null, confirmPassword = null) => {
        try {
            // First check if we're online
            const isOnline = await networkManager.checkNetworkStatus();
            if (!isOnline) {
                // Queue the operation for later
                offlineManager.saveAuthOperation('register', { name, email, password });
                return { 
                    success: false, 
                    offline: true,
                    message: 'You are currently offline. Your registration will be processed when connection is restored.'
                };
            }
            
            // Check if passwords match if confirmPassword is provided
            if (confirmPassword !== null && password !== confirmPassword) {
                return { success: false, message: 'Passwords do not match' };
            }
            
            let userData = { name, email, password };
            
            // If a profile picture was provided, convert it to a data URI
            if (profilePicture) {
                try {
                    userData.profilePicture = await convertFileToDataURL(profilePicture);
                    // Limit the size of the data URL to prevent request size issues
                    if (userData.profilePicture && userData.profilePicture.length > 5000000) {
                        // If larger than ~5MB, resize or compress it
                        console.warn('Profile picture too large, using default');
                        delete userData.profilePicture; // Don't send it if too large
                    }
                } catch (error) {
                    console.error('Error processing profile picture:', error);
                    // Continue without the profile picture
                }
            }
            
            console.log('Registering user, sending data to:', `${config.apiUrl}/auth/register`);
            
            const response = await fetch(`${config.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    ...config.defaultHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            if (response.ok) {
                // Store token but inform user they need to verify email
                setTokens(data.token);
                
                // Clear any pending registration operation
                offlineManager.clearPendingAuth();
                
                return { 
                    success: true, 
                    verified: data.verified || false,
                    email: data.email
                };
            } else {
                console.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            // Check if it's a network error
            if (!navigator.onLine || (error.message && error.message.includes('network'))) {
                // Queue the operation for later
                offlineManager.saveAuthOperation('register', { name, email, password });
                return { 
                    success: false, 
                    offline: true,
                    message: 'Network error. Your registration will be processed when connection is restored.'
                };
            }
            
            return { success: false, message: 'Error during registration. Please try again.' };
        }
    };
    
    // Helper function to convert a file to a data URL
    const convertFileToDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const login = async (email, password) => {
        try {
            // First check if we're online
            const isOnline = await networkManager.checkNetworkStatus();
            if (!isOnline) {
                // Queue the operation for later
                offlineManager.saveAuthOperation('login', { email, password });
                return { 
                    success: false, 
                    offline: true,
                    message: 'You are currently offline. Your login will be processed when connection is restored.'
                };
            }
            
            const response = await fetch(`${config.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    ...config.defaultHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            if (response.ok) {
                setTokens(data.token);
                
                // Clear any pending login operation
                offlineManager.clearPendingAuth();
                
                return { 
                    success: true,
                    isAdmin: data.isAdmin,
                    subscription: data.subscription
                };
            } else {
                if (response.status === 401 && data.verified === false) {
                    // Email not verified
                    return { 
                        success: false, 
                        verified: false, 
                        email: data.email,
                        message: data.message
                    };
                } else {
                    console.error(data.message);
                    return { success: false, message: data.message };
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // Check if it's a network error
            if (!navigator.onLine || (error.message && error.message.includes('network'))) {
                // Queue the operation for later
                offlineManager.saveAuthOperation('login', { email, password });
                return { 
                    success: false, 
                    offline: true,
                    message: 'Network error. Your login will be processed when connection is restored.'
                };
            }
            
            return { success: false, message: 'Error during login. Please try again.' };
        }
    };

    const updateUser = async (userData) => {
        try {
            // Ensure token is properly extracted
            let token;
            if (typeof authTokens === 'string') {
                try {
                    // Try to parse JSON if it's a string
                    token = JSON.parse(authTokens);
                } catch (e) {
                    // If parsing fails, use as is
                    token = authTokens;
                }
            } else {
                // Use the object directly
                token = authTokens;
            }
            
            const response = await fetch(`${config.apiUrl}/users/${userData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            if (response.ok) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                return data;
            } else {
                console.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Update user error:', error);
            return { success: false, message: 'Network error' };
        }
    };

    // Check if there are pending auth operations when coming back online
    useEffect(() => {
        window.addEventListener('online', checkPendingAuth);
        
        // Initial check
        if (navigator.onLine) {
            checkPendingAuth();
        }
        
        return () => {
            window.removeEventListener('online', checkPendingAuth);
        };
    }, []);
    
    // Function to check and process any pending auth operations
    const checkPendingAuth = async () => {
        if (offlineManager.hasPendingAuth('login') || offlineManager.hasPendingAuth('register')) {
            await offlineManager.retryPendingAuth();
        }
    };

    const contextValue = {
        authTokens,
        user,
        setTokens,
        logout,
        register,
        login,
        updateUser,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        isLoading,
        isLoggedIn,
        checkPendingAuth
    };

    if (isLoading) {
        return <div>Loading Authentication...</div>;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
