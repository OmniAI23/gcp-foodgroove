import React from 'react';
import { motion } from 'motion/react';
import { History } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

export default function About() {
  const { content, loading } = useContent();

  if (loading || !content) {
    return <div className="pt-32 text-center min-h-screen">Loading...</div>;
  }

  const { aboutPage } = content;

  return (
    <div className="pt-24 min-h-screen flex flex-col">
      {/* Header */}
      <section className="bg-gray-50 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900"
          >
            {aboutPage.hero.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed whitespace-pre-wrap"
          >
            {aboutPage.hero.content}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-32">
          {/* Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 text-orange-600 uppercase tracking-widest text-xs font-bold">
                <History className="w-4 h-4" />
                <span>Our Story</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{aboutPage.story.title}</h2>
              <div className="text-gray-600 leading-relaxed space-y-4 whitespace-pre-wrap">
                {aboutPage.story.content}
              </div>
            </div>
            <div className="relative">
              <img 
                src={aboutPage.story.image} 
                alt={aboutPage.story.title}
                className="rounded-3xl shadow-xl"
              />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
