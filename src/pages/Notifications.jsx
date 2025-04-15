import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../notifications';
import './Notifications.css';

function Notifications() {
    const { t } = useTranslation();
    const { notifications, markAllAsRead, markAsRead } = useNotifications();
    const [filter, setFilter] = useState('all'); // all, unread
    
    // Format the date
    const formatDate = (dateString) => {
        if (!dateString) return t('Unknown date');
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'capsule_released':
                return '🎁';
            case 'new_comment':
                return '💬';
            case 'mention':
                return '@';
            case 'system':
            default:
                return 'ℹ️';
        }
    };
    
    // Filter notifications
    const filteredNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.read) 
        : notifications;
    
    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };
    
    const handleMarkAsRead = (id) => {
        markAsRead(id);
    };
    
    return (
        <div className="notifications-page">
            <div className="notifications-page-header">
                <h1>{t('Notifications')}</h1>
                
                <div className="notifications-actions">
                    <div className="filter-buttons">
                        <button 
                            className={filter === 'all' ? 'active' : ''} 
                            onClick={() => setFilter('all')}
                        >
                            {t('All')}
                        </button>
                        <button 
                            className={filter === 'unread' ? 'active' : ''} 
                            onClick={() => setFilter('unread')}
                        >
                            {t('Unread')}
                        </button>
                    </div>
                    
                    {notifications.some(n => !n.read) && (
                        <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                            {t('Mark all as read')}
                        </button>
                    )}
                </div>
            </div>
            
            <div className="notifications-list-container">
                {filteredNotifications.length === 0 ? (
                    <div className="empty-notifications">
                        <div className="empty-icon">🔔</div>
                        <h3>{filter === 'all' ? t('No notifications') : t('No unread notifications')}</h3>
                        <p>{filter === 'all' 
                            ? t('You don\'t have any notifications yet') 
                            : t('You\'ve read all your notifications')
                        }</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {filteredNotifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                            >
                                <div className="notification-icon">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="notification-content">
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-time">{formatDate(notification.timestamp)}</span>
                                </div>
                                {!notification.read && (
                                    <div className="unread-indicator"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notifications
