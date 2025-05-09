import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import './MobileNavbar.css';

function MobileNavbar() {
    const location = useLocation();
    const { isLoggedIn, user } = useAuth();
    const isAdmin = user && user.role === 'admin';
    
    // Function to check if a route is active
    const isActive = (path) => {
        return location.pathname === path;
    };
    
    // Don't show bottom nav for non-logged in users
    if (!isLoggedIn) {
        return null;
    }

    return (
        <nav className="mobile-navbar">
            <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-nav-icon">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className="mobile-nav-label">Home</span>
            </Link>
            
            <Link to="/dashboard" className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-nav-icon">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span className="mobile-nav-label">Dashboard</span>
            </Link>
            
            <Link to="/create" className={`mobile-nav-item ${isActive('/create') ? 'active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-nav-icon create-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <span className="mobile-nav-label">Create</span>
            </Link>
            
            <Link to="/notifications" className={`mobile-nav-item ${isActive('/notifications') ? 'active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-nav-icon">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span className="mobile-nav-label">Alerts</span>
            </Link>
            
            <Link to="/profile" className={`mobile-nav-item ${isActive('/profile') ? 'active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-nav-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="mobile-nav-label">Profile</span>
            </Link>
            
            {isAdmin && (
                <Link to="/admin" className={`mobile-nav-item ${isActive('/admin') ? 'active' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-nav-icon admin-icon">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    <span className="mobile-nav-label admin-label">Admin</span>
                </Link>
            )}
        </nav>
    );
}

export default MobileNavbar;
