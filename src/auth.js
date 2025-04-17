import React, { createContext, useState, useEffect, useContext } from 'react';
import config from './config';

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
                    const token = typeof authTokens === 'string' ? authTokens : JSON.stringify(authTokens);
                    const response = await fetch(`${config.apiUrl}/auth/user`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
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

    const register = async (name, email, password, profilePicture = null) => {
        try {
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
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            if (response.ok) {
                setTokens(data.token);
                return { success: true };
            } else {
                console.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error' };
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
            const response = await fetch(`${config.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                setTokens(data.token);
                return { success: true };
            } else {
                console.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error' };
        }
    };

    const updateUser = async (userData) => {
        try {
            const response = await fetch(`${config.apiUrl}/users/${userData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens}`
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

    const contextValue = {
        authTokens,
        user,
        setTokens,
        logout,
        register,
        login,
        updateUser,
        isLoading,
        isLoggedIn
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
