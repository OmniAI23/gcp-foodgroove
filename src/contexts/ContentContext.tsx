import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dish, CateringPackage, Testimonial, AboutPage, AboutSection } from '../types';

interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  logo: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
}

interface Content {
  dishes: Dish[];
  recommendations: Dish[];
  categories: string[];
  cateringPackages: CateringPackage[];
  testimonials: Testimonial[];
  siteConfig: SiteConfig;
  aboutPage: AboutPage;
  lastUpdated?: string;
}

interface ContentContextType {
  content: Content | null;
  loading: boolean;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    console.log('Fetching content from API...');
    try {
      const response = await fetch(`/api/content?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Content fetched successfully:', {
          recommendations: data.recommendations?.length || 0,
          dishes: data.dishes?.length || 0
        });
        setContent(data);
      } else {
        console.error('Failed to fetch content:', response.status);
      }
    } catch (error) {
      console.error('Network error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading, refreshContent: fetchContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
