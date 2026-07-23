import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, Clock, ChefHat, Users, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import { useCart } from '../contexts/CartContext';
import QuantityModal from '../components/QuantityModal';
import { Dish } from '../types';

export default function Home() {
  const { content, loading } = useContent();
  const { cart, addToCart, updateQuantity } = useCart();
  const [selectedItem, setSelectedItem] = React.useState<Dish | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleAddToCartClick = (item: Dish) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleConfirmQuantity = (quantity: number) => {
    if (selectedItem) {
      const existing = cart.find(i => i.id === selectedItem.id);
      if (existing) {
        updateQuantity(selectedItem.id, quantity);
      } else {
        addToCart({
          id: selectedItem.id,
          name: selectedItem.name,
          price: selectedItem.price,
          image: selectedItem.image,
          quantity,
          type: 'dish'
        });
      }
    }
  };

  const existingItem = selectedItem 
    ? cart.find(i => i.id === selectedItem.id)
    : null;
  const currentQuantity = existingItem ? existingItem.quantity : 1;
  const isEditing = !!existingItem;

  React.useEffect(() => {
    if (content) {
      console.log('Homepage content loaded. Recommendations:', content.recommendations?.map(r => r.name).join(', ') || 'NONE');
    }
  }, [content]);

  if (loading || !content) {
    return <div className="pt-32 text-center min-h-screen">Loading...</div>;
  }

  const { recommendations = [], testimonials: TESTIMONIALS, siteConfig } = content;
  const RECOMMENDED_DISHES = recommendations;
  
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={siteConfig.heroImage} 
            className="w-full h-full object-cover brightness-50"
            alt="Hero Background"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-1/3" />
        </div>
        
        <div className="relative z-[1] text-center text-white px-6 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            {siteConfig.heroTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {siteConfig.heroSubtitle}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to="/menu" 
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-semibold transition-all flex items-center group shadow-lg"
            >
              Order Online <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/catering" 
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 rounded-full font-semibold transition-all"
            >
              Explore Catering
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Us Summary */}
      <section className="pt-24 pb-12 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop" 
              alt="Our Story"
              className="rounded-3xl shadow-2xl"
            />

          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-orange-600 uppercase tracking-widest">Our Legacy</h2>
              <h3 className="text-4xl font-bold text-gray-900 leading-tight">About Us</h3>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              {siteConfig.aboutText}
            </p>
            <Link 
              to="/about" 
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-orange-600 transition-colors group"
            >
              Learn More <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Dishes Peek */}
      <section className="pt-12 pb-12 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">Chef's Recommendations</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Handpicked favorites that define our seasonal signature.</p>
          </div>
          
          {RECOMMENDED_DISHES.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {RECOMMENDED_DISHES.map((dish, idx) => (
                <motion.div 
                  key={dish.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={dish.image} 
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">{dish.name}</h3>
                      <span className="text-orange-600 font-bold">${dish.price.toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ unit</span></span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{dish.description}</p>
                    <button
                      onClick={() => handleAddToCartClick(dish)}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold shadow-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Check back soon for our latest recommendations!
            </div>
          )}
        </div>
      </section>

      {/* Menu Summary Section */}
      <section className="pt-12 pb-24 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
          {/* Title Above Image */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-sm font-bold text-orange-600 uppercase tracking-widest">Culinary Excellence</h2>
            <h3 className="text-4xl font-bold text-gray-900 leading-tight">Our Menu</h3>
          </motion.div>

          {/* Image in Middle */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" 
              alt="Our Menu"
              className="rounded-3xl shadow-2xl w-full h-[200px] object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Description and CTA Below Image */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl space-y-8"
          >
            <p className="text-gray-600 leading-relaxed text-lg">
              A curated selection of our finest dishes, from artisanal appetizers to decadent desserts.
            </p>
            <Link 
              to="/menu" 
              className="inline-flex items-center px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors group"
            >
              See Menu <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Catering Summary Section */}
      <section className="py-24 px-6 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" 
              alt="Catering"
              className="rounded-3xl shadow-2xl brightness-90"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-orange-500 uppercase tracking-widest">Unforgettable Events</h2>
              <h3 className="text-4xl font-bold leading-tight">Catering Services</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              Elevate your special events with our gourmet trays and personalized service packages.
            </p>
            <Link 
              to="/catering" 
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-orange-600 hover:text-white transition-all group"
            >
              Book Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Summary */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Our Customers Say</h2>
            <p className="text-gray-500">Honest feedback from our culinary community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-10 rounded-3xl border border-gray-100 space-y-6 hover:shadow-xl transition-all"
              >
                <div className="flex space-x-1 text-orange-500">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-gray-700 text-xl italic leading-relaxed">"{t.content}"</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold">{t.name}</h4>
                    <p className="text-orange-600 text-sm">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Debug Server Info */}
      {content.lastUpdated && (
        <div className="py-4 text-center text-[10px] text-gray-300 font-mono">
          V: {new Date(content.lastUpdated).getTime()}
        </div>
      )}

      <QuantityModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmQuantity}
        initialQuantity={currentQuantity}
        isEditing={isEditing}
      />
    </div>
  );
}
