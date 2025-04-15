import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth';
import { useNavigate, Link } from 'react-router-dom';
import CapsuleCard from '../components/CapsuleCard';
import { getCapsules, getSharedCapsules } from '../api';
import './Dashboard.css';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [userCapsules, setUserCapsules] = useState([]);
    const [sharedCapsules, setSharedCapsules] = useState([]);
    const [stats, setStats] = useState({ total: 0, public: 0, private: 0, upcoming: 0, shared: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // Check if user is available
                if (!user._id) {
                    throw new Error('User information not available');
                }
                
                // Use our API functions
                const [userCapsuleData, sharedCapsuleData] = await Promise.all([
                    getCapsules(user._id),
                    getSharedCapsules()
                ]);
                
                // Sort capsules by creation date (newest first)
                const sortedUserCapsules = userCapsuleData.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                
                const sortedSharedCapsules = sharedCapsuleData.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                
                setUserCapsules(sortedUserCapsules);
                setSharedCapsules(sortedSharedCapsules);
                
                // Calculate stats
                const publicCount = sortedUserCapsules.filter(c => c.isPublic).length;
                const upcomingCount = sortedUserCapsules.filter(c => 
                    new Date(c.releaseDate) > new Date()
                ).length;
                
                setStats({
                    total: sortedUserCapsules.length,
                    public: publicCount,
                    private: sortedUserCapsules.length - publicCount,
                    upcoming: upcomingCount,
                    shared: sortedSharedCapsules.length
                });
                
            } catch (e) {
                setError(e.message);
                console.error("Error fetching data:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    const handleCreateCapsule = () => {
        navigate('/create');
    };

    // Generate random placeholder capsules for demo if none exist
    const generatePlaceholderCapsules = () => {
        const titles = [
            "My Summer Memories", 
            "Letter to Future Self", 
            "Wedding Anniversary",
            "Graduation Message",
            "Time Capsule 2023"
        ];
        
        return Array(5).fill().map((_, i) => ({
            _id: `placeholder-${i}`,
            title: titles[i],
            content: "This is a placeholder capsule content.",
            releaseDate: new Date(Date.now() + Math.random() * 31536000000).toISOString(),
            isPublic: Math.random() > 0.5,
            createdAt: new Date().toISOString()
        }));
    };

    // Use placeholders if no real capsules exist
    const capsulesToShow = userCapsules.length > 0 
        ? userCapsules.slice(0, 3) 
        : generatePlaceholderCapsules().slice(0, 3);
    
    if (loading) {
        return <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading your capsules...</p>
        </div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Welcome, {user?.name || 'Memory Keeper'}!</h1>
                    <p className="dashboard-subtitle">Your personal time capsule dashboard</p>
                </div>
                <button 
                    className="create-capsule-btn" 
                    onClick={handleCreateCapsule}
                >
                    Create New Capsule
                </button>
            </div>

            {error && (
                <div className="dashboard-error">
                    <p>Error loading data: {error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            )}
            
            <div className="dashboard-stats-container">
                <div className="stats-card">
                    <div className="stat-item">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Capsules</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.public}</span>
                        <span className="stat-label">Public</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.private}</span>
                        <span className="stat-label">Private</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.upcoming}</span>
                        <span className="stat-label">Upcoming</span>
                    </div>
                </div>
            </div>
            
            <div className="dashboard-content">
                <section className="recent-capsules-section">
                    <div className="section-header">
                        <h2>{t('Recent Capsules')}</h2>
                        <Link to="/my-capsules" className="view-all-link">{t('View All')}</Link>
                    </div>
                    
                    <div className="capsules-grid">
                        {capsulesToShow.length > 0 ? (
                            capsulesToShow.map(capsule => (
                                <div key={capsule._id} className="capsule-card-container">
                                    <CapsuleCard capsule={capsule} />
                                    <div className="card-actions">
                                        <button 
                                            className="view-btn"
                                            onClick={() => navigate(`/capsule/${capsule._id}`)}
                                        >
                                            {t('View Details')}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>{t('You haven\'t created any capsules yet.')}</p>
                                <button 
                                    className="create-first-btn"
                                    onClick={handleCreateCapsule}
                                >
                                    {t('Create Your First Capsule')}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
                
                {/* Shared With You Section */}
                {sharedCapsules.length > 0 && (
                    <section className="shared-capsules-section">
                        <div className="section-header">
                            <h2>{t('Shared With You')}</h2>
                            <Link to="/shared-capsules" className="view-all-link">{t('View All')}</Link>
                        </div>
                        
                        <div className="capsules-grid">
                            {sharedCapsules.slice(0, 3).map(capsule => (
                                <div key={capsule._id} className="capsule-card-container shared">
                                    <div className="shared-badge">{t('Shared')}</div>
                                    <CapsuleCard capsule={capsule} />
                                    <div className="card-actions">
                                        <button 
                                            className="view-btn"
                                            onClick={() => navigate(`/capsule/${capsule._id}`)}
                                        >
                                            {t('View Details')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                
                <section className="quick-actions-section">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <div className="action-card" onClick={handleCreateCapsule}>
                            <div className="action-icon">📝</div>
                            <h3>Create Capsule</h3>
                            <p>Start a new memory capsule</p>
                        </div>
                        <div className="action-card" onClick={() => navigate('/public')}>
                            <div className="action-icon">🌐</div>
                            <h3>Explore Public</h3>
                            <p>Browse capsules shared by others</p>
                        </div>
                        <div className="action-card" onClick={() => navigate('/profile')}>
                            <div className="action-icon">👤</div>
                            <h3>Profile Settings</h3>
                            <p>Update your account information</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
