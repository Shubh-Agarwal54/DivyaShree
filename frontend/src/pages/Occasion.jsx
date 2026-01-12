import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChevronRight, Calendar } from 'lucide-react';
import { useFadeUpScroll, useStaggerScroll } from '@/hooks/useScrollAnimations';

const occasions = [
  {
    id: 1,
    name: 'Wedding',
    description: 'Bridal lehengas, sarees, and designer wear for the big day',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
    link: '/occasion/wedding',
    color: 'from-red-600 to-pink-600',
  },
  {
    id: 2,
    name: 'Festival',
    description: 'Traditional attire for Diwali, Navratri, and more',
    image: 'https://images.unsplash.com/photo-1583623733237-4d5764e9c7f3?w=600&h=400&fit=crop',
    link: '/occasion/festival',
    color: 'from-orange-600 to-yellow-600',
  },
  {
    id: 3,
    name: 'Party',
    description: 'Glamorous gowns and cocktail attire',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=400&fit=crop',
    link: '/occasion/party',
    color: 'from-purple-600 to-indigo-600',
  },
  {
    id: 4,
    name: 'Reception',
    description: 'Elegant ensembles for wedding receptions',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&h=400&fit=crop',
    link: '/occasion/reception',
    color: 'from-pink-600 to-rose-600',
  },
  {
    id: 5,
    name: 'Sangeet',
    description: 'Vibrant outfits for dance and celebration',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=400&fit=crop',
    link: '/occasion/sangeet',
    color: 'from-fuchsia-600 to-pink-600',
  },
  {
    id: 6,
    name: 'Casual',
    description: 'Comfortable kurtis for everyday wear',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&h=400&fit=crop',
    link: '/occasion/casual',
    color: 'from-teal-600 to-cyan-600',
  },
];

export default function Occasion() {
  const titleRef = useFadeUpScroll({ duration: 0.8 });
  const gridRef = useStaggerScroll({ stagger: 0.15, yOffset: 40 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-body mb-6 text-cream-dark/80">
            <Link to="/" className="hover:text-cream transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-cream">Occasion</span>
          </div>

          <div ref={titleRef} className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calendar size={40} />
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl">
                SHOP BY OCCASION
              </h1>
            </div>
            <p className="font-body text-xl md:text-2xl mb-4">
              Perfect Outfits for Every Celebration
            </p>
            <p className="font-body text-lg text-cream-dark/90 max-w-2xl mx-auto">
              From weddings to casual outings, find the ideal ethnic wear for any occasion
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Occasions Grid */}
          <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {occasions.map((occasion) => (
              <Link
                key={occasion.id}
                to={occasion.link}
                className="group relative overflow-hidden rounded-lg shadow-card hover:shadow-hover transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={occasion.image}
                    alt={occasion.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${occasion.color} opacity-60 group-hover:opacity-70 transition-opacity`}></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="font-display text-2xl md:text-3xl mb-2">
                    {occasion.name}
                  </h3>
                  <p className="font-body text-sm md:text-base text-white/90">
                    {occasion.description}
                  </p>
                  
                  {/* Arrow */}
                  <div className="mt-4 flex items-center gap-2 font-body text-sm uppercase tracking-wider">
                    <span>Explore</span>
                    <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-16 bg-cream-dark p-8 md:p-12 rounded-lg">
            <h3 className="font-display text-2xl md:text-4xl text-center text-foreground mb-8">
              Why Shop by Occasion?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={32} className="text-primary" />
                </div>
                <h4 className="font-display text-lg mb-2">Event-Perfect</h4>
                <p className="font-body text-sm text-muted-foreground">
                  Curated collections for specific events and celebrations
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-display text-lg mb-2">Easy Selection</h4>
                <p className="font-body text-sm text-muted-foreground">
                  Find the right outfit without browsing entire catalog
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h4 className="font-display text-lg mb-2">Style Confidence</h4>
                <p className="font-body text-sm text-muted-foreground">
                  Dress appropriately and stylishly for every occasion
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
