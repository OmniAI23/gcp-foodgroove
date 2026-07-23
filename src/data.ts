import { Dish, CateringPackage, Testimonial } from './types';

export const DISHES: Dish[] = [
  {
    id: '4',
    name: 'Lobster Bisque',
    description: 'Silky smooth cream of lobster with a hint of brandy.',
    price: 14.00,
    category: 'Appetizer',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center and vanilla bean gelato.',
    price: 12.00,
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=2024&auto=format&fit=crop'
  },
  {
    id: '6',
    name: 'Roasted Tomato Basil Soup',
    description: 'Fresh vine-ripened tomatoes roasted with garlic and fresh basil.',
    price: 9.50,
    category: 'Soups',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop'
  },
  {
    id: '7',
    name: 'Butternut Squash Soup',
    description: 'Velvety smooth squash soup with a touch of nutmeg and cream.',
    price: 10.50,
    category: 'Soups',
    image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=1974&auto=format&fit=crop'
  },
  {
    id: '8',
    name: 'Classic Jollof Rice',
    description: 'Long-grain parboiled rice cooked in a flavorful tomato and pepper base.',
    price: 15.00,
    category: 'Rice',
    image: 'https://images.unsplash.com/photo-1645177623570-0283c617f6e0?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '9',
    name: 'Fragrant Coconut Rice',
    description: 'Steamed rice infused with rich coconut milk and aromatic spices.',
    price: 16.00,
    category: 'Rice',
    image: 'https://images.unsplash.com/photo-1512058560366-cd242945863e?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '10',
    name: 'Spiced Lamb Chops',
    description: 'Tender lamb chops grilled to perfection with a signature herb rub.',
    price: 28.50,
    category: 'Chops',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '11',
    name: 'Crispy Samosa Platter',
    description: 'A variety of vegetable and meat samosas served with tangy chutney.',
    price: 12.50,
    category: 'Chops',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce99?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '12',
    name: 'Egusi Soup & Pounded Yam',
    description: 'Traditional melon seed soup with spinach and assorted meats, served with pounded yam.',
    price: 22.00,
    category: 'African Specials',
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '13',
    name: 'Beef Suya Platter',
    description: 'Thinly sliced beef marinated in spicy yaji peanut rub and flame-grilled.',
    price: 18.50,
    category: 'African Specials',
    image: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=2070&auto=format&fit=crop'
  }
];

export const RECOMMENDATIONS: Dish[] = [
  {
    id: '1',
    name: 'Truffle Mushroom Risotto',
    description: 'Creamy Arborio rice with wild mushrooms and white truffle oil.',
    price: 24.50,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Pan-Seared Sea Bass',
    description: 'Fresh sea bass with lemon butter sauce and seasonal asparagus.',
    price: 32.00,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Wagyu Beef Sliders',
    description: 'Mini wagyu patties with caramelized onions and blue cheese.',
    price: 18.00,
    category: 'Appetizer',
    image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?q=80&w=2070&auto=format&fit=crop'
  }
];

export const CATEGORIES = [
  'Appetizer',
  'Main Course',
  'Dessert',
  'Drink',
  'Tray',
  'Soups',
  'Rice',
  'Chops',
  'African Specials'
];

export const CATERING_PACKAGES: CateringPackage[] = [
  {
    id: 'p1',
    name: 'Elegant Reception',
    description: 'Perfect for weddings and formal gatherings.',
    pricePerPerson: 45,
    maxGuests: 50,
    items: ['6 Appetizers', '2 Main Courses', 'Gourmet Dessert Station', 'Premium Coffee Service']
  },
  {
    id: 'p2',
    name: 'Corporate Lunch',
    description: 'Ideal for board meetings and team events.',
    pricePerPerson: 25,
    maxGuests: 20,
    items: ['Assorted Gourmet Wraps', 'Seasonal Salad', 'Fruit Platter', 'Cold Beverages']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Sarah Johnson',
    role: 'Food Critic',
    content: 'The sea bass was absolutely divine. A masterpiece of flavor and presentation.',
    rating: 5
  },
  {
    id: 't2',
    name: 'Michael Chen',
    role: 'Event Organizer',
    content: 'Foodgrooveng handled our corporate gala flawlessly. The catering trays were a hit!',
    rating: 5
  }
];
