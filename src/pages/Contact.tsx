import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Send, Utensils } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

export default function Contact() {
  const { content, loading } = useContent();

  if (loading || !content) {
    return <div className="pt-32 text-center min-h-screen">Loading contact info...</div>;
  }

  const { siteConfig } = content;

  const contactItems = [
    { icon: Phone, title: 'Call Us', content: siteConfig.contactPhone, sub: 'Mon-Sun, 9am - 10pm', color: 'text-blue-600' },
    { icon: Mail, title: 'Email Us', content: siteConfig.contactEmail, sub: 'Fast response within 24h', color: 'text-orange-600' },
    { icon: MapPin, title: 'Visit Us', content: '123 Culinary Ave, NY', sub: 'Get Directions', color: 'text-green-600' },
  ];

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-20 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Whether you have a question about our menu, want to book a table, or need to discuss a catering event, we're here to help.
          </motion.p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactItems.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center space-y-4 hover:shadow-xl transition-all"
            >
              <div className={`w-14 h-14 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
              <p className="text-lg font-medium text-gray-700">{item.content}</p>
              <p className="text-sm text-gray-400">{item.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Map & Socials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Find Us in the Heart of the City</h2>
              <p className="text-gray-600 leading-relaxed">
                Located in the vibrant Foodie District, Foodgrooveng is easily accessible by public transport or car. Look for the orange logo and the heavenly aroma of fresh truffle risotto!
              </p>
              
              <div className="flex space-x-6">
                {[
                  { icon: Facebook, label: 'Facebook', url: siteConfig.facebookUrl },
                  { icon: Instagram, label: 'Instagram', url: siteConfig.instagramUrl },
                  { icon: Twitter, label: 'Twitter', url: siteConfig.twitterUrl }
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.url || '#'} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center space-y-2 text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-orange-600 transition-colors">
                      <social.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex items-start space-x-6">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-600">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Parking & Reservations</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Valet parking is available on weekends. We recommend booking at least 48 hours in advance for dinner service.
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-200">
            {/* Mock Map Placeholder */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center animate-bounce shadow-2xl">
                  <MapPin className="text-white w-8 h-8" />
                </div>
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-4 py-2 rounded-lg shadow-lg text-xs font-bold text-gray-900">
                  Foodgrooveng - 123 Culinary Ave
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
