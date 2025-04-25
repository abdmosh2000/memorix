// Environment configuration

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Determine the API URL based on current domain and environment
 * This helps with CORS issues when deployed to different domains
 */
const determineApiUrl = () => {
  // In development, always use localhost
  if (isDevelopment) {
    return 'http://localhost:5000/api';
  }
  
  // Check for environment variables first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Check if we're on a GoDaddy domain
  const hostname = window.location.hostname;
  if (hostname.includes('godaddysites.com') || hostname.includes('.godaddy.')) {
    // Using the Render-hosted backend is generally more reliable for custom domains
    return 'https://memorix-backend-wn9o.onrender.com/api';
  }
  
  // For memorix.fun domain, prefer the dedicated API subdomain if possible
  if (hostname.includes('memorix.fun')) {
    return 'https://api.memorix.fun/api';
  }
  
  // Default fallback - use the Render backend
  return 'https://memorix-backend-wn9o.onrender.com/api';
};

// API configuration
const config = {
  // Base API URL - determined dynamically based on current domain
  apiUrl: determineApiUrl(),
  
  // Default headers for API requests
  defaultHeaders: {
    'Content-Type': 'application/json'
  },
  
  // Request timeout in milliseconds
  timeout: 30000, // 30 seconds
  
  // Maximum number of retries for failed requests
  maxRetries: 2,
  
  // Network error messages with enhanced mobile-friendly versions
  errorMessages: {
    default: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your internet connection and try again.',
    timeout: 'Request timed out. This may be due to slow internet. Please try again when you have a better connection.',
    unauthorized: 'You are not authorized to perform this action. Please log in again.',
    forbidden: 'Access denied. You do not have permission to view this resource.',
    notFound: 'The requested resource was not found.',
    server: 'Server error. Our team has been notified.',
    mobileOffline: 'It seems your device is offline. Please check your connection and try again.',
    poorConnection: 'Your connection appears to be unstable. Some features may not work properly.',
    dataLimits: 'Your device may be limiting data usage. This can affect app performance.',
    mobileBattery: 'Your device seems to be in battery saving mode, which may affect network performance.',
    cors: 'There was a cross-origin error. This is often caused by browser security settings. Please try using the main domain at https://memorix.fun'
  },
  
  // Mobile device specific settings
  mobile: {
    // Timeout settings (in milliseconds)
    timeout: {
      default: 30000,        // 30 seconds standard timeout
      poorConnection: 60000, // 60 seconds for poor connections
      critical: 45000        // 45 seconds for critical operations
    },
    
    // Retry configuration
    retry: {
      maxRetries: 3,          // Maximum retry attempts for mobile
      retryDelay: 2000,       // Base delay between retries (ms)
      criticalMaxRetries: 5   // More retries for critical operations
    },
    
    // Image quality settings
    imageQuality: {
      highSpeed: 'original',  // Full quality on fast connections
      mediumSpeed: 'medium',  // Medium quality on 3G/4G
      lowSpeed: 'low'         // Low quality on 2G/poor connections
    }
  },
  
  // Domain settings for multi-domain deployment
  domains: {
    primary: 'memorix.fun',
    api: 'api.memorix.fun',
    render: 'memorix-app.onrender.com',
    godaddy: '.godaddysites.com'
  }
};

export default config;
