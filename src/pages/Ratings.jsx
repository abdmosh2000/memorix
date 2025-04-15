import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRatings } from '../api'; // Import API function
import { useAuth } from '../auth';
import './Rating.css';

function Ratings() {
    const [ratings, setRatings] = useState([]);
    const [averages, setAverages] = useState({ ux: 0, design: 0, usability: 0, security: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'highest', 'newest'
    
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const data = await getRatings();
                
                // Sort by date (newest first)
                const sortedData = [...data].sort((a, b) => 
                    new Date(b.submittedAt || Date.now()) - new Date(a.submittedAt || Date.now())
                );
                
                setRatings(sortedData);
                
                // Calculate averages
                if (data.length > 0) {
                    const sums = data.reduce((acc, rating) => {
                        acc.ux += rating.ux || 0;
                        acc.design += rating.design || 0;
                        acc.usability += rating.usability || 0;
                        acc.security += rating.security || 0;
                        acc.count++;
                        return acc;
                    }, { ux: 0, design: 0, usability: 0, security: 0, count: 0 });
                    
                    setAverages({
                        ux: (sums.ux / sums.count).toFixed(1),
                        design: (sums.design / sums.count).toFixed(1),
                        usability: (sums.usability / sums.count).toFixed(1),
                        security: (sums.security / sums.count).toFixed(1),
                        overall: ((sums.ux + sums.design + sums.usability + sums.security) / (sums.count * 4)).toFixed(1)
                    });
                }
                
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
                console.error("Error fetching ratings:", err);
            }
        };

        fetchRatings();
    }, []);
    
    // Filter and sort ratings based on selected filter
    const getFilteredRatings = () => {
        switch (filter) {
            case 'highest':
                return [...ratings].sort((a, b) => {
                    const avgA = (a.ux + a.design + a.usability + a.security) / 4;
                    const avgB = (b.ux + b.design + b.usability + b.security) / 4;
                    return avgB - avgA;
                });
            case 'newest':
                return [...ratings].sort((a, b) => 
                    new Date(b.submittedAt || Date.now()) - new Date(a.submittedAt || Date.now())
                );
            case 'oldest':
                return [...ratings].sort((a, b) => 
                    new Date(a.submittedAt || Date.now()) - new Date(b.submittedAt || Date.now())
                );
            default:
                return ratings;
        }
    };
    
    // Format the date
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    };
    
    // Generate placeholders if no ratings exist
    const generatePlaceholders = () => {
        return [
            {
                id: 'placeholder-1',
                ux: 8,
                design: 9,
                usability: 7,
                security: 10,
                feedback: "The UI is stunning and very user-friendly. I love how secure it feels!",
                submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
            },
            {
                id: 'placeholder-2',
                ux: 9,
                design: 7,
                usability: 8,
                security: 9,
                feedback: "Great experience overall. The design could be a bit more intuitive in some areas.",
                submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
            },
            {
                id: 'placeholder-3',
                ux: 10,
                design: 10,
                usability: 9,
                security: 8,
                feedback: "Absolutely love the platform! The time capsule concept is amazing and well executed.",
                submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
            }
        ];
    };
    
    // Use real ratings or placeholders if none exist
    const displayRatings = ratings.length > 0 ? getFilteredRatings() : generatePlaceholders();

    if (loading) {
        return <div className="loading">Loading ratings...</div>;
    }

    if (error) {
        return <div className="error-message">Error loading ratings: {error.message}</div>;
    }

    return (
        <div className="ratings-page">
            <div className="ratings-header">
                <h2>User Experience Ratings</h2>
                <p className="subtitle">See what our users think about Memorix</p>
                
                {isLoggedIn && (
                    <div className="ratings-cta">
                        <Link to="/rate-experience" className="rate-now-btn">
                            Rate Your Experience
                        </Link>
                    </div>
                )}
            </div>
            
            <div className="ratings-summary">
                <div className="overall-score">
                    <div className="score-circle">
                        <span className="score-value">{averages.overall || 9.2}</span>
                        <span className="score-max">/10</span>
                    </div>
                    <h3>Overall Rating</h3>
                </div>
                
                <div className="score-breakdown">
                    <div className="score-category">
                        <span className="category-name">UX</span>
                        <div className="score-bar-container">
                            <div 
                                className="score-bar" 
                                style={{ width: `${(averages.ux || 9.0) * 10}%` }}
                            ></div>
                        </div>
                        <span className="category-value">{averages.ux || 9.0}</span>
                    </div>
                    
                    <div className="score-category">
                        <span className="category-name">Design</span>
                        <div className="score-bar-container">
                            <div 
                                className="score-bar" 
                                style={{ width: `${(averages.design || 8.7) * 10}%` }}
                            ></div>
                        </div>
                        <span className="category-value">{averages.design || 8.7}</span>
                    </div>
                    
                    <div className="score-category">
                        <span className="category-name">Usability</span>
                        <div className="score-bar-container">
                            <div 
                                className="score-bar" 
                                style={{ width: `${(averages.usability || 9.5) * 10}%` }}
                            ></div>
                        </div>
                        <span className="category-value">{averages.usability || 9.5}</span>
                    </div>
                    
                    <div className="score-category">
                        <span className="category-name">Security</span>
                        <div className="score-bar-container">
                            <div 
                                className="score-bar" 
                                style={{ width: `${(averages.security || 9.8) * 10}%` }}
                            ></div>
                        </div>
                        <span className="category-value">{averages.security || 9.8}</span>
                    </div>
                </div>
            </div>
            
            <div className="ratings-filter">
                <span>Filter by:</span>
                <div className="filter-options">
                    <button 
                        className={filter === 'all' ? 'active' : ''} 
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button 
                        className={filter === 'highest' ? 'active' : ''} 
                        onClick={() => setFilter('highest')}
                    >
                        Highest
                    </button>
                    <button 
                        className={filter === 'newest' ? 'active' : ''} 
                        onClick={() => setFilter('newest')}
                    >
                        Newest
                    </button>
                    <button 
                        className={filter === 'oldest' ? 'active' : ''} 
                        onClick={() => setFilter('oldest')}
                    >
                        Oldest
                    </button>
                </div>
            </div>
            
            <div className="ratings-list">
                {displayRatings.map(rating => (
                    <div key={rating.id} className="rating">
                        <div className="rating-header">
                            <div className="rating-date">{formatDate(rating.submittedAt)}</div>
                            <div className="rating-score">
                                {((rating.ux + rating.design + rating.usability + rating.security) / 4).toFixed(1)}/10
                            </div>
                        </div>
                        
                        <div className="rating-scores">
                            <div className="rating-score-item">
                                <span className="score-label">UX:</span>
                                <span className="score-value">{rating.ux}/10</span>
                            </div>
                            <div className="rating-score-item">
                                <span className="score-label">Design:</span>
                                <span className="score-value">{rating.design}/10</span>
                            </div>
                            <div className="rating-score-item">
                                <span className="score-label">Usability:</span>
                                <span className="score-value">{rating.usability}/10</span>
                            </div>
                            <div className="rating-score-item">
                                <span className="score-label">Security:</span>
                                <span className="score-value">{rating.security}/10</span>
                            </div>
                        </div>
                        
                        {rating.feedback && (
                            <div className="rating-feedback">
                                <p>"{rating.feedback}"</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {isLoggedIn ? (
                <div className="ratings-footer">
                    <p>Thank you for being part of the Memorix community!</p>
                    <Link to="/rate-experience" className="rate-now-btn">
                        Share Your Feedback
                    </Link>
                </div>
            ) : (
                <div className="ratings-footer">
                    <p>Want to share your experience?</p>
                    <Link to="/login" className="login-to-rate-btn">
                        Log in to Rate
                    </Link>
                </div>
            )}
        </div>
    );
}

export default Ratings;
