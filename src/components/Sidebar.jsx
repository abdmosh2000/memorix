import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import './Sidebar.css';

function Sidebar({ isOpen, toggleSidebar }) {
    const { isLoggedIn } = useAuth();
    const { t } = useTranslation();

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-title">Memorix</h2>
                <button className="sidebar-close" onClick={toggleSidebar}>
                    &times;
                </button>
            </div>
            
            <div className="sidebar-controls">
                <div className="sidebar-control-item">
                    <span className="control-label">{t('Theme')}:</span>
                    <ThemeToggle />
                </div>
                <div className="sidebar-control-item">
                    <span className="control-label">{t('Language')}:</span>
                    <LanguageSelector />
                </div>
            </div>

            <div className="sidebar-links">
                <Link to="/" onClick={toggleSidebar}>{t('Home')}</Link>
                <Link to="/pricing" onClick={toggleSidebar}>{t('Pricing')}</Link>
                <Link to="/public" onClick={toggleSidebar}>{t('Public Capsules')}</Link>
                <Link to="/about" onClick={toggleSidebar}>{t('About Us')}</Link>
                {isLoggedIn ? (
                    <>
                        <div className="sidebar-section-title">{t('My Account')}</div>
                        <Link to="/dashboard" onClick={toggleSidebar}>{t('Dashboard')}</Link>
                        <Link to="/profile" onClick={toggleSidebar}>{t('Profile Settings')}</Link>
                        <Link to="/notifications" onClick={toggleSidebar}>{t('Notifications')}</Link>
                        
                        <div className="sidebar-section-title">{t('Capsules')}</div>
                        <Link to="/create" onClick={toggleSidebar}>{t('Create Capsule')}</Link>
                        <Link to="/favorites" onClick={toggleSidebar}>{t('Favorites')}</Link>
                    </>
                ) : (
                    <div className="sidebar-auth-buttons">
                        <Link to="/login" onClick={toggleSidebar} className="sidebar-login">
                            {t('Login')}
                        </Link>
                        <Link to="/register" onClick={toggleSidebar} className="sidebar-register">
                            {t('Register')}
                        </Link>
                    </div>
                )}
            </div>
            
            <div className="sidebar-footer">
                <p>&copy; {new Date().getFullYear()} Memorix</p>
                <div className="sidebar-social-links">
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <span>FB</span>
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <span>TW</span>
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <span>IG</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
