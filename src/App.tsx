import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useLayoutEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import MenuPage from './pages/Menu';
import Catering from './pages/Catering';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import CartDrawer from './components/CartDrawer';
import { ContentProvider } from './contexts/ContentContext';
import { CartProvider } from './contexts/CartContext';

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <CartDrawer />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route
              path="*"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/catering" element={<Catering />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/admin" element={<Admin />} />
                  </Routes>
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </ContentProvider>
  );
}
