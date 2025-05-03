import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import SEO from '../components/SEO';
import './Pricing.css'; // Reusing the same CSS

function PaymentFailed() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Extract error message from URL if present
    const queryParams = new URLSearchParams(location.search);
    const errorMessage = queryParams.get('message') || 'We were unable to process your payment. Please try again.';
    
    // Navigate back to pricing page
    const handleRetry = () => {
        navigate('/pricing');
    };
    
    // Navigate to contact page
    const handleContactSupport = () => {
        navigate('/contact');
    };

    return (
        <div className="payment-result-page">
            <SEO 
                title="Payment Failed - Memorix" 
                description="There was an issue processing your payment. Please try again or contact support for assistance."
                keywords="payment failed, payment error, subscription issue, payment support"
                canonical="https://memorix.fun/payment-failed"
            />
            <div className="payment-result-card failed">
                <div className="icon-container">
                    <div className="error-icon">
                        <span className="error-x"></span>
                        <span className="error-y"></span>
                    </div>
                </div>
                <h1>Payment Failed</h1>
                <p className="error-message">{errorMessage}</p>
                <p>Don't worry! Your account has not been charged. Please try again with a different payment method or contact our support team for assistance.</p>
                
                <div className="action-buttons">
                    <button onClick={handleRetry} className="cta-button primary">
                        Try Again
                    </button>
                    <button onClick={handleContactSupport} className="cta-button secondary">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentFailed;
