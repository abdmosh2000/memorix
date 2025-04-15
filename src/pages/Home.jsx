import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import './Home.css';

function Home() {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [countStats, setCountStats] = useState({ users: 0, capsules: 0, countries: 0 });
    
    // Animated counter effect for statistics
    useEffect(() => {
        const interval = setInterval(() => {
            setCountStats(prev => {
                const newUsers = prev.users < 12500 ? prev.users + 123 : 12567;
                const newCapsules = prev.capsules < 27000 ? prev.capsules + 257 : 27128;
                const newCountries = prev.countries < 47 ? prev.countries + 1 : 48;
                
                if (newUsers === 12567 && newCapsules === 27128 && newCountries === 48) {
                    clearInterval(interval);
                }
                
                return {
                    users: newUsers,
                    capsules: newCapsules, 
                    countries: newCountries
                };
            });
        }, 30);
        
        return () => clearInterval(interval);
    }, []);
    
    const handleCreateCapsule = () => {
        navigate('/create');
    };
    
    return (
        <div className="home-page">
            {/* HERO SECTION */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Memorix: Your Digital Memory Capsule</h1>
                    <p className="hero-tagline">Preserve moments in time. Share when you're ready.</p>
                    <p className="hero-description">Store future memories and personal messages that open after a specific time, creating a bridge between past and future you.</p>
                    
                    <div className="hero-cta">
                        {isLoggedIn ? (
                            <button onClick={handleCreateCapsule} className="cta-button">Create Capsule</button>
                        ) : (
                            <>
                                <Link to="/register" className="cta-button primary">Join Now</Link>
                                <Link to="/public" className="cta-button secondary">Explore Capsules</Link>
                            </>
                        )}
                    </div>
                </div>
                
                <div className="hero-visual">
                    <div className="capsule-preview-container">
                        <div className="capsule-preview">
                            <div className="capsule-glow"></div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* STATS COUNTER SECTION */}
            <section className="stats-counter">
                <div className="stat-item">
                    <div className="stat-value">{countStats.users.toLocaleString()}+</div>
                    <div className="stat-label">Users Worldwide</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{countStats.capsules.toLocaleString()}+</div>
                    <div className="stat-label">Memories Preserved</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{countStats.countries}+</div>
                    <div className="stat-label">Countries Reached</div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="features">
                <h2>Powerful Features</h2>
                <p className="section-subtitle">Everything you need to preserve memories for the future</p>
                
                <div className="features-grid">
                    <div className="feature-card">
                        <span className="feature-icon">🔒</span>
                        <h3>Privacy First</h3>
                        <p>Create private or public memory capsules with full control over visibility.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">⏳</span>
                        <h3>Time Release</h3>
                        <p>Schedule release dates and surprise your future self or loved ones.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🌍</span>
                        <h3>Global Access</h3>
                        <p>Multi-language support for a worldwide experience with dynamic interface.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🔐</span>
                        <h3>Military Encryption</h3>
                        <p>End-to-end encryption ensures your memories stay safe and private forever.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🎁</span>
                        <h3>Digital Legacy</h3>
                        <p>Leave behind messages, gifts, and thoughts for future generations to discover.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">📱</span>
                        <h3>Multi-Device</h3>
                        <p>Access your capsules from any device with our responsive platform.</p>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className="how-it-works">
                <h2>How Memorix Works</h2>
                <p className="section-subtitle">Three simple steps to create your time capsule</p>
                
                <div className="steps-container">
                    <div className="steps-visual"></div>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Create a Capsule</h3>
                                <p>Write your memory, upload photos, videos, or audio and set a future release date.</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Customize Privacy</h3>
                                <p>Choose to make your capsule public, private, or shared with specific people.</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Time-Release Magic</h3>
                                <p>Once the scheduled time arrives, your capsule unlocks automatically and notifies recipients.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="steps-cta">
                    {isLoggedIn ? (
                        <button onClick={handleCreateCapsule} className="cta-button medium">Create Your First Capsule</button>
                    ) : (
                        <Link to="/register" className="cta-button medium">Get Started Now</Link>
                    )}
                </div>
            </section>
            
            {/* USE CASES SECTION */}
            <section className="use-cases">
                <h2>Perfect For Every Occasion</h2>
                <p className="section-subtitle">Discover creative ways to use Memorix</p>
                
                <div className="use-cases-grid">
                    <div className="use-case-card">
                        <div className="use-case-icon">🎂</div>
                        <h3>Birthday Surprises</h3>
                        <p>Schedule special messages to loved ones for milestone birthdays years in advance.</p>
                    </div>
                    <div className="use-case-card">
                        <div className="use-case-icon">👶</div>
                        <h3>Messages to Children</h3>
                        <p>Create a series of capsules for your children to open as they grow up.</p>
                    </div>
                    <div className="use-case-card">
                        <div className="use-case-icon">💑</div>
                        <h3>Anniversary Memories</h3>
                        <p>Capture the magic of your wedding day to revisit on future anniversaries.</p>
                    </div>
                    <div className="use-case-card">
                        <div className="use-case-icon">🎓</div>
                        <h3>Graduation Advice</h3>
                        <p>Leave wisdom for future graduates that they'll receive at the right time.</p>
                    </div>
                </div>
            </section>

            {/* TESTIMONIAL SECTION */}
            <section className="testimonial-preview">
                <h2>What Our Users Say</h2>
                <p className="section-subtitle">Join thousands of satisfied memory keepers</p>
                
                <div className="testimonials-grid">
                    <div className="testimonial-box">
                        <div className="testimonial-rating">★★★★★</div>
                        <p>"Memorix helped me send a message to my future self — opening it 5 years later was truly mind-blowing!"</p>
                        <div className="testimonial-author">
                            <div className="author-image"><span>L</span></div>
                            <span>Layla M., Digital Nomad</span>
                        </div>
                    </div>
                    <div className="testimonial-box featured">
                        <div className="testimonial-rating">★★★★★</div>
                        <p>"The UI is stunning and the concept is genius. Memorix is the future of digital memory preservation. I've recommended it to everyone I know."</p>
                        <div className="testimonial-author">
                            <div className="author-image"><span>O</span></div>
                            <span>Omar H., UX Designer</span>
                        </div>
                    </div>
                    <div className="testimonial-box">
                        <div className="testimonial-rating">★★★★★</div>
                        <p>"I created a capsule for my newborn daughter to open in 18 years. The thought that she'll see our messages from the past gives me goosebumps."</p>
                        <div className="testimonial-author">
                            <div className="author-image"><span>S</span></div>
                            <span>Sarah K., Mother & Teacher</span>
                        </div>
                    </div>
                </div>
                
                <div className="testimonial-cta">
                    <Link to="/testimonials" className="text-link">Read more testimonials →</Link>
                </div>
            </section>

            {/* RATINGS SHOWCASE */}
            <section className="ratings-showcase">
                <h2>Highly Rated By Users</h2>
                <p className="section-subtitle">See why users love our experience</p>
                
                <div className="ratings-summary">
                    <div className="overall-rating">
                        <div className="rating-number">4.9</div>
                        <div className="rating-stars">★★★★★</div>
                        <div className="rating-count">Based on 2,450+ reviews</div>
                    </div>
                    
                    <div className="rating-categories">
                        <div className="rating-category">
                            <span>User Experience</span>
                            <div className="rating-bar">
                                <div className="rating-fill" style={{ width: "98%" }}></div>
                            </div>
                            <span>4.9/5</span>
                        </div>
                        <div className="rating-category">
                            <span>Ease of Use</span>
                            <div className="rating-bar">
                                <div className="rating-fill" style={{ width: "95%" }}></div>
                            </div>
                            <span>4.8/5</span>
                        </div>
                        <div className="rating-category">
                            <span>Security</span>
                            <div className="rating-bar">
                                <div className="rating-fill" style={{ width: "97%" }}></div>
                            </div>
                            <span>4.9/5</span>
                        </div>
                    </div>
                </div>
                
                <div className="ratings-cta">
                    <Link to="/ratings" className="cta-button secondary">View All Ratings</Link>
                </div>
            </section>

            {/* CALL TO ACTION AGAIN */}
            <section className="cta-final">
                <h2>Ready to preserve your memories?</h2>
                <p>Join thousands of users creating time capsules for the future</p>
                
                {isLoggedIn ? (
                    <button onClick={handleCreateCapsule} className="cta-button large">Create Your Memory Capsule</button>
                ) : (
                    <div className="cta-buttons">
                        <Link to="/register" className="cta-button large primary">Start Your Journey</Link>
                        <Link to="/about" className="cta-button large secondary">Learn More</Link>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;
