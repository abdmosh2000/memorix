import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { updateSubscription } from '../api';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import PayPalButton from '../components/PayPalButton';
import './Pricing.css'

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
            
            // Update subscription in backend
            await updateSubscription({
                plan: paymentDetails.plan,
                orderID: paymentDetails.orderID,
                subscriptionID: paymentDetails.subscriptionID
            });
            
            // Update user in context
            if (user) {
                const updatedUser = await updateUser({
                    ...user,
                    subscription: paymentDetails.plan
                });
            }
            
            // Show success notification
            addNotification(
                `Successfully subscribed to the ${paymentDetails.plan.charAt(0).toUpperCase() + paymentDetails.plan.slice(1)} plan! Enjoy your upgraded features.`,
                NOTIFICATION_TYPES.SYSTEM
            );
            
            // Redirect to dashboard
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
            
        } catch (error) {
            console.error('Error updating subscription:', error);
            setPaymentError('Failed to complete subscription. Please contact support.');
        } finally {
            setIsPaymentProcessing(false);
        }
    };
    
    // Handle payment error
    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        setPaymentError('Payment failed. Please try again or use a different payment method.');
    };
    
    return (
        <div className="pricing-page">
            <h2>Choose Your Perfect Plan</h2>
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
                        <div className="payment-options">
                            <PayPalButton 
                                planId="premium"
                                amount="9.99"
                                currency="USD"
                                buttonColor="blue"
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                            />
                        </div>
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
                        <div className="payment-options">
                            <PayPalButton 
                                planId="vip"
                                amount="24.99"
                                currency="USD"
                                buttonColor="gold"
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                            />
                        </div>
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
