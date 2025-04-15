import React, { useState, useRef, useEffect } from 'react';
import './NotificationsDropdown.css';

function NotificationsDropdown({ notifications = [], onMarkAsRead }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const unreadCount = notifications.filter(notif => !notif.read).length;

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            onMarkAsRead();
        }
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const notifTime = new Date(timestamp);
        const diffMs = now - notifTime;
        const diffMins = Math.round(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        
        const diffHours = Math.round(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        
        const diffDays = Math.round(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="notifications-dropdown" ref={dropdownRef}>
            <button 
                className="notifications-icon" 
                onClick={toggleDropdown}
                aria-label="Notifications"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>
            
            {isOpen && (
                <div className="notifications-menu">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        {notifications.length > 0 && (
                            <button className="mark-all-read">Mark all as read</button>
                        )}
                    </div>
                    
                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notifications">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <>
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    >
                                        <div className="notification-icon">
                                            {notification.type === 'capsule_released' && '🎁'}
                                            {notification.type === 'new_comment' && '💬'}
                                            {notification.type === 'mention' && '@'}
                                            {notification.type === 'system' && 'ℹ️'}
                                        </div>
                                        <div className="notification-content">
                                            <p className="notification-message">{notification.message}</p>
                                            <span className="notification-time">{getTimeAgo(notification.timestamp)}</span>
                                        </div>
                                        {!notification.read && (
                                            <div className="unread-indicator"></div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    
                    <div className="notifications-footer">
                        <a href="/notifications">View all notifications</a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationsDropdown;
