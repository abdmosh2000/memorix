import config from './config';
import networkManager from './utils/networkManager';

/**
 * Enhanced request handler with mobile device optimizations
 * - Adds request queueing for offline/poor connections
 * - Implements device-specific optimizations
 * - Better error handling with user-friendly messages
 */
const handleRequest = async (url, method = 'GET', body = null, retryCount = 0, options = {}) => {
    // If device is offline, queue the request for later when possible
    if (!navigator.onLine && options.queueIfOffline !== false) {
        console.log(`Device offline, queueing request: ${method} ${url}`);
        return new Promise((resolve, reject) => {
            networkManager.queueRequest(
                async () => {
                    try {
                        const result = await performRequest(url, method, body);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                },
                { 
                    critical: options.critical || false,
                    expiresIn: options.expiresIn || 3600000 // 1 hour by default
                }
            );
        });
    }
    
    // For online devices, proceed with normal request flow
    return performRequest(url, method, body, retryCount, options);
};

/**
 * Actual request implementation with enhanced error handling and retries
 */
const performRequest = async (url, method = 'GET', body = null, retryCount = 0, options = {}) => {
    try {
        const options = {
            method,
            headers: {
                ...config.defaultHeaders,
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const authTokens = localStorage.getItem('authTokens'); // Get token from local storage
        if (authTokens) {
            try {
                const token = JSON.parse(authTokens);
                options.headers['Authorization'] = `Bearer ${token}`;
            } catch (e) {
                console.error('Error parsing auth token:', e);
                // If token can't be parsed, remove it and don't include Authorization header
                localStorage.removeItem('authTokens');
            }
        }

        // Use AbortController for timeout handling
        const controller = new AbortController();
        options.signal = controller.signal;

        // Setup timeout
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
            const response = await fetch(config.apiUrl + url, options);
            clearTimeout(timeoutId);

                // Handle different HTTP status codes
                if (!response.ok) {
                    let errorMessage = '';
                    let errorData = null;
                    
                    try {
                        // Parse response to get full error data
                        errorData = await response.json();
                        errorMessage = errorData.message || config.errorMessages.default;
                    } catch (parseError) {
                        // If the response is not valid JSON
                        const errorText = await response.text();
                        errorMessage = errorText || config.errorMessages.default;
                    }

                    // Apply default messages for certain status codes if needed
                    switch (response.status) {
                        case 401:
                            if (!errorMessage) errorMessage = config.errorMessages.unauthorized;
                            // Clear auth tokens on unauthorized
                            localStorage.removeItem('authTokens');
                            break;
                        case 403:
                            if (!errorMessage) errorMessage = config.errorMessages.forbidden;
                            break;
                        case 404:
                            if (!errorMessage) errorMessage = config.errorMessages.notFound;
                            break;
                        case 500:
                        case 502:
                        case 503:
                        case 504:
                            if (!errorMessage) errorMessage = config.errorMessages.server;
                            break;
                    }

                    // Create enhanced error with additional data
                    const error = new Error(errorMessage);
                    error.status = response.status;
                    
                    // Include full error data from server if available
                    if (errorData) {
                        error.response = { 
                            data: errorData,
                            status: response.status
                        };
                        
                        // Special handling for subscription limit redirects
                        if (errorData.redirectTo === '/pricing') {
                            error.redirectToPricing = true;
                        }
                    }
                    
                    throw error;
                }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);

            // Handle network errors and implement retry mechanism
            if (error.name === 'AbortError') {
                throw new Error(config.errorMessages.timeout);
            }

            // Enhanced network error handling
            if ((error.message && error.message.includes('network')) || 
                !navigator.onLine || 
                error.name === 'TypeError') {
                
                // Check network status using our manager
                const isOnline = await networkManager.checkNetworkStatus();
                
                // If we're actually online but experiencing issues
                if (isOnline) {
                    // Check if we should retry
                    if (retryCount < config.maxRetries) {
                        console.log(`Retrying request (${retryCount + 1}/${config.maxRetries})`);
                        
                        // Exponential backoff with jitter: 1-2s, 2-4s, 4-8s, etc.
                        const baseTime = 1000 * (2 ** retryCount);
                        const jitter = Math.random() * 0.4 + 0.8; // 0.8-1.2 multiplier
                        const backoffTime = baseTime * jitter;
                        
                        await new Promise(resolve => setTimeout(resolve, backoffTime));
                        
                        return performRequest(url, method, body, retryCount + 1, options);
                    } else {
                        // Create a more helpful error message
                        const isMobile = networkManager.isMobileDevice;
                        
                        // Mobile-specific error message
                        if (isMobile) {
                            let errorMessage = config.errorMessages.network;
                            
                            // Check for specific connection issues
                            if ('connection' in navigator) {
                                const conn = navigator.connection;
                                if (conn.effectiveType === '2g' || conn.downlink < 0.5) {
                                    errorMessage = 'Poor connection detected. Please try again when you have a better signal.';
                                } else if (conn.saveData) {
                                    errorMessage = 'Data saver is enabled on your device. This may limit Memorix functionality.';
                                }
                            }
                            
                            throw new Error(errorMessage);
                        } else {
                            throw new Error(config.errorMessages.network);
                        }
                    }
                } else {
                    // We're actually offline
                    if (options.queueIfOffline !== false) {
                        // Queue the request to try again when connection is restored
                        return new Promise((resolve, reject) => {
                            networkManager.queueRequest(
                                async () => {
                                    try {
                                        const result = await performRequest(url, method, body, 0, options);
                                        resolve(result);
                                    } catch (error) {
                                        reject(error);
                                    }
                                },
                                { 
                                    critical: options.critical || false,
                                    expiresIn: options.expiresIn || 3600000 
                                }
                            );
                        });
                    } else {
                        throw new Error('You appear to be offline. Please check your connection and try again.');
                    }
                }
            }
            
            // For server errors, provide more details when possible
            if (error.status >= 500) {
                // Add timestamp to help with server log correlation
                const timestamp = new Date().toISOString();
                error.timestamp = timestamp;
                error.message = `${error.message} (Ref: ${timestamp.substring(11, 19)})`;
            }
            
            throw error;
        }
    } catch (error) {
        console.error(`API Error: ${url}`, error);
        throw error;
    }
};

// Authentication API calls
export const login = async (email, password) => {
    const data = await handleRequest('/auth/login', 'POST', { email, password });
    localStorage.setItem('authTokens', JSON.stringify(data.token)); // Store token in local storage
    return data.user;
};

export const register = async (name, email, password) => {
    const data = await handleRequest('/auth/register', 'POST', { name, email, password });
    localStorage.setItem('authTokens', JSON.stringify(data.token)); // Store token in local storage
    return data.user;
};

export const logout = async () => {
    await handleRequest('/auth/logout', 'POST');
    localStorage.removeItem('authTokens'); // Remove token from local storage
    localStorage.removeItem('user'); // Remove user data from local storage
};

export const getUser = async () => {
    try {
        return await handleRequest('/auth/user');
    } catch (error) {
        return null; // Not logged in
    }
};

// Capsule API calls
export const getCapsules = async (userId) => {
    return await handleRequest(`/capsules/user/${userId}`);
};

export const getSharedCapsules = async () => {
    return await handleRequest('/capsules/shared');
};

export const createCapsule = async (capsuleData) => {
    return await handleRequest('/capsules', 'POST', capsuleData);
};

export const getPublicCapsules = async () => {
    return await handleRequest('/capsules/public');
};

// Profile API calls
export const updateUser = async (userData) => {
    return await handleRequest(`/users/${userData._id}`, 'PUT', userData);
};

// Testimonials API calls
export const getTestimonials = async () => {
    return await handleRequest('/testimonials');
};

// Ratings API calls
export const getRatings = async () => {
    return await handleRequest('/ratings');
};

export const rateCapsule = async (capsuleId, rating) => {
    return await handleRequest('/ratings', 'POST', { capsuleId, rating });
};

// Stats API calls
export const getStats = async () => {
    return await handleRequest('/stats');
};

// Favorites API calls
export const getFavoriteCapsules = async (userId) => {
    return await handleRequest(`/favorites/user/${userId}`);
};

// Subscription API calls
export const updateSubscription = async (subscriptionData) => {
    return await handleRequest('/subscriptions/update', 'POST', subscriptionData);
};

// Admin API calls
export const getAdminStats = async () => {
    return await handleRequest('/admin/stats');
};

export const getAdminDashboardSummary = async () => {
    return await handleRequest('/admin/dashboard-summary');
};

export const getAdminUsers = async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
    }).toString();
    return await handleRequest(`/admin/users?${queryParams}`);
};

export const getAdminCapsules = async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
    }).toString();
    return await handleRequest(`/admin/capsules?${queryParams}`);
};

export const updateUserRole = async (userId, role) => {
    return await handleRequest(`/admin/users/${userId}/role`, 'PUT', { role });
};

export const verifyUser = async (userId) => {
    return await handleRequest(`/admin/users/${userId}/verify`, 'PUT');
};

export const giftSubscription = async (userId, subscriptionType, durationMonths = 1, message = 'Enjoy your complimentary subscription!') => {
    return await handleRequest(`/admin/users/${userId}/gift-subscription`, 'POST', {
        subscriptionType,
        durationMonths,
        message
    });
};

// Payment Stats
export const getPaymentStats = async (refresh = false) => {
    const endpoint = refresh ? '/stats/refresh-payment' : '/stats';
    return await handleRequest(endpoint);
};

// Capsule Management API calls
export const getAllCapsules = async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
    }).toString();
    return await handleRequest(`/capsules?${queryParams}`);
};

export const updateCapsulePublicStatus = async (capsuleId, isPublic) => {
    return await handleRequest(`/capsules/${capsuleId}`, 'PATCH', { isPublic });
};

export const featureCapsule = async (capsuleId, featured) => {
    return await handleRequest(`/capsules/${capsuleId}/feature`, 'PUT', { featured });
};

export const deleteCapsule = async (capsuleId) => {
    return await handleRequest(`/capsules/${capsuleId}`, 'DELETE');
};

// System Logs API calls
export const getSystemLogs = async (page = 1, limit = 20, filters = {}) => {
    const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
    }).toString();
    return await handleRequest(`/admin/logs?${queryParams}`);
};
