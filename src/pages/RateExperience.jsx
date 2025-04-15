import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import './Rating.css'; // We'll use the same CSS as the Ratings page

function RateExperience() {
    const [ratings, setRatings] = useState({
        ux: 5,
        design: 5,
        usability: 5,
        security: 5,
        feedback: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Extract capsule info from URL parameters
    const queryParams = new URLSearchParams(location.search);
    const capsuleId = queryParams.get('capsuleId');
    const title = queryParams.get('title');
    
    const handleRatingChange = (category, value) => {
        setRatings(prev => ({
            ...prev,
            [category]: parseInt(value)
        }));
    };
    
    const handleFeedbackChange = (e) => {
        setRatings(prev => ({
            ...prev,
            feedback: e.target.value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Prepare rating data - only include the fields the API expects
            const ratingData = {
                ux: ratings.ux,
                design: ratings.design,
                usability: ratings.usability,
                security: ratings.security,
                feedback: ratings.feedback || ''
            };
            
            console.log('Submitting rating data:', ratingData);
            
            // Use the authTokens correctly
            const storedTokens = localStorage.getItem('authTokens');
            const token = storedTokens ? JSON.parse(storedTokens) : null;
            
            if (!token) {
                throw new Error('Authentication token not found');
            }
            
            // Call API to submit rating
            const response = await fetch('http://localhost:5000/api/ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ratingData)
            });
            
            // Handle non-JSON responses
            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const textData = await response.text();
                console.error('Received non-JSON response:', textData);
                responseData = { message: textData || 'Server returned an unexpected response' };
            }
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to submit rating');
            }
            
            console.log('Rating submission successful:', responseData);
            
            // Set success and navigate after a delay
            setSuccess(true);
            setTimeout(() => {
                navigate('/ratings');
            }, 2000);
            
        } catch (err) {
            setError(err.message || 'An error occurred while submitting your rating');
            console.error('Error submitting rating:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const renderRatingSlider = (category, label) => {
        return (
            <div className="rating-item">
                <label htmlFor={category}>
                    {label}: {ratings[category]}
                </label>
                <div className="rating-slider-container">
                    <input 
                        type="range" 
                        id={category}
                        min="1" 
                        max="10" 
                        value={ratings[category]} 
                        onChange={(e) => handleRatingChange(category, e.target.value)}
                        className="rating-slider"
                    />
                    <div className="rating-scale">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="rate-experience-page">
            <div className="rating-form-container">
                <h2>Rate Your Experience</h2>
                <p className="subtitle">Thank you for creating a capsule! Please take a moment to rate your experience.</p>
                
                {capsuleId && title && (
                    <div className="capsule-info">
                        <h3>Capsule: "{decodeURIComponent(title)}"</h3>
                        <p>Your feedback helps us improve the Memorix platform.</p>
                    </div>
                )}
                
                {success ? (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h3>Thank you for your feedback!</h3>
                        <p>Redirecting to ratings page...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="rating-form">
                        {renderRatingSlider('ux', 'User Experience')}
                        {renderRatingSlider('design', 'Visual Design')}
                        {renderRatingSlider('usability', 'Ease of Use')}
                        {renderRatingSlider('security', 'Security & Privacy')}
                        
                        <div className="rating-item">
                            <label htmlFor="feedback">Additional Feedback:</label>
                            <textarea
                                id="feedback"
                                value={ratings.feedback}
                                onChange={handleFeedbackChange}
                                placeholder="Share your thoughts, suggestions, or report any issues..."
                                rows="4"
                            />
                        </div>
                        
                        {error && <div className="error-message">{error}</div>}
                        
                        <div className="rating-actions">
                            <button type="button" onClick={() => navigate('/dashboard')} className="skip-btn">
                                Skip
                            </button>
                            <button type="submit" disabled={loading} className="submit-btn">
                                {loading ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default RateExperience;
