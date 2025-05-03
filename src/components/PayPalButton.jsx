import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateSubscription } from '../api';
import { useAuth } from '../auth';
import config from '../config';

const PayPalButton = ({ 
  planId, 
  amount, 
  currency = config.payments.paypal.currency || 'USD', 
  onSuccess, 
  onError,
  buttonColor = 'gold'
}) => {
  const paypalRef = useRef();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Load the PayPal SDK script with the correct client ID
    const script = document.createElement('script');
    // Use sandbox in development, production client ID in production
    const clientId = isDevelopment 
      ? config.payments.paypal.clientIdSandbox 
      : config.payments.paypal.clientId;
      
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.async = true;

    // Initialize PayPal buttons when the SDK is loaded
    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            color: buttonColor,
            shape: 'pill',
            layout: 'vertical',
            label: 'pay'
          },
          createOrder: (data, actions) => {
            // Create the order for a one-time payment
            return actions.order.create({
              purchase_units: [
                {
                  description: `Memorix ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
                  amount: {
                    currency_code: currency,
                    value: amount
                  }
                }
              ],
              application_context: {
                shipping_preference: 'NO_SHIPPING',
                user_action: 'CONTINUE',
                return_url: `${window.location.origin}${config.payments.paypal.redirectUrls.success}?plan=${planId}`,
                cancel_url: `${window.location.origin}${config.payments.paypal.redirectUrls.cancel}`
              }
            });
          },
          onApprove: async (data, actions) => {
            try {
              // Capture the funds from the transaction
              const order = await actions.order.capture();
              console.log('Payment successful:', order);
              
              // Update subscription in backend
              await updateSubscription({
                plan: planId,
                orderID: data.orderID,
                subscriptionID: order.id
              });
              
              // Update user in context if we have user data
              if (user) {
                const updatedUser = await updateUser({
                  ...user,
                  subscription: planId
                });
              }
              
              // Call the success callback with the order details
              onSuccess({
                orderID: data.orderID,
                subscriptionID: order.id,
                plan: planId,
                details: order
              });
              
              // Redirect to success page
              navigate(`${config.payments.paypal.redirectUrls.success}?paymentId=${data.orderID}&plan=${planId}`);
            } catch (error) {
              console.error('Error processing payment:', error);
              navigate(`${config.payments.paypal.redirectUrls.failed}?message=${encodeURIComponent('Payment was approved, but we encountered an issue updating your account.')}`);
            }
          },
          onError: (err) => {
            console.error('PayPal error:', err);
            onError(err);
            navigate(`${config.payments.paypal.redirectUrls.failed}?message=${encodeURIComponent(err.message || 'We encountered an error processing your payment')}`);
          },
          onCancel: () => {
            console.log('Payment cancelled by user');
            onError({ message: 'Payment was cancelled. Please try again when you are ready.' });
            navigate(config.payments.paypal.redirectUrls.cancel);
          }
        }).render(paypalRef.current);
      }
    };

    // Add the script to the DOM
    document.body.appendChild(script);

    // Clean up the script when the component unmounts
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [amount, currency, onSuccess, onError, planId, buttonColor, isDevelopment]);

  return (
    <div ref={paypalRef} className="paypal-button-container"></div>
  );
};

export default PayPalButton;
