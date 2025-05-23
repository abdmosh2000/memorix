import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { useNotifications } from '../notifications';
import { useTranslation } from 'react-i18next';
import ProfileDropdown from './ProfileDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import logo from '../assets/logo.png';
import './Navbar.css';

function Navbar({ toggleSidebar }) {
    const { isLoggedIn, logout, user } = useAuth();
    const { t } = useTranslation();
    const { notifications, markAllAsRead } = useNotifications();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img src={logo} alt="Memorix Logo" className="navbar-logo" />
                </Link>
            </div>
            
            {/* Main navigation links in the center */}
            <div className="navbar-center">
                <div className="navbar-links">
                    <Link to="/pricing">{t('Pricing')}</Link>
                    <Link to="/public">{t('Public Capsules')}</Link>
                    <Link to="/ratings">{t('Ratings')}</Link>
                    <Link to="/about">{t('About Us')}</Link>
                </div>
            </div>
            
            {/* Controls on the right */}
            <div className="navbar-right">
                <div className="navbar-controls">
                    <ThemeToggle />
                    <LanguageSelector />
                    {isLoggedIn && (
                        <>
                            {user?.subscription?.plan_name && user.subscription.plan_name !== 'Free' && (
                                <div 
                                    className="plan-badge"
                                    data-plan={user.subscription.plan_name.toLowerCase()}
                                    data-status={user.subscription.status}
                                >
                                    {user.subscription.status === 'lifetime' 
                                        ? 'Lifetime Member' 
                                        : `${user.subscription.plan_name} User`}
                                </div>
                            )}
                            <NotificationsDropdown 
                                notifications={notifications} 
                                onMarkAsRead={markAllAsRead} 
                            />
                        </>
                    )}
                    {isLoggedIn ? (
                        <ProfileDropdown user={user} onLogout={logout} />
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="login-link">{t('Login')}</Link>
                            <Link to="/register" className="register-link">{t('Register')}</Link>
                        </div>
                    )}
                </div>
            </div>
            
            <button className="navbar-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
                ☰
            </button>
        </nav>
    );
}

export default Navbar;
