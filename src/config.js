// Environment configuration

const isDevelopment = process.env.NODE_ENV === 'development';

// API configuration
const config = {
  // Base API URL - will use environment variables in production
  apiUrl: isDevelopment 
    ? 'http://localhost:5000/api' 
    : process.env.REACT_APP_API_URL || 'https://memorix-backend-wn9o.onrender.com/api',
  
  // Default headers for API requests
  defaultHeaders: {
    'Content-Type': 'application/json'
  },
  
  // Request timeout in milliseconds
  timeout: 30000, // 30 seconds
  
  // Maximum number of retries for failed requests
  maxRetries: 2,
  
  // Network error messages
  errorMessages: {
    default: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    timeout: 'Request timed out. Please try again.',
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: 'Access denied.',
    notFound: 'The requested resource was not found.',
    server: 'Server error. Our team has been notified.'
  }
};

export default config;
