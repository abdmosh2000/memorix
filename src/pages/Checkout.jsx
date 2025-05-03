import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import PayPalButton from '../components/PayPalButton';
import SEO from '../components/SEO';
import './Checkout.css';

function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [paymentError, setPaymentError] = useState(null);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    
    // Get plan details from URL params
    const queryParams = new URLSearchParams(location.search);
    const selectedPlan = queryParams.get('plan');
    
    // Redirect to pricing if no plan is selected
    useEffect(() => {
        if (!selectedPlan) {
            navigate('/pricing');
        }
    }, [selectedPlan, navigate]);
    
    // Plan details
    const plans = {
        premium: {
            name: 'Premium',
            price: '9.99',
            color: '#3498DB',
            features: [
                '50 Memory Capsules',
                'Enhanced media quality',
                '1-year storage',
                'Share with unlimited recipients',
                'Custom release dates',
                'Priority support'
            ]
        },
        vip: {
            name: 'VIP',
            price: '24.99',
            color: '#9B59B6',
            features: [
                'Unlimited Memory Capsules',
                'Maximum media quality',
                'Lifetime storage',
                'Share with unlimited recipients',
                'Advanced privacy features',
                '24/7 VIP support'
            ]
        }
    };
    
    // Get current plan details
    const currentPlan = selectedPlan ? plans[selectedPlan] : null;
    
    // Handle payment success
    const handlePaymentSuccess = async (paymentDetails) => {
        try {
            setIsPaymentProcessing(true);
            setPaymentError(null);
            
            // PayPalButton component handles the actual API calls and redirection
            console.log('Payment successful:', paymentDetails);
        } catch (error) {
            console.error('Error handling payment success:', error);
            setPaymentError('Something went wrong after payment. Your account will be updated shortly.');
            setIsPaymentProcessing(false);
        }
    };
    
    // Handle payment error 
    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        setPaymentError('Payment failed. Please try again or use a different payment method.');
        setIsPaymentProcessing(false);
    };
    
    // Go back to pricing page
    const handleBack = () => {
        navigate('/pricing');
    };
    
    if (!currentPlan) {
        return <div className="loading-container"><div className="loading-spinner"></div></div>;
    }
    
    return (
        <div className="checkout-page">
            <SEO 
                title={`Checkout - ${currentPlan.name} Plan - Memorix`}
                description="Complete your subscription purchase for Memorix's premium services."
                keywords="checkout, payment, subscription, memorix premium"
                canonical={`https://memorix.fun/checkout?plan=${selectedPlan}`}
            />
            
            <div className="checkout-container">
                <div className="checkout-header">
                    <button className="back-button" onClick={handleBack}>← Back to Plans</button>
                    <h1>Complete Your Purchase</h1>
                </div>
                
                <div className="checkout-layout">
                    <div className="checkout-details">
                        <div className="plan-summary">
                            <div className="plan-header" style={{ backgroundColor: currentPlan.color }}>
                                <img src="/logo.png" alt="Memorix Logo" className="checkout-logo" />
                                <h2>{currentPlan.name} Plan</h2>
                            </div>
                            
                            <div className="plan-price">
                                <span className="amount">${currentPlan.price}</span>
                                <span className="period">per month</span>
                            </div>
                            
                            <ul className="plan-features">
                                {currentPlan.features.map((feature, index) => (
                                    <li key={index}>✓ {feature}</li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>{currentPlan.name} subscription</span>
                                <span>${currentPlan.price}</span>
                            </div>
                            <div className="summary-row">
                                <span>Taxes & Fees</span>
                                <span>$0.00</span>
                            </div>
                            <div className="summary-total">
                                <span>Total (billed monthly)</span>
                                <span>${currentPlan.price}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="payment-section">
                        <h3>Payment Method</h3>
                        
                        <div className="payment-methods">
                            <div className="payment-option">
                                <p className="payment-label">Pay with PayPal or Card:</p>
                                
                                <div className="payment-container">
                                    {isPaymentProcessing ? (
                                        <div className="payment-processing">
                                            <div className="loading-spinner"></div>
                                            <p>Processing your payment...</p>
                                        </div>
                                    ) : (
                                        <PayPalButton 
                                            planId={selectedPlan}
                                            amount={currentPlan.price}
                                            currency="USD"
                                            buttonColor="blue"
                                            onSuccess={handlePaymentSuccess}
                                            onError={handlePaymentError}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {paymentError && (
                            <div className="payment-error">
                                <p>⚠️ {paymentError}</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="checkout-footer">
                    <div className="security-note">
                        <span className="security-icon">🔒</span>
                        <p>Secure payment processing. Your payment information is encrypted and secure.</p>
                    </div>
                    
                    <p className="terms-note">
                        By completing your purchase, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>. 
                        You can cancel your subscription at any time from your account settings.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
