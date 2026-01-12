import { useFadeUpScroll } from '@/hooks/useScrollAnimations';
import bestsellerBanner from '@/assets/bestseller-banner.jpg';

const BestsellerSection = () => {
  const contentRef = useFadeUpScroll({ duration: 1, yOffset: 50 });

  return (
    <section className="relative overflow-hidden">
      <div className="relative">
        <img
          src={bestsellerBanner}
          alt="Bestseller Brigade - Top selling ethnic wear"
          className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div ref={contentRef} className="text-center">
            <p className="font-script text-gold text-3xl md:text-5xl mb-2">Bestseller</p>
            <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-widest uppercase mb-6">
              Brigade
            </h2>
            <a 
              href="#" 
              className="inline-flex items-center gap-2 font-body text-sm tracking-widest text-foreground border-b-2 border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
            >
              SHOP NOW <span className="text-lg">›</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestsellerSection;
