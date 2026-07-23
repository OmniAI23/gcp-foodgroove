import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';
import QuantityModal from '../components/QuantityModal';
import { Dish } from '../types';

export default function MenuPage() {
  const { content, loading } = useContent();
  const { cart, addToCart, updateQuantity } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<Dish | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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

  if (loading || !content) {
    return <div className="pt-32 text-center min-h-screen">Loading menu...</div>;
  }

  const { dishes: DISHES, categories: CONTENT_CATEGORIES = [] } = content;

  // Combine categories from content and from dishes to ensure everything is covered
  const categories = ['All', ...Array.from(new Set([...CONTENT_CATEGORIES, ...DISHES.map(d => d.category)]))];
  
  const filteredDishes = activeCategory === 'All' 
    ? DISHES 
    : DISHES.filter(d => d.category === activeCategory);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <section className="bg-white pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900"
          >
            Our Culinary Menu
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg"
          >
            A curated selection of our finest dishes, from artisanal appetizers to decadent desserts.
          </motion.p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-[72px] z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto relative flex items-center">
          <AnimatePresence>
            {showLeftArrow && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => scroll('left')}
                className="absolute left-0 z-10 p-2 bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm rounded-full text-gray-600 hover:text-orange-600 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          <div 
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-center space-x-4 overflow-x-auto no-scrollbar scroll-smooth px-10 w-full"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
                  activeCategory === cat 
                    ? "bg-orange-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showRightArrow && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => scroll('right')}
                className="absolute right-0 z-10 p-2 bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm rounded-full text-gray-600 hover:text-orange-600 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Menu Grid */}
      <main className="flex-grow py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredDishes.map((dish) => (
              <motion.div
                key={dish.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={dish.image} 
                    alt={dish.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900">{dish.name}</h3>
                    <span className="text-orange-600 font-bold">${dish.price.toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ unit</span></span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{dish.description}</p>
                  <button
                    onClick={() => handleAddToCartClick(dish)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

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
