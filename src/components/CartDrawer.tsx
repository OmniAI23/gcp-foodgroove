import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Dropdown Content */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ 
              type: 'spring',
              damping: 35,
              stiffness: 700,
              mass: 0.3,
              restDelta: 0.5
            }}
            style={{ willChange: 'transform' }}
            className="fixed top-0 right-0 left-0 w-full max-h-[92vh] bg-white shadow-2xl z-[101] flex flex-col rounded-b-[2rem] overflow-hidden"
          >
            {/* Header */}
            <div className="flex-none border-b border-gray-100 pt-20">
              <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-gray-900 active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-scroll min-h-0 custom-scrollbar overscroll-contain">
              <div className="max-w-3xl mx-auto px-6 py-6 pb-24">
                {cart.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-gray-900">Your cart is empty</p>
                      <p className="text-sm text-gray-500">Add some delicious items to get started!</p>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-orange-600 font-bold hover:underline"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-grow space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-orange-600 font-bold text-sm">${item.price.toFixed(2)}</p>
                            <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-white rounded-md transition-colors text-gray-400 hover:text-gray-900"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-white rounded-md transition-colors text-gray-400 hover:text-gray-900"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="flex-none relative bg-white border-t border-gray-100 shadow-[0_-12px_40px_rgba(0,0,0,0.12)]">
                <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="text-2xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="flex-1 py-4 text-gray-500 font-bold hover:text-gray-700 transition-colors order-2 sm:order-1"
                    >
                      Continue Shopping
                    </button>
                    <Link
                      to="/checkout"
                      onClick={() => setIsCartOpen(false)}
                      className="flex-[2] py-4 bg-orange-600 text-white rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 text-center flex items-center justify-center gap-2 order-1 sm:order-2"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
