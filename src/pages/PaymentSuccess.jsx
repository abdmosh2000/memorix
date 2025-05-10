import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import SEO from '../components/SEO';
import paymentSuccessSound from '../assets/sounds/pamentsuccess.mp3';
import logoImage from '../assets/logo.png';
import './Pricing.css'; // Reusing the same CSS

function PaymentSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const audioRef = useRef(null);
    
    // Extract the payment details from URL query params
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const paymentId = queryParams.get('paymentId');
        const plan = queryParams.get('plan');
        
        // Play success sound
        if (audioRef.current) {
            audioRef.current.volume = 0.6; // Set appropriate volume
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Show success notification
        if (plan) {
            const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
            addNotification(
                `✨ Your memory journey has been enhanced! ${planName} features are now unlocked for your memories.`,
                NOTIFICATION_TYPES.SYSTEM
            );
        }

        // Add confetti animation (purely visual)
        const confetti = document.getElementById('confetti');
        if (confetti) {
            for (let i = 0; i < 100; i++) {
                const confettiPiece = document.createElement('div');
                confettiPiece.className = 'confetti-piece';
                confettiPiece.style.left = `${Math.random() * 100}%`;
                confettiPiece.style.animationDelay = `${Math.random() * 3}s`;
                confettiPiece.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
                confetti.appendChild(confettiPiece);
            }
        }

        // Clean up the confetti after 5 seconds
        const timeout = setTimeout(() => {
            navigate('/dashboard');
        }, 5000);

        return () => clearTimeout(timeout);
    }, [location.search, navigate]);

    // Navigate to dashboard
    const handleContinue = () => {
        navigate('/dashboard');
    };

    return (
        <div className="payment-result-page">
            <SEO 
                title="Journey Enhanced - Memorix" 
                description="Your memory journey has been enhanced! Enjoy your premium Memorix subscription features."
                keywords="memory journey, subscription confirmed, memorix premium"
                canonical="https://memorix.fun/payment-success"
            />
            {/* Audio element to play success sound */}
            <audio 
                ref={audioRef} 
                src={paymentSuccessSound} 
                preload="auto"
                onError={(e) => {
                    console.warn('Sound file could not be loaded:', e);
                    // Prevent console errors by removing the source
                    e.target.removeAttribute('src');
                }}
            />
            
            <div id="confetti" className="confetti-container"></div>
            <div className="payment-result-card success">
            <div className="result-logo">
                <img src={logoImage} alt="Memorix Logo" className="payment-logo" />
            </div>
            <div className="icon-container">
                <div className="success-checkmark">
                    <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                        <div className="icon-circle"></div>
                        <div className="icon-fix"></div>
                    </div>
                </div>
            </div>
                <h1>✨ Your Memory Journey is Enhanced!</h1>
                <p>Thank you for unlocking deeper memory preservation. Your memories will now have a more beautiful home with premium features.</p>
                <p className="subscription-details">
                    {user?.subscription && (
                        <span>Your Memory Plan: <strong>{user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}</strong></span>
                    )}
                </p>
                <button onClick={handleContinue} className="cta-button large primary">
                    🚀 Continue to Your Memories
                </button>
            </div>
        </div>
    );
}

export default PaymentSuccess;
