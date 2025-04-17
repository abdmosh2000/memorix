import React, { useEffect, useRef } from 'react';

const PayPalButton = ({ 
  planId, 
  amount, 
  currency = 'USD', 
  onSuccess, 
  onError,
  buttonColor = 'gold'
}) => {
  const paypalRef = useRef();

  useEffect(() => {
    // Load the PayPal SDK script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=BAAWwqTo4Fq4CkqrzbMzWWILnNRK1LswEiJ6Y6iRTYLfU71Bw7taxUzVBE23fFjkzKeTeY9IWT6gb1MJtM&currency=${currency}`;
    script.async = true;

    // Initialize PayPal buttons when the SDK is loaded
    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            color: buttonColor,
            shape: 'pill',
            layout: 'vertical'
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
                shipping_preference: 'NO_SHIPPING'
              }
            });
          },
          onApprove: async (data, actions) => {
            // Capture the funds from the transaction
            const order = await actions.order.capture();
            console.log('Payment successful:', order);
            
            // Call the success callback with the order details
            onSuccess({
              orderID: data.orderID,
              subscriptionID: order.id,
              plan: planId,
              details: order
            });
          },
          onError: (err) => {
            console.error('PayPal error:', err);
            onError(err);
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
  }, [amount, currency, onSuccess, onError, planId, buttonColor]);

  return (
    <div ref={paypalRef} className="paypal-button-container"></div>
  );
};

export default PayPalButton;
