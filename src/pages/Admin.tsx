import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Save, Plus, Trash2, Lock, LayoutDashboard, Utensils, Settings, LogOut, Package, MessageSquare, Eye, EyeOff, ArrowLeft, ChevronDown, ChevronRight, FileText, Camera, Upload, Instagram, Facebook, Twitter, Edit2, X, Tags } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { cn } from '../lib/utils';
import { Dish, Testimonial, AboutPage, AboutSection, CateringPackage } from '../types';

type AdminTab = 'dashboard' | 'content';
type ContentSection = 'home' | 'about' | 'menu' | 'catering' | 'contact' | 'global' | 'recommendations' | 'testimonials' | 'categories';

export default function Admin() {
  const { content, refreshContent } = useContent();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [expandedSection, setExpandedSection] = useState<ContentSection | null>('home');
  const [isAddingRecommendation, setIsAddingRecommendation] = useState(false);
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [isAddingCateringPackage, setIsAddingCateringPackage] = useState(false);
  const [newRecData, setNewRecData] = useState<Partial<Dish>>({
    name: '',
    description: '',
    price: undefined,
    category: 'Main Course',
    image: ''
  });
  const [newDishData, setNewDishData] = useState<Partial<Dish>>({
    name: '',
    description: '',
    price: undefined,
    category: 'Main Course',
    image: ''
  });
  const [newPackageData, setNewPackageData] = useState<Partial<CateringPackage>>({
    name: '',
    description: '',
    pricePerPerson: 0,
    maxGuests: undefined,
    items: []
  });
  const [isContentNavOpen, setIsContentNavOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: 'dish' | 'recommendation' | 'testimonial' | 'catering_package' | 'category';
    name: string;
  } | null>(null);

  // Sync local content when content is loaded or refreshed
  React.useEffect(() => {
    if (content) {
      setLocalContent(content);
      setHasUnsavedChanges(false);
    }
  }, [content]);

  // Track unsaved changes
  React.useEffect(() => {
    if (content && localContent) {
      const isDifferent = JSON.stringify(content) !== JSON.stringify(localContent);
      setHasUnsavedChanges(isDifferent);
    }
  }, [localContent, content]);

  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      alert('Please enter a password');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        alert('Invalid password. Please check your credentials.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Authentication error (${response.status}): ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Login verification failed:', error);
      alert('An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const [showDebug, setShowDebug] = useState(false);

  const handleSave = async () => {
    if (!localContent) {
      console.error('Save attempted but localContent is null');
      return;
    }
    
    console.log('--- SAVE INITIATED ---');
    console.log('Local Recommendations count:', localContent.recommendations?.length || 0);
    console.log('Local Recommendations data:', localContent.recommendations);
    
    setSaving(true);
    try {
      const payload = { password, content: localContent };
      console.log('Sending payload to /api/content...');
      
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('Save response OK. Refreshing content...');
        await refreshContent();
        alert('Content saved successfully!');
      } else {
        let errorMessage = 'Failed to save';
        try {
          const err = await response.json();
          errorMessage = err.error || errorMessage;
          console.error('Save failed with error:', errorMessage);
        } catch (e) {
          errorMessage = `Server returned status ${response.status}`;
          console.error('Save failed with status:', response.status);
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Save network error:', error);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
      console.log('--- SAVE COMPLETED ---');
    }
  };

  const toggleSection = (section: ContentSection) => {
    setExpandedSection(expandedSection === section ? null : section);
    setActiveTab('content');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string, type: 'dish' | 'recommendation' = 'dish') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for base64
        alert('Image is too large. Please select an image under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'dish') {
          updateDish(id, { image: reader.result as string });
        } else {
          updateRecommendation(id, { image: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for base64
        alert('Image is too large. Please select an image under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for base64
        alert('Image is too large. Please select an image under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig('heroImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAboutImageUpload = (e: React.ChangeEvent<HTMLInputElement>, section: 'hero' | 'story') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for base64
        alert('Image is too large. Please select an image under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateAboutPage(section, { image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewRecImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image is too large. Please select an image under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRecData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewDishImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image is too large. Please select an image under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDishData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateDish = (id: string, updates: Partial<Dish>) => {
    if (!localContent) return;
    setLocalContent({
      ...localContent,
      dishes: localContent.dishes.map(d => d.id === id ? { ...d, ...updates } : d)
    });
  };

  const updateRecommendation = (id: string, updates: Partial<Dish>) => {
    if (!localContent) return;
    setLocalContent({
      ...localContent,
      recommendations: localContent.recommendations.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    if (!localContent) return;
    setLocalContent({
      ...localContent,
      testimonials: localContent.testimonials.map(t => t.id === id ? { ...t, ...updates } : t)
    });
  };

  const updateAboutPage = (section: 'hero' | 'story', updates: Partial<AboutSection>) => {
    if (!localContent) return;
    setLocalContent({
      ...localContent,
      aboutPage: {
        ...localContent.aboutPage,
        [section]: {
          ...localContent.aboutPage[section],
          ...updates
        }
      }
    });
  };

  const addDish = () => {
    setNewDishData({
      name: '',
      description: '',
      price: undefined,
      category: 'Main Course',
      image: ''
    });
    setIsAddingDish(true);
  };

  const saveNewDish = () => {
    if (!localContent) return;
    if (!newDishData.name || !newDishData.description || !newDishData.image) {
      alert('Please fill in the name, description, and upload an image.');
      return;
    }

    const newDish: Dish = {
      id: Date.now().toString(),
      name: newDishData.name || '',
      description: newDishData.description || '',
      price: newDishData.price || 0,
      category: newDishData.category as any || 'Main Course',
      image: newDishData.image || '',
    };

    setLocalContent({
      ...localContent,
      dishes: [...localContent.dishes, newDish]
    });
    
    // Reset form and close modal
    setNewDishData({
      name: '',
      description: '',
      price: undefined,
      category: 'Main Course',
      image: ''
    });
    setIsAddingDish(false);
  };

  const addCateringPackage = () => {
    setNewPackageData({
      name: '',
      description: '',
      pricePerPerson: 0,
      maxGuests: undefined,
      items: []
    });
    setIsAddingCateringPackage(true);
  };

  const saveNewCateringPackage = () => {
    if (!localContent) return;
    if (!newPackageData.name || !newPackageData.description) {
      alert('Please fill in the package name and description.');
      return;
    }

    const newPkg: CateringPackage = {
      id: Date.now().toString(),
      name: newPackageData.name || '',
      description: newPackageData.description || '',
      pricePerPerson: newPackageData.pricePerPerson || 0,
      maxGuests: newPackageData.maxGuests,
      items: newPackageData.items || []
    };

    setLocalContent({
      ...localContent,
      cateringPackages: [...localContent.cateringPackages, newPkg]
    });
    
    setIsAddingCateringPackage(false);
  };

  const addRecommendation = () => {
    setNewRecData({
      name: '',
      description: '',
      price: undefined,
      category: 'Main Course',
      image: ''
    });
    setIsAddingRecommendation(true);
  };

  const saveNewRecommendation = () => {
    if (!localContent) return;
    if (!newRecData.name || !newRecData.description || !newRecData.image) {
      alert('Please fill in the name, description, and upload an image.');
      return;
    }

    const newRec: Dish = {
      id: Date.now().toString(),
      name: newRecData.name || '',
      description: newRecData.description || '',
      price: newRecData.price || 0,
      category: newRecData.category || 'Main Course',
      image: newRecData.image || '',
    };

    setLocalContent({
      ...localContent,
      recommendations: [...(localContent.recommendations || []), newRec]
    });
    
    // Reset form and close modal
    setNewRecData({
      name: '',
      description: '',
      price: undefined,
      category: 'Main Course',
      image: ''
    });
    setIsAddingRecommendation(false);
  };

  const addTestimonial = () => {
    if (!localContent) return;
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: 'New Customer',
      role: 'Customer',
      content: 'I had an amazing experience!',
      rating: 5
    };
    setLocalContent({
      ...localContent,
      testimonials: [...localContent.testimonials, newTestimonial]
    });
  };

  const deleteDish = (id: string, name: string) => {
    setDeleteConfirm({ id, type: 'dish', name });
  };

  const deleteRecommendation = (id: string, name: string) => {
    setDeleteConfirm({ id, type: 'recommendation', name });
  };

  const deleteTestimonial = (id: string, name: string) => {
    setDeleteConfirm({ id, type: 'testimonial', name });
  };

  const deleteCateringPackage = (id: string, name: string) => {
    setDeleteConfirm({ id, type: 'catering_package', name });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;

    setLocalContent(prev => {
      if (!prev) return prev;
      if (type === 'dish') {
        return {
          ...prev,
          dishes: prev.dishes.filter(d => d.id !== id)
        };
      }
      if (type === 'recommendation') {
        return {
          ...prev,
          recommendations: prev.recommendations.filter(r => r.id !== id)
        };
      }
      if (type === 'testimonial') {
        return {
          ...prev,
          testimonials: prev.testimonials.filter(t => t.id !== id)
        };
      }
      if (type === 'catering_package') {
        return {
          ...prev,
          cateringPackages: prev.cateringPackages.filter(p => p.id !== id)
        };
      }
      if (type === 'category') {
        return {
          ...prev,
          categories: (prev.categories || []).filter(c => c !== id)
        };
      }
      return prev;
    });
    setDeleteConfirm(null);
  };

  const updateConfig = (key: string, value: string) => {
    if (!localContent) return;
    setLocalContent({
      ...localContent,
      siteConfig: {
        ...localContent.siteConfig,
        [key]: value
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
        <Link 
          to="/" 
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors font-medium self-center md:self-auto md:absolute md:top-32 md:left-10"
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Home
        </Link>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">Admin Portal</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none pr-12"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                'Access Portal'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!localContent) return <div className="pt-32 text-center">Loading content...</div>;

  const contentPages = [
    { id: 'home', name: 'Home Page', icon: <FileText className="w-4 h-4" /> },
    { id: 'about', name: 'About Page', icon: <FileText className="w-4 h-4" /> },
    { id: 'categories', name: 'Food Categories', icon: <Tags className="w-4 h-4" /> },
    { id: 'recommendations', name: "Chef's Recommendations", icon: <Utensils className="w-4 h-4" /> },
    { id: 'menu', name: 'Menu Items', icon: <Utensils className="w-4 h-4" /> },
    { id: 'catering', name: 'Catering Page', icon: <Package className="w-4 h-4" /> },
    { id: 'testimonials', name: 'Testimonials', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'global', name: 'Global Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'content' && (
            <div className="flex flex-col min-h-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Overview</h2>
                  <div className="flex flex-col">
                    <p className="text-gray-500">Click on each page to update it</p>
                    {content?.lastUpdated && (
                      <p className="text-[10px] text-gray-400 font-mono mt-1">
                        SERVER VERSION: {new Date(content.lastUpdated).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all font-medium border border-red-100"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>

              <div className="space-y-4 grow">
                {/* Home Page Accordion */}
                <AccordionSection 
                  title="Home Page" 
                  isOpen={expandedSection === 'home'} 
                  onClick={() => toggleSection('home')}
                >
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-900 pb-2 border-b border-gray-100">Hero Section</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600">Main Title</label>
                      <input
                        value={localContent.siteConfig.heroTitle}
                        onChange={(e) => updateConfig('heroTitle', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600">Subtitle</label>
                      <textarea
                        value={localContent.siteConfig.heroSubtitle}
                        onChange={(e) => updateConfig('heroSubtitle', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600">Hero Image</label>
                      <div className="flex items-center gap-4">
                        <div className="w-40 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          {localContent.siteConfig.heroImage ? (
                            <img src={localContent.siteConfig.heroImage} alt="Hero" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Camera className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <label className="cursor-pointer px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">
                          Change Hero Image
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleHeroImageUpload} 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </AccordionSection>

                {/* About Page Accordion */}
                <AccordionSection 
                  title="About Page" 
                  isOpen={expandedSection === 'about'} 
                  onClick={() => toggleSection('about')}
                >
                  <div className="space-y-8">
                    {/* Hero/Header Section */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6">
                      <h3 className="font-bold text-lg text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-orange-600" />
                        Hero/Header Section
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Section Title</label>
                          <input
                            value={localContent.aboutPage.hero.title}
                            onChange={(e) => updateAboutPage('hero', { title: e.target.value })}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Subtitle/Content</label>
                          <textarea
                            value={localContent.aboutPage.hero.content}
                            onChange={(e) => updateAboutPage('hero', { content: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Story Section */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6">
                      <h3 className="font-bold text-lg text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-600" />
                        Our Story Section
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Section Title</label>
                            <input
                              value={localContent.aboutPage.story.title}
                              onChange={(e) => updateAboutPage('story', { title: e.target.value })}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Story Content</label>
                            <textarea
                              value={localContent.aboutPage.story.content}
                              onChange={(e) => updateAboutPage('story', { content: e.target.value })}
                              rows={6}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <label className="text-xs font-bold text-gray-400 uppercase">Story Image</label>
                          <div className="relative group aspect-square">
                            <label className="cursor-pointer block w-full h-full relative overflow-hidden rounded-2xl bg-white border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-orange-500 transition-colors">
                              {localContent.aboutPage.story.image ? (
                                <>
                                  <img src={localContent.aboutPage.story.image} alt="Story" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                  <div className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg text-orange-600 z-10">
                                    <Edit2 className="w-4 h-4" />
                                  </div>
                                </>
                              ) : (
                                <Upload className="w-8 h-8 text-gray-300" />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold">
                                <Camera className="w-6 h-6 mb-1" />
                                CHANGE IMAGE
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleAboutImageUpload(e, 'story')} 
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionSection>

                {/* Food Categories Accordion */}
                <AccordionSection 
                  title="Food Categories" 
                  isOpen={expandedSection === 'categories'} 
                  onClick={() => toggleSection('categories')}
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">Manage the categories used for menu items and recommendations.</p>
                      <button
                        onClick={() => {
                          const currentCategories = localContent?.categories || [];
                          const newCategories = [...currentCategories, 'New Category'];
                          setLocalContent({ ...localContent!, categories: newCategories });
                        }}
                        className="flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Add Category
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(localContent?.categories || []).map((cat, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                          <input
                            value={cat}
                            onChange={(e) => {
                              const newCategories = [...(localContent?.categories || [])];
                              newCategories[idx] = e.target.value;
                              setLocalContent({ ...localContent!, categories: newCategories });
                            }}
                            className="grow px-2 py-1 border-none focus:ring-0 outline-none font-medium"
                          />
                          <button
                            onClick={() => {
                              setDeleteConfirm({ id: cat, type: 'category', name: cat });
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionSection>

                {/* Chef's Recommendation Accordion */}
                <AccordionSection 
                  title="Chef's Recommendation (Homepage)" 
                  isOpen={expandedSection === 'recommendations'} 
                  onClick={() => toggleSection('recommendations')}
                >
                  <div className="space-y-6">
                    <button
                      onClick={addRecommendation}
                      className="flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Recommendation
                    </button>
                    <div className="grid grid-cols-1 gap-4">
                      {localContent.recommendations.map((dish) => (
                        <div key={dish.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-6">
                          <div className="relative group w-24 h-24 shrink-0">
                            <label className="cursor-pointer block w-full h-full relative overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
                              {dish.image ? (
                                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                              ) : (
                                <Upload className="w-8 h-8 text-gray-400" />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                                <Camera className="w-5 h-5 mb-1" />
                                EDIT
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleImageUpload(e, dish.id, 'recommendation')} 
                              />
                            </label>
                          </div>
                          
                          <div className="grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Name</label>
                              <input
                                value={dish.name}
                                onChange={(e) => updateRecommendation(dish.id, { name: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Price</label>
                              <input
                                type="number"
                                value={dish.price}
                                onChange={(e) => updateRecommendation(dish.id, { price: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                              <select
                                value={dish.category}
                                onChange={(e) => updateRecommendation(dish.id, { category: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                              >
                                {(localContent?.categories || []).map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1 lg:col-span-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Actions</label>
                              <button
                                type="button"
                                onClick={() => deleteRecommendation(dish.id, dish.name)}
                                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-all px-3 py-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                            <div className="space-y-1 md:col-span-2 lg:col-span-4">
                              <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                              <textarea
                                value={dish.description}
                                onChange={(e) => updateRecommendation(dish.id, { description: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-2 lg:col-span-4">
                              <label className="text-xs font-bold text-gray-400 uppercase">Image URL (Optional)</label>
                              <div className="flex gap-2">
                                <input
                                  value={dish.image}
                                  onChange={(e) => updateRecommendation(dish.id, { image: e.target.value })}
                                  placeholder="Or paste an image URL here..."
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                />
                                <button 
                                  onClick={() => {
                                    const input = document.getElementById(`file-rec-${dish.id}`);
                                    if (input) (input as HTMLInputElement).click();
                                  }}
                                  className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 shrink-0"
                                  title="Upload Image"
                                >
                                  <Upload className="w-4 h-4" />
                                </button>
                                <input 
                                  id={`file-rec-${dish.id}`}
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*" 
                                  onChange={(e) => handleImageUpload(e, dish.id, 'recommendation')} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionSection>

                {/* Menu Items Accordion */}
                <AccordionSection 
                  title="Menu Items" 
                  isOpen={expandedSection === 'menu'} 
                  onClick={() => toggleSection('menu')}
                >
                  <div className="space-y-6">
                    <button
                      onClick={addDish}
                      className="flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Dish
                    </button>
                    <div className="grid grid-cols-1 gap-4">
                      {localContent.dishes.map((dish) => (
                        <div key={dish.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-6">
                          <div className="relative group w-24 h-24 shrink-0">
                            <label className="cursor-pointer block w-full h-full relative overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
                              {dish.image ? (
                                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                              ) : (
                                <Upload className="w-8 h-8 text-gray-400" />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                                <Camera className="w-5 h-5 mb-1" />
                                EDIT
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleImageUpload(e, dish.id)} 
                              />
                            </label>
                          </div>
                          
                          <div className="grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Name</label>
                              <input
                                value={dish.name}
                                onChange={(e) => updateDish(dish.id, { name: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Price</label>
                              <input
                                type="number"
                                value={dish.price}
                                onChange={(e) => updateDish(dish.id, { price: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                              <select
                                value={dish.category}
                                onChange={(e) => updateDish(dish.id, { category: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                              >
                                {(localContent?.categories || []).map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1 lg:col-span-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Actions</label>
                              <button
                                type="button"
                                onClick={() => deleteDish(dish.id, dish.name)}
                                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-all px-3 py-2"
                              >
                                <Trash2 className="w-5 h-5" />
                                Delete
                              </button>
                            </div>
                            <div className="space-y-1 md:col-span-2 lg:col-span-4">
                              <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                              <textarea
                                value={dish.description}
                                onChange={(e) => updateDish(dish.id, { description: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-2 lg:col-span-4">
                              <label className="text-xs font-bold text-gray-400 uppercase">Image URL (Optional)</label>
                              <div className="flex gap-2">
                                <input
                                  value={dish.image}
                                  onChange={(e) => updateDish(dish.id, { image: e.target.value })}
                                  placeholder="Or paste an image URL here..."
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                />
                                <button 
                                  onClick={() => {
                                    const input = document.getElementById(`file-${dish.id}`);
                                    if (input) (input as HTMLInputElement).click();
                                  }}
                                  className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 shrink-0"
                                  title="Upload Image"
                                >
                                  <Upload className="w-4 h-4" />
                                </button>
                                <input 
                                  id={`file-${dish.id}`}
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*" 
                                  onChange={(e) => handleImageUpload(e, dish.id)} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionSection>

                {/* Catering Page Accordion */}
                <AccordionSection 
                  title="Catering Page" 
                  isOpen={expandedSection === 'catering'} 
                  onClick={() => toggleSection('catering')}
                >
                  <div className="space-y-6">
                    <button
                      onClick={addCateringPackage}
                      className="flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-all mb-4"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Package
                    </button>
                    {localContent.cateringPackages.map((pkg, idx) => (
                      <div key={pkg.id} className="bg-gray-50 p-8 rounded-2xl border border-gray-200 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Package Name</label>
                              <input
                                value={pkg.name}
                                onChange={(e) => {
                                  const newPkgs = [...localContent.cateringPackages];
                                  newPkgs[idx] = { ...pkg, name: e.target.value };
                                  setLocalContent({ ...localContent, cateringPackages: newPkgs });
                                }}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Price</label>
                              <input
                                type="number"
                                value={pkg.pricePerPerson}
                                onChange={(e) => {
                                  const newPkgs = [...localContent.cateringPackages];
                                  newPkgs[idx] = { ...pkg, pricePerPerson: parseFloat(e.target.value) || 0 };
                                  setLocalContent({ ...localContent, cateringPackages: newPkgs });
                                }}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Max Guests (Optional)</label>
                              <input
                                type="number"
                                value={pkg.maxGuests ?? ''}
                                onChange={(e) => {
                                  const newPkgs = [...localContent.cateringPackages];
                                  newPkgs[idx] = { ...pkg, maxGuests: e.target.value === '' ? undefined : parseInt(e.target.value) || 0 };
                                  setLocalContent({ ...localContent, cateringPackages: newPkgs });
                                }}
                                placeholder="No limit"
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteCateringPackage(pkg.id, pkg.name)}
                            className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Package"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                          <textarea
                            value={pkg.description}
                            onChange={(e) => {
                              const newPkgs = [...localContent.cateringPackages];
                              newPkgs[idx] = { ...pkg, description: e.target.value };
                              setLocalContent({ ...localContent, cateringPackages: newPkgs });
                            }}
                            rows={2}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">What's Included</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(pkg.items || []).map((item, itemIdx) => (
                              <div key={itemIdx} className="flex gap-2">
                                <input
                                  value={item}
                                  onChange={(e) => {
                                    const newPkgs = [...localContent.cateringPackages];
                                    const newItems = [...pkg.items];
                                    newItems[itemIdx] = e.target.value;
                                    newPkgs[idx] = { ...pkg, items: newItems };
                                    setLocalContent({ ...localContent, cateringPackages: newPkgs });
                                  }}
                                  className="flex-1 px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const newPkgs = [...localContent.cateringPackages];
                                    const newItems = pkg.items.filter((_, i) => i !== itemIdx);
                                    newPkgs[idx] = { ...pkg, items: newItems };
                                    setLocalContent({ ...localContent, cateringPackages: newPkgs });
                                  }}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newPkgs = [...localContent.cateringPackages];
                                const newItems = [...(pkg.items || []), ''];
                                newPkgs[idx] = { ...pkg, items: newItems };
                                setLocalContent({ ...localContent, cateringPackages: newPkgs });
                              }}
                              className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 p-2"
                            >
                              <Plus className="w-3 h-3" />
                              ADD ITEM
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionSection>

                {/* Testimonials Accordion */}
                <AccordionSection 
                  title="Testimonials" 
                  isOpen={expandedSection === 'testimonials'} 
                  onClick={() => toggleSection('testimonials')}
                >
                  <div className="space-y-6">
                    <button
                      onClick={addTestimonial}
                      className="flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Testimonial
                    </button>
                    <div className="grid grid-cols-1 gap-4">
                      {localContent.testimonials.map((t) => (
                        <div key={t.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Customer Name</label>
                              <input
                                value={t.name}
                                onChange={(e) => updateTestimonial(t.id, { name: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Role / Company</label>
                              <input
                                value={t.role}
                                onChange={(e) => updateTestimonial(t.id, { role: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase">Rating (1-5)</label>
                              <select
                                value={t.rating}
                                onChange={(e) => updateTestimonial(t.id, { rating: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                              >
                                {[1, 2, 3, 4, 5].map(r => (
                                  <option key={r} value={r}>{r} Stars</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1 flex items-end">
                              <button
                                type="button"
                                onClick={() => deleteTestimonial(t.id, t.name)}
                                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-all px-3 py-2"
                              >
                                <Trash2 className="w-5 h-5" />
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Feedback Content</label>
                            <textarea
                              value={t.content}
                              onChange={(e) => updateTestimonial(t.id, { content: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionSection>

                {/* Global Settings Accordion */}
                <AccordionSection 
                  title="Global Settings" 
                  isOpen={expandedSection === 'global'} 
                  onClick={() => toggleSection('global')}
                >
                  <div className="space-y-8">
                    {/* Logo Section */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="relative group w-32 h-32 shrink-0">
                        <label className="cursor-pointer block w-full h-full relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-500 transition-colors flex items-center justify-center bg-gray-50">
                          {localContent.siteConfig.logo ? (
                            <img src={localContent.siteConfig.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                          ) : (
                            <Upload className="w-8 h-8 text-gray-300" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                            <Camera className="w-6 h-6 mb-1" />
                            CHANGE LOGO
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleLogoUpload} 
                          />
                        </label>
                      </div>
                      <div className="grow space-y-4 w-full">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Logo & Identity</h4>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Logo URL</label>
                          <input
                            value={localContent.siteConfig.logo}
                            onChange={(e) => updateConfig('logo', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                            placeholder="Logo Image URL"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="pt-8 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Contact Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">Contact Email</label>
                          <div className="relative">
                            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              value={localContent.siteConfig.contactEmail}
                              onChange={(e) => updateConfig('contactEmail', e.target.value)}
                              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">Contact Phone</label>
                          <div className="relative">
                            <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              value={localContent.siteConfig.contactPhone}
                              onChange={(e) => updateConfig('contactPhone', e.target.value)}
                              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="pt-8 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Social Media Links</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Instagram</label>
                            <div className="relative">
                              <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                value={localContent.siteConfig.instagramUrl}
                                onChange={(e) => updateConfig('instagramUrl', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="https://instagram.com/..."
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Facebook</label>
                            <div className="relative">
                              <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                value={localContent.siteConfig.facebookUrl}
                                onChange={(e) => updateConfig('facebookUrl', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="https://facebook.com/..."
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Twitter</label>
                            <div className="relative">
                              <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                value={localContent.siteConfig.twitterUrl}
                                onChange={(e) => updateConfig('twitterUrl', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="https://twitter.com/..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionSection>
              </div>

              {/* SAVE CHANGES - STICKY BAR */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-4">
                  {hasUnsavedChanges && (
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      Unsaved Changes
                    </div>
                  )}
                  <button
                    onClick={async () => {
                      setSaving(true);
                      await refreshContent();
                      setSaving(false);
                      alert('Data refreshed from server');
                    }}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Refresh from Server
                  </button>
                </div>
                
                <button
                  onClick={handleSave}
                  disabled={saving || !hasUnsavedChanges}
                  className={cn(
                    "flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-lg",
                    hasUnsavedChanges 
                      ? "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  )}
                >
                  <Save className="w-6 h-6" />
                  {saving ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>

              {/* Debug Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <button 
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
                </button>
                {showDebug && (
                  <div className="mt-4 p-4 bg-gray-900 text-green-400 rounded-xl font-mono text-[10px] overflow-auto max-h-96">
                    <p className="mb-2 text-gray-500 border-b border-gray-800 pb-2">// LOCAL STATE (PENDING SAVE)</p>
                    <pre>{JSON.stringify({
                      recommendationsCount: localContent.recommendations?.length || 0,
                      recommendations: localContent.recommendations
                    }, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
                <p className="text-gray-500 mb-8">
                  Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirm.name}"</span>? 
                  This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Recommendation Modal */}
      <AnimatePresence>
        {isAddingRecommendation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingRecommendation(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New Recommendation</h2>
                <button 
                  onClick={() => setIsAddingRecommendation(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Item Name</label>
                    <input
                      autoFocus
                      value={newRecData.name}
                      onChange={(e) => setNewRecData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Signature Truffle Pasta"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                    <textarea
                      value={newRecData.description}
                      onChange={(e) => setNewRecData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Describe this culinary masterpiece..."
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Price</label>
                      <input
                        type="number"
                        value={newRecData.price ?? ''}
                        onChange={(e) => setNewRecData(prev => ({ ...prev, price: e.target.value === '' ? undefined : parseFloat(e.target.value) }))}
                        placeholder="0.00"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                      <select
                        value={newRecData.category}
                        onChange={(e) => setNewRecData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      >
                        {(localContent?.categories || []).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Dish Image</label>
                    <div className="relative group aspect-video">
                      <label className="cursor-pointer block w-full h-full relative overflow-hidden rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-orange-500 transition-colors">
                        {newRecData.image ? (
                          <>
                            <img src={newRecData.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg text-orange-600 z-10">
                              <Edit2 className="w-4 h-4" />
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold">
                              <Camera className="w-6 h-6 mb-1" />
                              CHANGE IMAGE
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-300 mb-2" />
                            <span className="text-xs font-medium text-gray-400">Click to upload image</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleNewRecImageUpload} 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setIsAddingRecommendation(false)}
                  className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewRecommendation}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Menu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Dish Modal */}
      <AnimatePresence>
        {isAddingDish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingDish(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New Menu Dish</h2>
                <button 
                  onClick={() => setIsAddingDish(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Item Name</label>
                    <input
                      autoFocus
                      value={newDishData.name}
                      onChange={(e) => setNewDishData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Jollof Rice Special"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                    <textarea
                      value={newDishData.description}
                      onChange={(e) => setNewDishData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Describe the dish details..."
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Price</label>
                      <input
                        type="number"
                        value={newDishData.price ?? ''}
                        onChange={(e) => setNewDishData(prev => ({ ...prev, price: e.target.value === '' ? undefined : parseFloat(e.target.value) }))}
                        placeholder="0.00"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                      <select
                        value={newDishData.category}
                        onChange={(e) => setNewDishData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      >
                        {(localContent?.categories || []).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Dish Image</label>
                    <div className="relative group aspect-video">
                      <label className="cursor-pointer block w-full h-full relative overflow-hidden rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-orange-500 transition-colors">
                        {newDishData.image ? (
                          <>
                            <img src={newDishData.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg text-orange-600 z-10">
                              <Edit2 className="w-4 h-4" />
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold">
                              <Camera className="w-6 h-6 mb-1" />
                              CHANGE IMAGE
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-300 mb-2" />
                            <span className="text-xs font-medium text-gray-400">Click to upload image</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleNewDishImageUpload} 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setIsAddingDish(false)}
                  className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewDish}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Menu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Catering Package Modal */}
      <AnimatePresence>
        {isAddingCateringPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingCateringPackage(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New Catering Package</h2>
                <button 
                  onClick={() => setIsAddingCateringPackage(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Package Name</label>
                    <input
                      autoFocus
                      value={newPackageData.name}
                      onChange={(e) => setNewPackageData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Corporate Lunch Special"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                    <textarea
                      value={newPackageData.description}
                      onChange={(e) => setNewPackageData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Describe what's included in the package..."
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Price</label>
                      <input
                        type="number"
                        value={newPackageData.pricePerPerson}
                        onChange={(e) => setNewPackageData(prev => ({ ...prev, pricePerPerson: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Max Guests (Optional)</label>
                      <input
                        type="number"
                        value={newPackageData.maxGuests ?? ''}
                        onChange={(e) => setNewPackageData(prev => ({ ...prev, maxGuests: e.target.value === '' ? undefined : parseInt(e.target.value) || 0 }))}
                        placeholder="No limit"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Included Items</label>
                    <div className="space-y-2">
                      {(newPackageData.items || []).map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            value={item}
                            onChange={(e) => {
                              const newItems = [...(newPackageData.items || [])];
                              newItems[idx] = e.target.value;
                              setNewPackageData(prev => ({ ...prev, items: newItems }));
                            }}
                            placeholder={`Item ${idx + 1}`}
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                          <button
                            onClick={() => {
                              const newItems = (newPackageData.items || []).filter((_, i) => i !== idx);
                              setNewPackageData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newItems = [...(newPackageData.items || []), ''];
                          setNewPackageData(prev => ({ ...prev, items: newItems }));
                        }}
                        className="flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-all p-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setIsAddingCateringPackage(false)}
                  className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewCateringPackage}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Package
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccordionSection({ title, isOpen, onClick, children }: { title: string, isOpen: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        onClick={onClick}
        className="w-full px-8 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {isOpen ? <ChevronDown className="w-6 h-6 text-orange-600" /> : <ChevronRight className="w-6 h-6 text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 border-t border-gray-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

