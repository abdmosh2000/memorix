import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
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
    
    const handleSubscribe = async (plan) => {
        // In a real application, this would integrate with a payment processor
        // For now, we'll just update the user's subscription level
        try {
            if (user) {
                // Simulate upgrading subscription
                alert(`Subscribed to ${plan} plan successfully!`);
                
                // In a real app, you would update the user after payment is processed
                // For demo purposes, we'll update it directly
                const updatedUser = await updateUser({
                    ...user,
                    subscription: plan
                });
                
                // Redirect to dashboard
                navigate('/dashboard');
            } else {
                // If not logged in, redirect to registration
                navigate('/register');
            }
        } catch (error) {
            console.error('Error subscribing to plan:', error);
            alert('Failed to subscribe. Please try again.');
        }
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
                    <button 
                        className={`featured-button ${user?.subscription === 'premium' ? 'current-plan' : ''}`}
                        onClick={() => user?.subscription === 'premium' ? null : handleSubscribe('premium')}
                        disabled={user?.subscription === 'premium'}
                    >
                        {user?.subscription === 'premium' ? 'Current Plan' : 'Subscribe Now'}
                    </button>
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
                    <button 
                        className={user?.subscription === 'vip' ? 'current-plan' : ''}
                        onClick={() => user?.subscription === 'vip' ? null : handleSubscribe('vip')}
                        disabled={user?.subscription === 'vip'}
                    >
                        {user?.subscription === 'vip' ? 'Current Plan' : 'Get VIP Access'}
                    </button>
                </div>
            </div>
            
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
