import React, { useEffect } from 'react';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';

// This component doesn't render anything, it just adds demo notifications when mounted
function DemoNotifications() {
    useEffect(() => {
        // Only add demo notifications if we don't have any yet
        const notificationsStr = localStorage.getItem('notifications');
        const existingNotifications = notificationsStr ? JSON.parse(notificationsStr) : [];
        
        if (existingNotifications.length === 0) {
            // Add some demo notifications with different timestamps
            setTimeout(() => {
                addNotification(
                    'Welcome to Memorix! Your digital time capsule journey begins today.',
                    NOTIFICATION_TYPES.SYSTEM
                );
            }, 1000);
            
            setTimeout(() => {
                addNotification(
                    'Your memory capsule "My First Day" has been created successfully!',
                    NOTIFICATION_TYPES.CAPSULE_RELEASED
                );
            }, 2000);
            
            setTimeout(() => {
                addNotification(
                    'Alex commented on your "Graduation Memories" capsule: "This brings back so many memories!"',
                    NOTIFICATION_TYPES.NEW_COMMENT
                );
            }, 3000);
            
            setTimeout(() => {
                addNotification(
                    '@Sarah mentioned you in a comment: "Let\'s create a shared capsule with @username for our trip!"',
                    NOTIFICATION_TYPES.MENTION
                );
            }, 4000);
            
            setTimeout(() => {
                addNotification(
                    'Your memory capsule "Birthday Wishes 2023" will be released tomorrow!',
                    NOTIFICATION_TYPES.SYSTEM
                );
            }, 5000);
        }
    }, []);
    
    return null; // This component doesn't render anything
}

export default DemoNotifications;
