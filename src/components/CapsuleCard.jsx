import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth';
import { rateCapsule } from '../api';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import './CapsuleCard.css';

function CapsuleCard({ capsule, onRatingChange }) {
    const { t } = useTranslation();
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();
    
    const [expanded, setExpanded] = useState(false);
    const [rating, setRating] = useState(capsule.userRating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comments, setComments] = useState(capsule.comments || []);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);

    // Calculate average rating
    const averageRating = capsule.totalRatings && capsule.ratingCount 
        ? (capsule.totalRatings / capsule.ratingCount).toFixed(1) 
        : 0;

    // Format the release date
    const formatReleaseDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    
    // Handle rating stars click
    const handleRatingClick = async (value) => {
        if (!isLoggedIn) {
            // Redirect to login if not logged in
            navigate('/login');
            return;
        }
        
        try {
            // Call the API to rate the capsule
            await rateCapsule(capsule.id, value);
            
            // Update local state
            setRating(value);
            
            // Call the parent component's handler if provided
            if (onRatingChange) {
                onRatingChange(capsule.id, value);
            }
            
            // Show notification
            addNotification(
                `You rated "${capsule.title}" with ${value} stars.`,
                NOTIFICATION_TYPES.SYSTEM
            );
        } catch (error) {
            console.error('Error rating capsule:', error);
            addNotification(
                `Failed to rate: ${error.message || 'Unknown error'}`,
                NOTIFICATION_TYPES.SYSTEM
            );
        }
    };
    
    // Handle adding a new comment
    const handleAddComment = () => {
        if (!isLoggedIn) {
            // Redirect to login if not logged in
            navigate('/login');
            return;
        }
        
        if (!newComment.trim()) return;
        
        const comment = {
            id: Date.now().toString(),
            text: newComment,
            userId: user.id,
            userName: user.name || user.username,
            userPhoto: user.photo || null,
            createdAt: new Date().toISOString()
        };
        
        // Update local state
        setComments([...comments, comment]);
        setNewComment('');
        
        // You would typically send this to your API
        // api.addComment(capsule.id, comment)...
        
        // Show notification to the capsule owner
        if (user.id !== capsule.userId) {
            addNotification(
                `${user.name || user.username} commented on your capsule "${capsule.title}".`,
                NOTIFICATION_TYPES.NEW_COMMENT
            );
        }
    };
    
    // Format relative time for comments
    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        
        const diffSec = Math.floor(diffMs / 1000);
        if (diffSec < 60) return `${diffSec} ${t('seconds ago')}`;
        
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin} ${t('minutes ago')}`;
        
        const diffHour = Math.floor(diffMin / 60);
        if (diffHour < 24) return `${diffHour} ${t('hours ago')}`;
        
        const diffDay = Math.floor(diffHour / 24);
        if (diffDay < 30) return `${diffDay} ${t('days ago')}`;
        
        const diffMonth = Math.floor(diffDay / 30);
        if (diffMonth < 12) return `${diffMonth} ${t('months ago')}`;
        
        const diffYear = Math.floor(diffMonth / 12);
        return `${diffYear} ${t('years ago')}`;
    };
    
    // Navigate to user profile
    const navigateToProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };
    
    // Render rating stars
    const renderStars = (currentRating, onStarClick, onStarHover, onMouseLeave, interactive = false) => {
        return (
            <div 
                className="star-rating" 
                onMouseLeave={interactive ? () => onMouseLeave(0) : null}
            >
                {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                        key={star}
                        className={`star ${star <= (hoverRating || currentRating) ? 'filled' : 'empty'}`}
                        onClick={interactive ? () => onStarClick(star) : null}
                        onMouseEnter={interactive ? () => onStarHover(star) : null}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };
    
    // Render media content
    const renderMedia = () => {
        if (!expanded) return null;
        
        return (
            <div className="capsule-media">
                {capsule.images && capsule.images.length > 0 && (
                    <div className="capsule-images">
                        {capsule.images.map((image, index) => (
                            <img 
                                key={index} 
                                src={image.url} 
                                alt={`Image ${index + 1}`}
                                onClick={() => window.open(image.url, '_blank')}
                            />
                        ))}
                    </div>
                )}
                
                {capsule.videos && capsule.videos.length > 0 && (
                    <div className="capsule-videos">
                        {capsule.videos.map((video, index) => (
                            <div key={index} className="video-container">
                                <video controls>
                                    <source src={video.url} type={video.type || 'video/mp4'} />
                                    {t('Your browser does not support video playback.')}
                                </video>
                            </div>
                        ))}
                    </div>
                )}
                
                {capsule.audio && capsule.audio.length > 0 && (
                    <div className="capsule-audio">
                        {capsule.audio.map((audio, index) => (
                            <div key={index} className="audio-container">
                                <audio controls>
                                    <source src={audio.url} type={audio.type || 'audio/mpeg'} />
                                    {t('Your browser does not support audio playback.')}
                                </audio>
                                <p>{audio.title || `${t('Audio')} ${index + 1}`}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`capsule-card ${expanded ? 'expanded' : ''}`}>
            <div className="capsule-header">
                <div 
                    className="user-info" 
                    onClick={() => navigateToProfile(capsule.userId)}
                >
                    <div className="user-avatar">
                        {capsule.userPhoto ? (
                            <img src={capsule.userPhoto} alt={capsule.userName} />
                        ) : (
                            <div className="avatar-placeholder">
                                {capsule.userName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <span className="user-name">{capsule.userName}</span>
                </div>
                
                <div className="capsule-actions">
                    <button 
                        className="expand-toggle"
                        onClick={() => setExpanded(!expanded)}
                        aria-label={expanded ? t('Collapse') : t('Expand')}
                    >
                        {expanded ? '▲' : '▼'}
                    </button>
                </div>
            </div>
            
            <h3 className="capsule-title">{capsule.title}</h3>
            
            <div className="capsule-meta">
                <span className="release-date">
                    {t('Release Date')}: {formatReleaseDate(capsule.releaseDate)}
                </span>
                <span className="privacy-status">
                    {capsule.isPublic ? t('Public') : t('Private')}
                </span>
            </div>
            
            <div className="capsule-content">
                <p className="capsule-description">{capsule.description}</p>
                
                {renderMedia()}
                
                {expanded && (
                    <div className="capsule-tags">
                        {capsule.tags && capsule.tags.map((tag, index) => (
                            <span key={index} className="tag">#{tag}</span>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="rating-section">
                <div className="average-rating">
                    <span>{t('Rating')}:</span>
                    {renderStars(parseFloat(averageRating), null, null, null, false)}
                    <span className="rating-value">
                        {averageRating} ({capsule.ratingCount || 0})
                    </span>
                </div>
                
                {isLoggedIn && (
                    <div className="user-rating">
                        <span>{t('Your rating')}:</span>
                        {renderStars(
                            rating, 
                            handleRatingClick, 
                            setHoverRating, 
                            setHoverRating, 
                            true
                        )}
                    </div>
                )}
            </div>
            
            <div className="comments-section">
                <button 
                    className="toggle-comments"
                    onClick={() => setShowComments(!showComments)}
                >
                    {showComments 
                        ? t('Hide Comments') 
                        : t('Show Comments')} ({comments.length})
                </button>
                
                {showComments && (
                    <>
                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <p className="no-comments">{t('No comments yet. Be the first to comment!')}</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="comment">
                                        <div 
                                            className="comment-user" 
                                            onClick={() => navigateToProfile(comment.userId)}
                                        >
                                            {comment.userPhoto ? (
                                                <img 
                                                    src={comment.userPhoto} 
                                                    alt={comment.userName} 
                                                    className="comment-avatar"
                                                />
                                            ) : (
                                                <div className="comment-avatar-placeholder">
                                                    {comment.userName?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="comment-username">{comment.userName}</span>
                                        </div>
                                        <p className="comment-text">{comment.text}</p>
                                        <span className="comment-time">
                                            {getRelativeTime(comment.createdAt)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {isLoggedIn && (
                            <div className="add-comment">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={t('Add a comment...')}
                                    rows={2}
                                />
                                <button 
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                >
                                    {t('Post')}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default CapsuleCard;
