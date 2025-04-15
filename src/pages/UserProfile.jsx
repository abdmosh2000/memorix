import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CapsuleCard from '../components/CapsuleCard';
import { useAuth } from '../auth';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import './UserProfile.css';

function UserProfile() {
    const { userId } = useParams();
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const [user, setUser] = useState(null);
    const [capsules, setCapsules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('capsules'); // capsules, about, stats
    
    // Sample user data for demonstration
    const sampleUsers = {
        'user123': {
            id: 'user123',
            name: 'Sarah Johnson',
            username: 'sarahj',
            photo: 'https://randomuser.me/api/portraits/women/44.jpg',
            bio: 'Digital memory enthusiast. I love preserving special moments and sharing stories that matter. Photography and travel are my passion!',
            joinDate: '2022-03-15',
            location: 'San Francisco, CA',
            website: 'https://sarahjohnson.com',
            stats: {
                capsules: 12,
                ratings: 48,
                followers: 156,
                following: 89
            },
            badges: ['Premium Member', 'Memory Curator', 'Photo Expert']
        },
        'user456': {
            id: 'user456',
            name: 'David Chen',
            username: 'dchen',
            photo: null,
            bio: 'Adventure seeker and outdoor photographer. I create time capsules for my hiking and travel experiences.',
            joinDate: '2022-05-22',
            location: 'Portland, OR',
            website: 'https://davidchenphotography.com',
            stats: {
                capsules: 8,
                ratings: 32,
                followers: 92,
                following: 104
            },
            badges: ['Nature Enthusiast', 'Travel Logger']
        },
        'user789': {
            id: 'user789',
            name: 'Emma Wilson',
            username: 'emma_w',
            photo: 'https://randomuser.me/api/portraits/women/33.jpg',
            bio: 'Wedding photographer and memory keeper. I love helping couples preserve their special day forever.',
            joinDate: '2022-01-08',
            location: 'Chicago, IL',
            website: 'https://emmawilsonphotography.com',
            stats: {
                capsules: 15,
                ratings: 67,
                followers: 211,
                following: 97
            },
            badges: ['Photography Pro', 'Event Specialist', 'Premium Member']
        }
    };
    
    // Sample capsule data for demonstration
    const sampleCapsules = [
        {
            id: '1',
            title: 'My Graduation Day',
            description: 'All the memories from my graduation ceremony and the celebration afterwards.',
            releaseDate: '2023-05-15',
            isPublic: true,
            userName: 'Sarah Johnson',
            userId: 'user123',
            userPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
            totalRatings: 18,
            ratingCount: 4,
            userRating: 0,
            tags: ['graduation', 'college', 'celebration'],
            comments: [],
            images: [
                { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1' }
            ]
        },
        {
            id: '4',
            title: 'Birthday Celebration 2023',
            description: 'My 30th birthday with friends and family. A day full of surprises and joy!',
            releaseDate: '2023-04-10',
            isPublic: true,
            userName: 'Sarah Johnson',
            userId: 'user123',
            userPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
            totalRatings: 15,
            ratingCount: 3,
            userRating: 0,
            tags: ['birthday', 'celebration', 'friends'],
            comments: [],
            images: [
                { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d' }
            ]
        },
        {
            id: '5',
            title: 'Company Retreat 2023',
            description: 'Team building activities and strategic planning at our annual company retreat.',
            releaseDate: '2023-09-20',
            isPublic: true,
            userName: 'Sarah Johnson',
            userId: 'user123',
            userPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
            totalRatings: 10,
            ratingCount: 2,
            userRating: 0,
            tags: ['work', 'team', 'retreat'],
            comments: [],
            images: [
                { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c' }
            ]
        },
        {
            id: '2',
            title: 'Summer Trip 2023',
            description: 'Our amazing adventure exploring the national parks. So many beautiful landscapes and wildlife encounters.',
            releaseDate: '2023-08-10',
            isPublic: true,
            userName: 'David Chen',
            userId: 'user456',
            userPhoto: null,
            totalRatings: 24,
            ratingCount: 5,
            userRating: 0,
            tags: ['travel', 'nature', 'summer', 'hiking'],
            comments: [],
            images: [
                { url: 'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b' }
            ]
        },
        {
            id: '3',
            title: 'Wedding Day Memories',
            description: 'The most special day of our lives. From the ceremony to the reception, every moment was magical.',
            releaseDate: '2023-06-30',
            isPublic: true,
            userName: 'Emma Wilson',
            userId: 'user789',
            userPhoto: 'https://randomuser.me/api/portraits/women/33.jpg',
            totalRatings: 35,
            ratingCount: 7,
            userRating: 0,
            tags: ['wedding', 'love', 'family', 'celebration'],
            comments: [],
            images: [
                { url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed' }
            ]
        }
    ];
    
    useEffect(() => {
        // Simulate API call to fetch user data and capsules
        setLoading(true);
        
        setTimeout(() => {
            try {
                const userData = sampleUsers[userId];
                if (!userData) {
                    throw new Error('User not found');
                }
                setUser(userData);
                
                // Filter capsules for this user
                const userCapsules = sampleCapsules.filter(capsule => capsule.userId === userId);
                setCapsules(userCapsules);
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError(err);
                setLoading(false);
            }
        }, 1000);
    }, [userId]);
    
    // Handle following a user
    const handleFollowUser = () => {
        if (!isLoggedIn) {
            return; // Redirect to login or show login modal
        }
        
        // In a real app, this would be an API call
        addNotification(
            t('You are now following {{name}}', { name: user.name }),
            NOTIFICATION_TYPES.SYSTEM
        );
    };
    
    // Handle rating change
    const handleRatingChange = async (capsuleId, rating) => {
        // Similar to the PublicCapsules page implementation
        setCapsules(prevCapsules => 
            prevCapsules.map(capsule => 
                capsule.id === capsuleId 
                    ? { 
                        ...capsule, 
                        userRating: rating,
                        totalRatings: capsule.totalRatings + (rating - (capsule.userRating || 0)),
                        ratingCount: capsule.userRating ? capsule.ratingCount : capsule.ratingCount + 1
                      } 
                    : capsule
            )
        );
        
        // Show notification
        const ratedCapsule = capsules.find(c => c.id === capsuleId);
        if (ratedCapsule) {
            addNotification(
                t('You rated "{{title}}" with {{rating}} stars', { 
                    title: ratedCapsule.title,
                    rating: rating
                }),
                NOTIFICATION_TYPES.SYSTEM
            );
        }
    };
    
    // Format join date
    const formatJoinDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'long'
        });
    };
    
    if (loading) {
        return (
            <div className="user-profile-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>{t('Loading profile...')}</p>
                </div>
            </div>
        );
    }
    
    if (error || !user) {
        return (
            <div className="user-profile-page">
                <div className="error-message">
                    <p>{t('User not found or an error occurred.')}</p>
                    <Link to="/public" className="back-link">
                        {t('Go back to Public Capsules')}
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="user-profile-page">
            <div className="profile-header">
                <div className="profile-cover-photo"></div>
                
                <div className="profile-main-info">
                    <div className="profile-avatar">
                        {user.photo ? (
                            <img src={user.photo} alt={user.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-details">
                        <h1 className="profile-name">{user.name}</h1>
                        <p className="profile-username">@{user.username}</p>
                        {user.location && (
                            <p className="profile-location">
                                📍 {user.location}
                            </p>
                        )}
                        <p className="profile-join-date">
                            {t('Joined')}: {formatJoinDate(user.joinDate)}
                        </p>
                    </div>
                    
                    <div className="profile-actions">
                        <button className="follow-button" onClick={handleFollowUser}>
                            {t('Follow')}
                        </button>
                    </div>
                </div>
                
                <div className="profile-stats">
                    <div className="stat-item">
                        <span className="stat-value">{user.stats.capsules}</span>
                        <span className="stat-label">{t('Capsules')}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{user.stats.ratings}</span>
                        <span className="stat-label">{t('Ratings')}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{user.stats.followers}</span>
                        <span className="stat-label">{t('Followers')}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{user.stats.following}</span>
                        <span className="stat-label">{t('Following')}</span>
                    </div>
                </div>
                
                {user.bio && (
                    <div className="profile-bio">
                        <p>{user.bio}</p>
                    </div>
                )}
                
                {user.badges && user.badges.length > 0 && (
                    <div className="profile-badges">
                        {user.badges.map((badge, index) => (
                            <span key={index} className="badge">
                                {badge}
                            </span>
                        ))}
                    </div>
                )}
                
                <div className="profile-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'capsules' ? 'active' : ''}`}
                        onClick={() => setActiveTab('capsules')}
                    >
                        {t('Capsules')}
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        {t('About')}
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        {t('Stats')}
                    </button>
                </div>
            </div>
            
            <div className="profile-content">
                {activeTab === 'capsules' && (
                    <div className="capsules-tab">
                        <h2>{t('Public Memory Capsules')}</h2>
                        
                        {capsules.length === 0 ? (
                            <div className="no-capsules">
                                <p>{t('No public capsules yet.')}</p>
                            </div>
                        ) : (
                            <div className="capsule-list">
                                {capsules.map(capsule => (
                                    <CapsuleCard 
                                        key={capsule.id} 
                                        capsule={capsule}
                                        onRatingChange={handleRatingChange}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'about' && (
                    <div className="about-tab">
                        <h2>{t('About')} {user.name}</h2>
                        
                        <div className="about-section">
                            <h3>{t('Bio')}</h3>
                            <p>{user.bio || t('No bio provided.')}</p>
                        </div>
                        
                        {user.website && (
                            <div className="about-section">
                                <h3>{t('Website')}</h3>
                                <a href={user.website} target="_blank" rel="noopener noreferrer">
                                    {user.website}
                                </a>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'stats' && (
                    <div className="stats-tab">
                        <h2>{t('Activity Stats')}</h2>
                        
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-card-value">{user.stats.capsules}</div>
                                <div className="stat-card-label">{t('Total Capsules')}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-value">{user.stats.ratings}</div>
                                <div className="stat-card-label">{t('Ratings Received')}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-value">{user.stats.followers}</div>
                                <div className="stat-card-label">{t('Followers')}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-value">{user.stats.following}</div>
                                <div className="stat-card-label">{t('Following')}</div>
                            </div>
                        </div>
                        
                        <div className="stats-chart">
                            <h3>{t('Activity Chart')}</h3>
                            <p>{t('A visualization of user activity would be shown here.')}</p>
                            <div className="chart-placeholder">
                                {t('Activity Chart Visualization')}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfile;
