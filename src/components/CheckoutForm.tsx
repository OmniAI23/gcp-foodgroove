import React, { useState } from 'react';
import { 
  useStripe, 
  useElements, 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement 
} from '@stripe/react-stripe-js';
import { Loader2, AlertCircle, User, CreditCard, Calendar, Lock, Mail, MapPin } from 'lucide-react';

interface CheckoutFormProps {
  onSuccess: () => void;
  totalAmount: number;
  email: string;
  name: string;
  address: string;
  clientSecret: string;
}

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a1a',
      '::placeholder': {
        color: '#9ca3af',
      },
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    },
    invalid: {
      color: '#ef4444',
    },
  },
};

export default function CheckoutForm({ onSuccess, totalAmount, email: initialEmail, name: initialName, address: initialAddress, clientSecret }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Local state for custom fields - Only prefill email
  const [cardholderName, setCardholderName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [billingAddress, setBillingAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) return;

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret, 
      {
        payment_method: {
          card: cardNumberElement as any,
          billing_details: {
            name: cardholderName,
            email: email,
            address: {
              line1: billingAddress,
            }
          }
        },
        receipt_email: email,
      }
    );

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    } else {
      setMessage("Payment status: " + (paymentIntent?.status || "unknown"));
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Cardholder Name */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <User className="w-4 h-4 text-orange-600" />
          Cardholder Name
        </label>
        <input
          required
          type="text"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          placeholder="Full name as on card"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
        />
      </div>

      {/* 2. Card Number */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-orange-600" />
          Card Number
        </label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
          <CardNumberElement options={ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* 3 & 4. Expiry and CVC Grouped */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            Expiry Date
          </label>
          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
            <CardExpiryElement options={ELEMENT_OPTIONS} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Lock className="w-4 h-4 text-orange-600" />
            CVC/CVV
          </label>
          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
            <CardCvcElement options={ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {/* 5. Email Address */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Mail className="w-4 h-4 text-orange-600" />
          Email Address
        </label>
        <input
          required
          type="email"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* 6. Billing Address */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-600" />
          Billing Address
        </label>
        <textarea
          required
          rows={2}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
          placeholder="Street, City, Zip Code"
          value={billingAddress}
          onChange={(e) => setBillingAddress(e.target.value)}
        />
      </div>

      {message && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Processing...
          </>
        ) : (
          `Complete Order - $${totalAmount.toFixed(2)}`
        )}
      </button>
      
      <p className="text-center text-xs text-gray-400">
        Your payment information is encrypted and secure.
      </p>
    </form>
  );
}
