import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProfileDropdown.css';

function ProfileDropdown({ user, onLogout }) {
    // Check if user has admin role
    const isAdmin = user && user.role === 'admin';
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
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

    return (
        <div className="profile-dropdown" ref={dropdownRef}>
            <img
                src={user?.profilePicture || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="8" r="4" fill="%23888"/><path d="M20,19c0-4.4-3.6-8-8-8s-8,3.6-8,8" fill="%23888"/></svg>'} 
                alt="Profile"
                className="profile-image"
                onClick={toggleDropdown}
            />
            {isOpen && (
                <div className="dropdown-menu">
                    <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                    <Link to="/my-capsules" onClick={() => setIsOpen(false)}>All My Capsules</Link>
                    <Link to="/profile/settings" onClick={() => setIsOpen(false)}>Settings</Link>
                    {isAdmin && (
                        <Link to="/admin" onClick={() => setIsOpen(false)} className="admin-link">
                            Admin Dashboard
                        </Link>
                    )}
                    <button onClick={onLogout}>Logout</button>
                </div>
            )}
        </div>
    );
}

export default ProfileDropdown;
