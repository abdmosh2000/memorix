import React, { useState, useEffect } from 'react';
import networkManager from '../utils/networkManager';
import './NetworkStatus.css';

/**
 * NetworkStatus Component
 * 
 * Displays a visual indicator of the current network status.
 * - Shows a toast notification when network status changes
 * - Provides visual feedback for offline/poor connection states
 * - Automatically hides after a timeout
 */
function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Function to update online status
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      
      if (navigator.onLine) {
        setMessage('You are back online');
        setConnectionQuality('good');
      } else {
        setMessage('You are currently offline');
        setConnectionQuality('offline');
      }
      
      // Show notification
      setVisible(true);
      
      // Auto-hide after 5 seconds if online, keep visible if offline
      if (navigator.onLine) {
        setTimeout(() => setVisible(false), 5000);
      }
    };
    
    // Function to handle connection quality changes
    const handleConnectionQuality = (event) => {
      if (event.type === 'poor-connection') {
        setConnectionQuality('poor');
        setMessage('Poor connection detected');
        setVisible(true);
      } else if (event.type === 'medium-connection') {
        setConnectionQuality('medium');
        // Only show notification if getting worse from good
        if (connectionQuality === 'good') {
          setMessage('Connection quality reduced');
          setVisible(true);
          setTimeout(() => setVisible(false), 3000);
        }
      } else if (event.type === 'good-connection') {
        // Only show notification if getting better from poor/medium
        if (connectionQuality === 'poor' || connectionQuality === 'medium') {
          setMessage('Connection quality improved');
          setVisible(true);
          setTimeout(() => setVisible(false), 3000);
        }
        setConnectionQuality('good');
      }
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    window.addEventListener('poor-connection', handleConnectionQuality);
    window.addEventListener('medium-connection', handleConnectionQuality);
    window.addEventListener('good-connection', handleConnectionQuality);
    
    // Check initial status with our manager
    const checkStatus = async () => {
      const isActuallyOnline = await networkManager.checkNetworkStatus();
      if (isOnline !== isActuallyOnline) {
        setIsOnline(isActuallyOnline);
        
        if (!isActuallyOnline) {
          setMessage('You are currently offline');
          setConnectionQuality('offline');
          setVisible(true);
        }
      }
    };
    
    checkStatus();
    
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('poor-connection', handleConnectionQuality);
      window.removeEventListener('medium-connection', handleConnectionQuality);
      window.removeEventListener('good-connection', handleConnectionQuality);
    };
  }, [isOnline, connectionQuality]);
  
  // Don't render anything if everything is good and notification isn't forced visible
  if (connectionQuality === 'good' && isOnline && !visible) {
    return null;
  }
  
  const statusClasses = `network-status ${connectionQuality} ${visible ? 'visible' : ''}`;
  
  return (
    <div className={statusClasses}>
      {/* Icon for the current connection state */}
      <div className="status-icon">
        {connectionQuality === 'offline' ? (
          <span role="img" aria-label="Offline">📶</span>
        ) : connectionQuality === 'poor' ? (
          <span role="img" aria-label="Poor Connection">📱⚠️</span>
        ) : (
          <span role="img" aria-label="Online">✅</span>
        )}
      </div>
      
      {/* Message explaining the current status */}
      <div className="status-message">{message}</div>
      
      {/* Close button (only shown when online) */}
      {isOnline && (
        <button 
          className="status-close"
          onClick={() => setVisible(false)}
          aria-label="Close notification"
        >
          ✕
        </button>
      )}
      
      {/* If offline, show retry button */}
      {!isOnline && (
        <button 
          className="retry-button"
          onClick={async () => {
            const isNowOnline = await networkManager.checkNetworkStatus();
            setIsOnline(isNowOnline);
            
            if (isNowOnline) {
              setMessage('Connection restored');
              setConnectionQuality('good');
              setTimeout(() => setVisible(false), 3000);
            } else {
              setMessage('Still offline. Please check your connection.');
            }
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default NetworkStatus;
