/**
 * OfflineManager for handling auth operations during offline periods
 * Provides solutions for the login/register redirection issues
 */

import networkManager from './networkManager';

class OfflineManager {
  constructor() {
    this.pendingAuth = null;
    this.authRetryCount = 0;
    this.MAX_AUTH_RETRIES = 5;
    this.initListeners();
  }

  /**
   * Initialize event listeners for network changes
   */
  initListeners() {
    // When back online and we have pending auth, retry it
    window.addEventListener('online', this.handleBackOnline.bind(this));
    
    // Check if we have pending auth operations on startup
    if (localStorage.getItem('pendingAuth')) {
      try {
        this.pendingAuth = JSON.parse(localStorage.getItem('pendingAuth'));
      } catch (error) {
        console.error('Error parsing pending auth data', error);
        localStorage.removeItem('pendingAuth');
      }
    }
  }

  /**
   * Handle device coming back online
   */
  async handleBackOnline() {
    if (this.pendingAuth) {
      console.log('Connection restored, processing pending auth operation');
      await this.retryPendingAuth();
    }
  }

  /**
   * Save an authentication operation to be retried when back online
   * 
   * @param {string} type - The type of auth operation ('login' or 'register')
   * @param {Object} credentials - The credentials to use
   * @param {Function} callback - The callback to run once auth succeeds
   */
  saveAuthOperation(type, credentials, callback) {
    // We only keep email and redirectUrl to avoid storing passwords
    const { password, ...safeCredentials } = credentials;
    const redirectUrl = window.location.pathname;

    this.pendingAuth = {
      type,
      credentials: safeCredentials,
      redirectUrl,
      timestamp: Date.now()
    };
    
    // Store in localStorage to persist across page reloads
    try {
      localStorage.setItem('pendingAuth', JSON.stringify(this.pendingAuth));
      
      // Let the user know we'll retry when online
      const message = type === 'login' 
        ? 'Login saved. We\'ll sign you in automatically when connection is restored.'
        : 'Registration saved. We\'ll create your account once you\'re back online.';
      
      // We could show a toast notification here
      console.log(message);
      
      // Return true to indicate we've saved the operation
      return true;
    } catch (error) {
      console.error('Error saving auth operation', error);
      return false;
    }
  }
  
  /**
   * Clears any pending auth operations
   */
  clearPendingAuth() {
    this.pendingAuth = null;
    localStorage.removeItem('pendingAuth');
    this.authRetryCount = 0;
  }

  /**
   * Check if we have a pending auth operation of a specific type
   * 
   * @param {string} type - The type to check for ('login' or 'register') 
   * @returns {boolean} True if pending auth is of this type
   */
  hasPendingAuth(type) {
    return this.pendingAuth && this.pendingAuth.type === type;
  }

  /**
   * Retry any pending authentication operations
   */
  async retryPendingAuth() {
    if (!this.pendingAuth) return;
    
    // Check if we're actually online
    const isOnline = await networkManager.checkNetworkStatus();
    if (!isOnline) {
      console.log('Still offline, cannot retry auth yet');
      return;
    }
    
    // Check if the pending auth has expired (24 hours)
    const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - this.pendingAuth.timestamp > MAX_AGE) {
      console.log('Pending auth has expired, clearing');
      this.clearPendingAuth();
      return;
    }
    
    // Increment retry count
    this.authRetryCount++;
    
    // If we've tried too many times, give up
    if (this.authRetryCount > this.MAX_AUTH_RETRIES) {
      console.log(`Giving up on auth retry after ${this.MAX_AUTH_RETRIES} attempts`);
      this.clearPendingAuth();
      return;
    }
    
    try {
      const { type, credentials, redirectUrl } = this.pendingAuth;
      
      if (type === 'login') {
        // Import dynamically to avoid circular dependencies
        const { login } = await import('../api');
        
        // We need to re-enter the password
        // Here we'd typically show a password re-entry dialog
        // For now, we'll just log a message
        console.log('Password needed to complete login');
        
        // This is where we'd typically wait for the user to enter their password
        // Then call login(credentials.email, enteredPassword)
        // For now, we'll just clear the pending auth
        this.clearPendingAuth();
        
        // Navigate to login page with email prefilled
        window.location.href = `/login?email=${encodeURIComponent(credentials.email)}&pendingAuth=true`;
      } else if (type === 'register') {
        // Similar to login, we need the password re-entered
        console.log('Password needed to complete registration');
        
        // Navigate to register page with fields prefilled
        const { name, email } = credentials;
        window.location.href = `/register?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&pendingAuth=true`;
      }
    } catch (error) {
      console.error('Error retrying pending auth', error);
      
      // If it's a network error, we'll try again next time
      if (!navigator.onLine || error.message.includes('network')) {
        console.log('Still experiencing network issues, will retry later');
        return;
      }
      
      // For other errors, clear the pending auth
      this.clearPendingAuth();
    }
  }
}

// Create singleton instance
const offlineManager = new OfflineManager();

export default offlineManager;
