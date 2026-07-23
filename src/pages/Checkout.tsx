import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Truck, MessageSquare, Phone, Mail, User, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import CheckoutForm from '../components/CheckoutForm';

// Initialize Stripe outside of component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
  });

  const [message, setMessage] = useState<string | null>(null);

  // Check for payment result if redirected back from Stripe
  React.useEffect(() => {
    const checkPaymentStatus = async () => {
      const clientSecretParam = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
      );

      if (clientSecretParam) {
        setClientSecret(clientSecretParam);
        setShowPayment(true);
        
        const stripe = await stripePromise;
        if (stripe) {
          const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecretParam);
          if (paymentIntent?.status === 'succeeded') {
            const savedData = localStorage.getItem('checkout_form_data');
            if (savedData) {
              setFormData(JSON.parse(savedData));
            }
            handlePaymentSuccess();
          } else if (paymentIntent?.status === 'processing') {
            setMessage("Your payment is processing.");
          } else if (paymentIntent?.status === 'requires_payment_method') {
            setError("Your payment was not successful, please try again.");
          }
        }
      }
    };

    checkPaymentStatus();
  }, []);

  // Save form data to localStorage before redirect
  React.useEffect(() => {
    localStorage.setItem('checkout_form_data', JSON.stringify(formData));
  }, [formData]);

  // Scroll to top when success state changes
  React.useEffect(() => {
    if (isSuccess) {
      window.scrollTo(0, 0);
    }
  }, [isSuccess]);

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Your cart is empty</h1>
        <Link to="/menu" className="px-8 py-3 bg-orange-600 text-white rounded-full font-bold">
          Go to Menu
        </Link>
      </div>
    );
  }

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create Payment Intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: totalPrice,
          currency: 'cad',
          receipt_email: formData.email 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      setClientSecret(data.clientSecret);
      setShowPayment(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsSubmitting(true);
    try {
      // Once payment is successful, send order details to admin
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: cart,
          total: totalPrice,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit order notification');

      setIsSuccess(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (err) {
      setError('Payment successful, but failed to notify admin. Our team will contact you.');
      // Still show success to user since payment went through
      setIsSuccess(true);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center space-y-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Order Placed!</h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            Thank you for your order, {formData.name}. We've sent the details to our kitchen. 
            An admin has been notified.
          </p>
        </div>
        <div className="space-y-4">
          <Link to="/" className="inline-block px-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all">
            Return Home
          </Link>
          <p className="text-sm text-gray-400">Redirecting to homepage in a few seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-6 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Checkout Form */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Link to="/menu" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="space-y-6">
            <div className={`bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6 transition-opacity duration-300 ${showPayment ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                Customer Information
              </h2>
              
              <form onSubmit={handleSubmitInfo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        required
                        type="text"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        required
                        type="email"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        required
                        type="tel"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">WhatsApp (Optional)</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        placeholder="+1 (555) 000-0000"
                        value={formData.whatsapp}
                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                  <div className="relative">
                    <Truck className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <textarea
                      required
                      rows={3}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="Street, City, State, Zip Code"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                {!showPayment && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Continue to Payment'}
                  </button>
                )}
              </form>
            </div>

            <AnimatePresence>
              {showPayment && clientSecret && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowPayment(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
                  >
                    <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-orange-600" />
                            Payment Details
                          </h2>
                          <p className="text-sm text-gray-500">Enter your secure payment information</p>
                        </div>
                        <button 
                          onClick={() => setShowPayment(false)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="text-xl font-bold text-orange-600">${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                        <CheckoutForm 
                          onSuccess={handlePaymentSuccess} 
                          totalAmount={totalPrice} 
                          email={formData.email}
                          name={formData.name}
                          address={formData.address}
                          clientSecret={clientSecret}
                        />
                      </Elements>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-32 h-fit space-y-8">
          <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-2xl font-bold">Order Summary</h2>
            <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-4 border-b border-gray-800 last:border-0">
                  <div className="space-y-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery</span>
                <span className="text-green-500 font-medium">FREE</span>
              </div>
              <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-2xl font-bold">
                <span>Total</span>
                <span className="text-orange-500">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Secure Checkout</p>
              <p className="text-sm text-gray-500">Your details are protected with bank-level security.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
