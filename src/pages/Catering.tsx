import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Package, CheckCircle2, MessageSquare, Send, ShoppingCart } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';

export default function Catering() {
  const { content, loading } = useContent();
  const { addToCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (loading || !content) {
    return <div className="pt-32 text-center min-h-screen">Loading catering options...</div>;
  }

  const { cateringPackages: CATERING_PACKAGES } = content;
  const [addedPkgId, setAddedPkgId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    guests: '',
    message: ''
  });

  // Scroll to top when success state changes
  React.useEffect(() => {
    if (isSuccess) {
      window.scrollTo(0, 0);
    }
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/catering-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to send inquiry');

      setIsSuccess(true);
      setFormData({ name: '', email: '', date: '', guests: '', message: '' });
    } catch (error) {
      console.error('Error sending catering inquiry:', error);
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPackage = (pkg: any) => {
    addToCart({
      id: pkg.id,
      name: pkg.name,
      price: pkg.pricePerPerson,
      quantity: 1,
      type: 'package'
    });
    setAddedPkgId(pkg.id);
    setTimeout(() => setAddedPkgId(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
          alt="Catering Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-1/3" />
        <div className="relative z-[1] text-center text-white px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
          >
            Exquisite Catering
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 max-w-2xl mx-auto"
          >
            Elevate your special events with our gourmet trays and personalized service packages.
          </motion.p>
        </div>
      </section>

      {/* Packages */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Event Packages</h2>
            <p className="text-gray-500">Tailored culinary solutions for every scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {CATERING_PACKAGES.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-8 md:p-12 rounded-3xl space-y-8 flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
                    <p className="text-gray-500">{pkg.description}</p>
                    {pkg.maxGuests && pkg.maxGuests > 0 && (
                      <p className="text-sm font-medium text-orange-600/80">Max. {pkg.maxGuests} guests</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600">${pkg.pricePerPerson}</p>
                  </div>
                </div>

                <div className="flex-grow space-y-4">
                  <p className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center">
                    <Package className="w-4 h-4 mr-2 text-orange-600" />
                    What's Included
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pkg.items.map((item, i) => (
                      <li key={i} className="flex items-center text-gray-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-gray-200" />
                
                <button
                  onClick={() => handleAddPackage(pkg)}
                  disabled={addedPkgId === pkg.id}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl transition-all font-bold shadow-lg",
                    addedPkgId === pkg.id 
                      ? "bg-green-600 text-white scale-95" 
                      : "bg-orange-600 text-white hover:bg-orange-700 active:scale-95"
                  )}
                >
                  {addedPkgId === pkg.id ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Package Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Select Package
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-orange-600 p-12 text-white space-y-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold">Inquire Now</h2>
            <p className="text-orange-100">
              Planning an event? Tell us about your requirements and we'll craft a personalized proposal for you.
            </p>
            <div className="space-y-6 pt-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <span>Available 7 days a week</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span>Fast response within 24h</span>
              </div>
            </div>
          </div>
          
          <div className="p-12">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Request Sent!</h3>
                <p className="text-gray-500">We've received your inquiry and will be in touch shortly.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 text-orange-600 font-bold hover:underline"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <input 
                    required 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500" 
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Event Date</label>
                    <input 
                      required 
                      type="date" 
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Guests</label>
                    <input 
                      required 
                      type="number" 
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500" 
                      placeholder="50"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Message</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 min-h-[100px]" 
                    placeholder="Tell us about your event..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>
                <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <span>Send Inquiry</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
