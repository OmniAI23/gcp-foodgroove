import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, UtensilsCrossed, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { content } = useContent();
  const { totalItems, toggleCart, isCartOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isDarkHeroPage = location.pathname === '/' || location.pathname === '/catering';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Menu', path: '/menu' },
    { name: 'Catering', path: '/catering' },
    { name: 'Contact', path: '/contact' },
    { name: 'Admin', path: '/admin' },
  ];

  const logo = content?.siteConfig?.logo;
  const shouldShowLightNavbar = isScrolled || !isDarkHeroPage || isCartOpen;

  return (
    <motion.nav
      initial={false}
      animate={{
        backgroundColor: shouldShowLightNavbar ? '#ffffff' : 'rgba(255, 255, 255, 0)',
        paddingTop: shouldShowLightNavbar ? '12px' : '20px',
        paddingBottom: shouldShowLightNavbar ? '12px' : '20px',
        boxShadow: shouldShowLightNavbar ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : '0 0 0 0 rgb(0 0 0 / 0)',
        borderBottomColor: shouldShowLightNavbar ? '#f3f4f6' : 'rgba(243, 244, 246, 0)',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-[10000] px-6 border-b"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          {logo ? (
            <img src={logo} alt="Foodgrooveng" className="w-10 h-10 object-contain rounded-lg" />
          ) : (
            <UtensilsCrossed className={cn("w-8 h-8", shouldShowLightNavbar ? "text-orange-600" : "text-white")} />
          )}
          <span className={cn("text-2xl font-bold tracking-tight", shouldShowLightNavbar ? "text-gray-900" : "text-white")}>
            Foodgrooveng
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-orange-500",
                location.pathname === link.path 
                  ? "text-orange-600" 
                  : (shouldShowLightNavbar ? "text-gray-600" : "text-white/90")
              )}
            >
              {link.name}
            </Link>
          ))}
          
          <button onClick={toggleCart} className="relative group p-2">
            <ShoppingCart className={cn("w-6 h-6 transition-colors group-hover:text-orange-500", shouldShowLightNavbar ? "text-gray-900" : "text-white")} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center space-x-4">
          <button onClick={toggleCart} className="relative p-2">
            <ShoppingCart className={cn("w-6 h-6", shouldShowLightNavbar ? "text-gray-900" : "text-white")} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn("p-2", shouldShowLightNavbar ? "text-gray-900" : "text-white")}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl p-6 md:hidden flex flex-col space-y-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-lg font-medium py-2 border-b border-gray-100 last:border-0",
                  location.pathname === link.path ? "text-orange-600" : "text-gray-600"
                )}
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
