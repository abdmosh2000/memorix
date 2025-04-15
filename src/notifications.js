// Notifications Manager
import { useState, useEffect } from 'react';

// Notification types
export const NOTIFICATION_TYPES = {
  CAPSULE_RELEASED: 'capsule_released',
  NEW_COMMENT: 'new_comment',
  MENTION: 'mention',
  SYSTEM: 'system'
};

// Notification storage/retrieval from localStorage
const getStoredNotifications = () => {
  try {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    return [];
  }
};

const storeNotifications = (notifications) => {
  try {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Error storing notifications:', error);
  }
};

// Export a function to add a new notification
export const addNotification = (message, type = NOTIFICATION_TYPES.SYSTEM) => {
  const newNotification = {
    id: Date.now().toString(),
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  const notifications = getStoredNotifications();
  const updatedNotifications = [newNotification, ...notifications].slice(0, 50); // Keep only the latest 50 notifications
  
  storeNotifications(updatedNotifications);
  
  // Trigger a custom event to notify components of the new notification
  window.dispatchEvent(new CustomEvent('newNotification', { detail: newNotification }));
  
  return newNotification;
};

// Mark notifications as read
export const markAllNotificationsAsRead = () => {
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.map(notification => ({
    ...notification,
    read: true
  }));
  
  storeNotifications(updatedNotifications);
  
  // Trigger a custom event to notify components
  window.dispatchEvent(new CustomEvent('notificationsUpdate', { detail: updatedNotifications }));
  
  return updatedNotifications;
};

export const markNotificationAsRead = (notificationId) => {
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.map(notification => 
    notification.id === notificationId 
      ? { ...notification, read: true }
      : notification
  );
  
  storeNotifications(updatedNotifications);
  
  // Trigger a custom event to notify components
  window.dispatchEvent(new CustomEvent('notificationsUpdate', { detail: updatedNotifications }));
  
  return updatedNotifications;
};

// Create a custom hook for using notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // Initial load
    setNotifications(getStoredNotifications());
    
    // Listen for notification updates
    const handleNewNotification = () => {
      setNotifications(getStoredNotifications());
    };
    
    window.addEventListener('newNotification', handleNewNotification);
    window.addEventListener('notificationsUpdate', handleNewNotification);
    
    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
      window.removeEventListener('notificationsUpdate', handleNewNotification);
    };
  }, []);
  
  const markAllAsRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
  };
  
  const markAsRead = (notificationId) => {
    const updated = markNotificationAsRead(notificationId);
    setNotifications(updated);
  };
  
  return {
    notifications,
    markAllAsRead,
    markAsRead,
    hasUnread: notifications.some(notification => !notification.read),
    unreadCount: notifications.filter(notification => !notification.read).length,
  };
};

// Simple notification display function (for backward compatibility)
export const showNotification = (message, type = NOTIFICATION_TYPES.SYSTEM) => {
  const notification = addNotification(message, type);
  
  // Also show an alert for immediate feedback
  // TODO: Replace with a toast notification system
  const typeMap = {
    [NOTIFICATION_TYPES.CAPSULE_RELEASED]: 'CAPSULE RELEASED',
    [NOTIFICATION_TYPES.NEW_COMMENT]: 'NEW COMMENT',
    [NOTIFICATION_TYPES.MENTION]: 'MENTION',
    [NOTIFICATION_TYPES.SYSTEM]: 'SYSTEM',
  };
  
  alert(`${typeMap[type] || type.toUpperCase()}: ${message}`);
  
  return notification;
};

export default showNotification;
