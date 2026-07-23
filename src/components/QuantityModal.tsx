import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Dish } from '../types';

interface QuantityModalProps {
  item: Dish | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  initialQuantity?: number;
  isEditing?: boolean;
}

export default function QuantityModal({ item, isOpen, onClose, onConfirm, initialQuantity = 1, isEditing = false }: QuantityModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  React.useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity || 1);
    }
  }, [isOpen, initialQuantity]);

  if (!item) return null;

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => {
    const newQty = quantity > 0 ? quantity - 1 : 0;
    setQuantity(newQty);
    
    if (newQty === 0 && isEditing) {
      onConfirm(0);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[320px] bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header with Image */}
            <div className="relative h-32">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-50 p-1.5 bg-white/90 hover:bg-white text-gray-900 rounded-full transition-all shadow-lg border border-gray-100"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-5 right-5">
                <p className="text-orange-400 text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5">{item.category}</p>
                <h3 className="text-lg font-bold text-white leading-tight">{item.name}</h3>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Select Quantity</p>
                <div className="flex items-center gap-5">
                  <button
                    onClick={decrement}
                    disabled={quantity === 0 && !isEditing}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold text-gray-900 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={increment}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-colors shadow-lg shadow-orange-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-1 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900 text-base">${(item.price * quantity).toFixed(2)}</span>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={quantity === 0 && !isEditing}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                    quantity === 0 && isEditing
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 shadow-red-50'
                      : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-100'
                  } disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none`}
                >
                  {quantity === 0 && isEditing ? (
                    <Trash2 className="w-4 h-4" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                  {quantity === 0 
                    ? (isEditing ? 'Remove' : 'Select Quantity') 
                    : (isEditing ? 'Update Cart' : 'Add to Cart')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
