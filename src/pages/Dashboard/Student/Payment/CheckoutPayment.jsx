import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import useUser from "../../../../hooks/useUser";

const CheckoutPayment = ({ price, cartItems, itemId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const axiosSecure = useAxiosSecure();
  const { currentUser, isLoading } = useUser();
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  if (price <= 0 || !price) {
    return <Navigate to="/dashboard/my-selected" replace />;
  }

  useEffect(() => {
    console.log('💳 [Payment Init] Creating payment intent with price:', price);
    console.log('🔐 Token:', localStorage.getItem('token') ? '✅ Exists' : '❌ Missing');
    
    axiosSecure.post('/create-payment-intent', { price: price })
      .then(res => {
        console.log('✅ ClientSecret response:', res.data);
        
        // ✅ FIX: Handle nested response format
        // Backend mungkin return {clientSecret: "..."} atau {success: true, data: {clientSecret: "..."}}
        const secret = res.data?.clientSecret || res.data?.data?.clientSecret;
        console.log('🔑 Extracted clientSecret:', secret);
        
        if (secret) {
          setClientSecret(secret);
          setMessage('');
          console.log('✅ ClientSecret set successfully');
        } else {
          console.error('❌ ClientSecret not found in response:', res.data);
          setMessage('❌ Gagal mendapatkan payment secret dari server');
        }
      })
      .catch(err => {
        console.error('❌ Error creating payment intent:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          error: err.message,
          data: err.response?.data
        });
        setMessage("❌ Gagal membuat sesi pembayaran: " + (err.response?.data?.error || err.message));
      });
  }, [price, axiosSecure]);

  // ✅ DEBUG: Monitor button state
  useEffect(() => {
    const isDisabled = processing || !stripe || !clientSecret;
    console.log('🔘 Button State:', {
      processing,
      stripe: !!stripe,
      clientSecret: !!clientSecret,
      buttonDisabled: isDisabled
    });
  }, [processing, stripe, clientSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setProcessing(true);
    
    console.log('🔄 [Payment Submit] Starting payment process...');
    
    if (!stripe || !elements) {
      console.error('❌ Stripe or Elements not initialized');
      setMessage("Sistem pembayaran belum siap");
      setProcessing(false);
      return;
    }
    
    const card = elements.getElement(CardElement);
    if (!card) {
      console.error('❌ CardElement not found');
      setMessage("Form kartu tidak ditemukan");
      setProcessing(false);
      return;
    }

    try {
      console.log('📤 Creating payment method...');
      
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card,
      });
      
      if (paymentMethodError) {
        console.error('❌ Payment method error:', paymentMethodError);
        setMessage(paymentMethodError.message);
        setProcessing(false);
        return;
      }

      console.log('✅ Payment method created:', paymentMethod.id);
      console.log('📤 Confirming card payment with clientSecret:', clientSecret);

      // Confirm card payment
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (confirmError) {
        console.error('❌ Confirm payment error:', confirmError);
        setMessage(confirmError.message);
        setProcessing(false);
        return;
      }
      
      console.log('✅ Payment intent:', paymentIntent);
      
      if (paymentIntent.status === "succeeded") {
        console.log('💰 Payment succeeded! Saving to database...');
        
        const paymentData = {
          transactionId: paymentIntent.id,
          paymentMethod: paymentIntent.payment_method_types[0],
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          paymentStatus: paymentIntent.status,
          userName: currentUser?.name,
          userEmail: currentUser?.email,
          classesId: cartItems && cartItems.length > 0 ? cartItems : [itemId],
          date: new Date()
        };

        console.log('📊 Payment data to save:', paymentData);

        // Tentukan config berdasarkan jenis pembayaran
        const config = cartItems && cartItems.length > 0 
          ? {} 
          : { params: { classId: itemId } };
        
        try {
          const response = await axiosSecure.post('/payment-info', paymentData, config);
          console.log('✅ Server response:', response.data);
          
          if (response.data.success) {
            setSucceeded('✅ Pembayaran berhasil! Mengarahkan ke kelas...');
            setTimeout(() => {
              navigate('/dashboard/enrolled-class');
            }, 2000);
          } else {
            console.error('❌ Server returned error:', response.data);
            setMessage('Pembayaran berhasil tapi gagal menyimpan: ' + response.data.message);
          }
        } catch (serverErr) {
          console.error('❌ Server error saving payment:', {
            status: serverErr.response?.status,
            data: serverErr.response?.data,
            message: serverErr.message
          });
          setMessage('Error menyimpan pembayaran: ' + (serverErr.response?.data?.message || serverErr.message));
        }
      } else {
        console.warn('⚠️ Payment status:', paymentIntent.status);
        setMessage('Status pembayaran: ' + paymentIntent.status);
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setMessage('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <p>Memuat informasi pembayaran...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Pembayaran Kelas
        </h1>
        <p className="text-lg text-secondary font-semibold mt-2">
          Rp{(price * 15000).toLocaleString('id-ID')}
        </p>
        <p className="text-gray-600 mt-2">
          {cartItems && cartItems.length > 1 
            ? `Untuk ${cartItems.length} kelas` 
            : 'Untuk 1 kelas'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border rounded-lg p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={processing || !stripe || !clientSecret}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? "Memproses..." : "Bayar Sekarang"}
        </button>

        {message && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {message}
          </div>
        )}
        
        {succeeded && (
          <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {succeeded}
          </div>
        )}

        {!clientSecret && (
          <div className="p-3 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
            ⏳ Menyiapkan pembayaran...
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Pembayaran diproses secara aman melalui Stripe
        </div>
      </form>
    </div>
  );
};

export default CheckoutPayment;