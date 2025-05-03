import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import SEO from '../components/SEO';
import './Pricing.css'; // Reusing the same CSS

function PaymentSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    // Extract the payment details from URL query params
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const paymentId = queryParams.get('paymentId');
        const plan = queryParams.get('plan');
        
        // Show success notification
        if (plan) {
            const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
            addNotification(
                `Successfully subscribed to the ${planName} plan! Enjoy your upgraded features.`,
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
                title="Payment Successful - Memorix" 
                description="Your payment has been processed successfully. Enjoy your premium Memorix subscription features."
                keywords="payment success, subscription confirmed, memorix premium"
                canonical="https://memorix.fun/payment-success"
            />
            <div id="confetti" className="confetti-container"></div>
            <div className="payment-result-card success">
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
                <h1>Payment Successful!</h1>
                <p>Thank you for your subscription. Your account has been upgraded and you now have access to all premium features.</p>
                <p className="subscription-details">
                    {user?.subscription && (
                        <span>Current Plan: <strong>{user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}</strong></span>
                    )}
                </p>
                <button onClick={handleContinue} className="cta-button large primary">
                    Continue to Dashboard
                </button>
            </div>
        </div>
    );
}

export default PaymentSuccess;
