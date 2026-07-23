/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  featured?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface CateringPackage {
  id: string;
  name: string;
  description: string;
  pricePerPerson: number;
  maxGuests?: number;
  items: string[];
}

export interface AboutSection {
  title: string;
  subtitle?: string;
  content: string;
  image: string;
}

export interface AboutPage {
  hero: AboutSection;
  story: AboutSection;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  type: 'dish' | 'package';
}
