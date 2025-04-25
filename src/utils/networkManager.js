/**
 * Network Manager for handling connectivity issues, especially on mobile devices
 * Provides utilities for offline detection, request queueing, and automatic retries
 */

import config from '../config';

class NetworkManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingRequests = [];
    this.networkListenersInitialized = false;
    this.isMobileDevice = this.checkIfMobile();
    
    // Initialize network status listeners
    this.initNetworkListeners();
  }
  
  /**
   * Initialize event listeners for network status changes
   */
  initNetworkListeners() {
    if (this.networkListenersInitialized) return;
    
    // Add event listeners for online/offline status
    window.addEventListener('online', () => {
      console.log('🌐 Network connection restored');
      this.isOnline = true;
      this.processPendingRequests();
    });
    
    window.addEventListener('offline', () => {
      console.log('🔌 Network connection lost');
      this.isOnline = false;
    });
    
    // Add additional mobile-specific listeners
    if (this.isMobileDevice) {
      // Handle page visibility changes (common on mobile when app goes to background)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // When app returns to foreground, check network status
          this.checkNetworkStatus();
        }
      });
      
      // For mobile devices, check network quality periodically
      this.startNetworkQualityMonitoring();
    }
    
    this.networkListenersInitialized = true;
  }
  
  /**
   * Check if the user is on a mobile device
   * @returns {boolean} true if mobile device
   */
  checkIfMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check for common mobile OS patterns
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent);
  }
  
  /**
   * Actively check network status to handle edge cases
   * where the online/offline events might not trigger
   */
  async checkNetworkStatus() {
    try {
      // Attempt a small fetch to check real connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(
        // Use a tiny endpoint that won't consume much bandwidth
        // Note: config.apiUrl already includes '/api', so we don't repeat it
        `${config.apiUrl.replace(/\/api$/, '')}/api/health/ping?${new Date().getTime()}`, 
        { 
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-store',
          mode: 'cors',
          credentials: 'same-origin',
          headers: {
            'Accept': 'text/plain'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.ok && !this.isOnline) {
        // We were offline but now have connection
        this.isOnline = true;
        this.processPendingRequests();
      }
      
      return this.isOnline;
    } catch (error) {
      // If this fails, we're likely offline
      if (this.isOnline) {
        this.isOnline = false;
      }
      return false;
    }
  }
  
  /**
   * Monitor network quality on mobile devices
   * to adjust request behavior
   */
  startNetworkQualityMonitoring() {
    // Check if the Network Information API is available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      // Handle connection changes
      connection.addEventListener('change', () => {
        this.handleConnectionChange(connection);
      });
      
      // Initial check
      this.handleConnectionChange(connection);
    }
    
    // Periodically verify actual connectivity
    setInterval(() => {
      this.checkNetworkStatus();
    }, 30000); // Check every 30 seconds
  }
  
  /**
   * Handle changes in connection quality
   * @param {NetworkInformation} connection - Network information object
   */
  handleConnectionChange(connection) {
    // Get connection data (only available in some browsers)
    const type = connection.type; // wifi, cellular, etc.
    const effectiveType = connection.effectiveType; // 4g, 3g, 2g, etc.
    const downlink = connection.downlink; // Mbps
    const rtt = connection.rtt; // Round-trip time in ms
    
    console.log(`Network changed: ${type} (${effectiveType}), Downlink: ${downlink} Mbps, RTT: ${rtt}ms`);
    
    // Adjust request behavior based on connection quality
    // For example, on slow connections:
    if (effectiveType === '2g' || downlink < 0.5) {
      // Reduce image quality, increase timeouts, etc.
      window.dispatchEvent(new CustomEvent('poor-connection'));
    } else if (effectiveType === '3g' || downlink < 2) {
      // Medium quality adjustments
      window.dispatchEvent(new CustomEvent('medium-connection'));
    } else {
      // Good connection
      window.dispatchEvent(new CustomEvent('good-connection'));
    }
  }
  
  /**
   * Queue a request to be sent when connection is restored
   * @param {Function} requestFn - Function that performs the request
   * @param {Object} options - Request options
   */
  queueRequest(requestFn, options = {}) {
    const { critical = false, expiresIn = 3600000 } = options; // Expires in 1 hour by default
    
    const pendingRequest = {
      id: Date.now().toString(),
      requestFn,
      timestamp: Date.now(),
      expiresAt: Date.now() + expiresIn,
      critical,
      retryCount: 0
    };
    
    this.pendingRequests.push(pendingRequest);
    
    // Save to localStorage for persistence across page reloads
    if (critical) {
      this.savePendingRequests();
    }
    
    return pendingRequest.id;
  }
  
  /**
   * Save pending requests to localStorage
   */
  savePendingRequests() {
    try {
      // Only save critical requests that can be serialized
      const criticalRequests = this.pendingRequests
        .filter(req => req.critical && req.serializable);
        
      if (criticalRequests.length > 0) {
        localStorage.setItem('pendingRequests', JSON.stringify(criticalRequests));
      }
    } catch (error) {
      console.error('Error saving pending requests', error);
    }
  }
  
  /**
   * Load previously saved pending requests
   */
  loadPendingRequests() {
    try {
      const savedRequests = localStorage.getItem('pendingRequests');
      if (savedRequests) {
        const parsed = JSON.parse(savedRequests);
        
        // Restore only valid requests
        parsed.forEach(req => {
          // Skip expired requests
          if (req.expiresAt > Date.now()) {
            this.pendingRequests.push(req);
          }
        });
        
        // If we loaded requests, try to process them
        if (this.pendingRequests.length > 0 && this.isOnline) {
          this.processPendingRequests();
        }
        
        // Clear storage
        localStorage.removeItem('pendingRequests');
      }
    } catch (error) {
      console.error('Error loading pending requests', error);
    }
  }
  
  /**
   * Process all pending requests when connection is restored
   */
  async processPendingRequests() {
    // Early return if offline or no pending requests
    if (!this.isOnline || this.pendingRequests.length === 0) {
      return;
    }
    
    console.log(`Processing ${this.pendingRequests.length} pending requests`);
    
    // Create a copy of the array to avoid modification during iteration
    const requestsToProcess = [...this.pendingRequests];
    
    // Clear the original array
    this.pendingRequests = [];
    
    // Process each request
    for (const request of requestsToProcess) {
      // Skip expired requests
      if (request.expiresAt < Date.now()) {
        console.log(`Skipping expired request ${request.id}`);
        continue;
      }
      
      try {
        // Execute the request
        await request.requestFn();
        console.log(`Completed pending request ${request.id}`);
      } catch (error) {
        console.error(`Error processing pending request ${request.id}:`, error);
        
        // If still online, requeue with increased retry count
        if (this.isOnline && request.retryCount < 3) {
          request.retryCount += 1;
          this.pendingRequests.push(request);
        }
      }
    }
    
    // Save any requests that couldn't be processed
    if (this.pendingRequests.length > 0) {
      this.savePendingRequests();
    }
  }
}

// Create singleton instance
const networkManager = new NetworkManager();

export default networkManager;
