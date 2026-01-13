import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import heroBanner from '@/assets/hero-banner.jpg';

const HeroBanner = () => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Animate banner content on mount
    gsap.fromTo(
      contentRef.current,
      {
        scale: 0.8,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2,
      }
    );
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Main banner */}
      <div className="relative">
        <img
          src={heroBanner}
          alt="Shaadi Carnival Sale - Beautiful bridal lehengas"
          className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
        />
        
        {/* Overlay content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div ref={contentRef} className="relative bg-primary/90 text-primary-foreground px-8 py-6 md:px-16 md:py-10 text-center corner-flourish">
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-gold"></div>
            <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-gold"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-gold"></div>
            <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-gold"></div>
            
            <div className="space-y-2">
              <p className="font-script text-gold text-2xl md:text-3xl">Shaadi</p>
              <h2 className="font-display text-2xl md:text-4xl uppercase tracking-wider">
                Carnival
              </h2>
              <div className="w-px h-12 bg-gold mx-auto my-2"></div>
              <p className="font-script text-gold text-xl md:text-2xl">Flash</p>
              <h3 className="font-display text-xl md:text-3xl uppercase tracking-wider">
                Sale
              </h3>
            </div>
            
            <div className="mt-6 space-y-2">
              <p className="font-display text-3xl md:text-5xl font-bold">FLAT 50% OFF</p>
              <p className="font-body text-lg md:text-xl tracking-widest uppercase">Lehengas</p>
            </div>
            
            <Link to="/shop/lehengas" className="mt-6 bg-background text-foreground px-8 py-3 font-body text-sm tracking-widest uppercase hover:bg-gold hover:text-foreground transition-all duration-300 border border-background hover:border-gold inline-block text-center">
              SHOP NOW
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
