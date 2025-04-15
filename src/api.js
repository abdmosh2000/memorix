import config from './config';

// Helper function to handle API requests with retries and better error handling
const handleRequest = async (url, method = 'GET', body = null, retryCount = 0) => {
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
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || config.errorMessages.default;
                } catch (parseError) {
                    // If the response is not valid JSON
                    const errorText = await response.text();
                    errorMessage = errorText || config.errorMessages.default;
                }

                // Handle specific status codes
                switch (response.status) {
                    case 401:
                        errorMessage = config.errorMessages.unauthorized;
                        // Clear auth tokens on unauthorized
                        localStorage.removeItem('authTokens');
                        break;
                    case 403:
                        errorMessage = config.errorMessages.forbidden;
                        break;
                    case 404:
                        errorMessage = config.errorMessages.notFound;
                        break;
                    case 500:
                    case 502:
                    case 503:
                    case 504:
                        errorMessage = config.errorMessages.server;
                        break;
                }

                const error = new Error(errorMessage);
                error.status = response.status;
                throw error;
            }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);

            // Handle network errors and implement retry mechanism
            if (error.name === 'AbortError') {
                throw new Error(config.errorMessages.timeout);
            }

            if ((error.message && error.message.includes('network')) || 
                !navigator.onLine || 
                error.name === 'TypeError') {
                
                // Check if we should retry
                if (retryCount < config.maxRetries) {
                    console.log(`Retrying request (${retryCount + 1}/${config.maxRetries})`);
                    
                    // Exponential backoff: 1s, 2s, 4s, etc.
                    const backoffTime = 1000 * (2 ** retryCount);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                    
                    return handleRequest(url, method, body, retryCount + 1);
                } else {
                    throw new Error(config.errorMessages.network);
                }
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
