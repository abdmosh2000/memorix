import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { updateSubscription } from '../api';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import SEO from '../components/SEO';
import PayPalButton from '../components/PayPalButton';
import './Pricing.css';

function Pricing() {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    
    // Set the initial selected plan based on user's current subscription
    useEffect(() => {
        if (user && user.subscription) {
            setSelectedPlan(user.subscription);
        }
    }, [user]);
    
    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
    };
    
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    
    // Handle payment success
    const handlePaymentSuccess = async (paymentDetails) => {
        try {
            setIsPaymentProcessing(true);
            setPaymentError(null);
            
            console.log('Payment successful:', paymentDetails);
            
            // Show a brief success notification before redirecting
            addNotification(
                `Payment successful! Processing your subscription...`,
                NOTIFICATION_TYPES.SYSTEM
            );
            
            // Note: The actual subscription update and user update are now handled in PayPalButton component
            // This event handler is still used for in-page notifications and state management
            
        } catch (error) {
            console.error('Error handling payment success:', error);
            setPaymentError('Something went wrong after payment. Your account will be updated shortly.');
        }
    };
    
    // Handle payment error 
    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        
        // Show a notification about the payment failure
        addNotification(
            `Payment processing failed. ${error.message || 'Please try again later.'}`,
            NOTIFICATION_TYPES.ERROR
        );
        
        setPaymentError('Payment failed. Please try again or use a different payment method.');
    };
    
    return (
        <div className="pricing-page">
            <SEO 
                title="Memorix Pricing - Choose Your Perfect Plan" 
                description="Explore Memorix subscription plans including Free, Premium, and VIP options. Store digital time capsules securely with flexible pricing starting at $0/month."
                keywords="memorix pricing, time capsule pricing, digital memory storage plans, memory preservation subscription"
                canonical="https://memorix.fun/pricing"
            />
            <h1>Choose Your Perfect Plan</h1>
            <p className="pricing-subtitle">Unlock the full potential of your memories with our flexible subscription options</p>
            
            <div className="pricing-table">
                <div className={`plan ${selectedPlan === 'free' ? 'selected' : ''}`}>
                    <div className="plan-header">
                        <h3>Free</h3>
                        <p className="price">$0</p>
                        <p className="billing-cycle">Forever</p>
                    </div>
                    <div className="plan-features">
                        <ul>
                            <li>✅ 1 Memory Capsule</li>
                            <li>✅ Basic media support</li>
                            <li>✅ 30-day storage</li>
                            <li>✅ Share with up to 3 recipients</li>
                            <li>❌ Custom release dates</li>
                            <li>❌ Premium support</li>
                        </ul>
                    </div>
                    <button 
                        className={user?.subscription === 'free' ? 'current-plan' : ''}
                        onClick={() => handleSelectPlan('free')}
                        disabled={user?.subscription === 'free'}
                    >
                        {user?.subscription === 'free' ? 'Current Plan' : 'Select'}
                    </button>
                </div>
                
                <div className={`plan ${selectedPlan === 'premium' ? 'selected' : ''} featured-plan`}>
                    <div className="plan-badge">Most Popular</div>
                    <div className="plan-header">
                        <h3>Premium</h3>
                        <p className="price">$9.99</p>
                        <p className="billing-cycle">per month</p>
                    </div>
                    <div className="plan-features">
                        <ul>
                            <li>✅ 50 Memory Capsules</li>
                            <li>✅ Enhanced media quality</li>
                            <li>✅ 1-year storage</li>
                            <li>✅ Share with unlimited recipients</li>
                            <li>✅ Custom release dates</li>
                            <li>✅ Priority support</li>
                        </ul>
                    </div>
                    {user?.subscription === 'premium' ? (
                        <button className="featured-button current-plan">Current Plan</button>
                    ) : (
                        <button 
                            className="featured-button"
                            onClick={() => navigate('/checkout?plan=premium')}
                        >
                            Subscribe
                        </button>
                    )}
                </div>
                
                <div className={`plan ${selectedPlan === 'vip' ? 'selected' : ''}`}>
                    <div className="plan-header">
                        <h3>VIP</h3>
                        <p className="price">$24.99</p>
                        <p className="billing-cycle">per month</p>
                    </div>
                    <div className="plan-features">
                        <ul>
                            <li>✅ Unlimited Memory Capsules</li>
                            <li>✅ Maximum media quality</li>
                            <li>✅ Lifetime storage</li>
                            <li>✅ Share with unlimited recipients</li>
                            <li>✅ Advanced privacy features</li>
                            <li>✅ 24/7 VIP support</li>
                        </ul>
                    </div>
                    {user?.subscription === 'vip' ? (
                        <button className="current-plan">Current Plan</button>
                    ) : (
                        <button 
                            className="vip-button"
                            onClick={() => navigate('/checkout?plan=vip')}
                        >
                            Subscribe
                        </button>
                    )}
                </div>
            </div>
            
            {isPaymentProcessing && (
                <div className="payment-processing">
                    <div className="loading-spinner"></div>
                    <p>Processing your payment...</p>
                </div>
            )}
            
            {paymentError && (
                <div className="payment-error">
                    <p>⚠️ {paymentError}</p>
                </div>
            )}
            
            <div className="pricing-guarantee">
                <h4>100% Satisfaction Guarantee</h4>
                <p>Try any paid plan risk-free for 14 days. If you're not completely satisfied, let us know and we'll refund your payment.</p>
            </div>
            
            <div className="pricing-faq">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-item">
                    <h4>Can I change my plan later?</h4>
                    <p>Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
                </div>
                <div className="faq-item">
                    <h4>How secure are my memories?</h4>
                    <p>All capsules are encrypted using industry-leading standards. Your memories are safe with us.</p>
                </div>
                <div className="faq-item">
                    <h4>What payment methods do you accept?</h4>
                    <p>We accept all major credit cards, PayPal, and selected cryptocurrency options.</p>
                </div>
            </div>
        </div>
    );
}

export default Pricing;
