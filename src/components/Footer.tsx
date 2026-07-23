import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, UtensilsCrossed } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

export default function Footer() {
  const { content } = useContent();

  const siteConfig = content?.siteConfig || {
    contactEmail: 'hello@foodgrooveng.com',
    contactPhone: '(555) 123-4567',
    instagramUrl: '#',
    facebookUrl: '#',
    twitterUrl: '#',
    logo: ''
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center space-x-2 text-white">
            {siteConfig.logo ? (
              <img src={siteConfig.logo} alt="Foodgrooveng" className="w-10 h-10 object-contain rounded-lg" />
            ) : (
              <UtensilsCrossed className="w-8 h-8 text-orange-500" />
            )}
            <span className="text-2xl font-bold tracking-tight">Foodgrooveng</span>
          </Link>
          <p className="text-sm leading-relaxed">
            Crafting unforgettable culinary experiences since 2010. Fine dining, catering, and gourmet event services.
          </p>
          <div className="flex space-x-4">
            {siteConfig.facebookUrl && (
              <a href={siteConfig.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {siteConfig.instagramUrl && (
              <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {siteConfig.twitterUrl && (
              <a href={siteConfig.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Explore</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/menu" className="hover:text-white transition-colors">Our Menu</Link></li>
            <li><Link to="/catering" className="hover:text-white transition-colors">Catering Services</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
              <span>123 Culinary Ave, Foodie District<br />New York, NY 10012</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-orange-500 shrink-0" />
              <span>{siteConfig.contactPhone}</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-orange-500 shrink-0" />
              <span>{siteConfig.contactEmail}</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Newsletter</h4>
          <p className="text-sm mb-4">Subscribe for seasonal menu updates and special offers.</p>
          <form className="flex">
            <input 
              type="email" 
              placeholder="Your email" 
              className="bg-gray-800 border-none px-4 py-2 rounded-l-md w-full text-sm focus:ring-1 focus:ring-orange-500"
            />
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-r-md transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 flex flex-col md:row justify-between items-center text-xs space-y-4 md:space-y-0">
        <p>© 2026 Foodgrooveng. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
