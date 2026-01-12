import modernShehzadi from '@/assets/modern-shehzadi.jpg';

const ModernShehzadi = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-0 items-center">
          {/* Image */}
          <div className="relative overflow-hidden">
            <img
              src={modernShehzadi}
              alt="Modern Shehzadi - Bridal lehengas for the modern bride"
              className="w-full h-[400px] md:h-[600px] object-cover"
            />
          </div>
          
          {/* Content */}
          <div className="bg-cream-dark p-8 md:p-16 flex flex-col justify-center items-center text-center h-[400px] md:h-[600px]">
            <p className="font-script text-gold text-3xl md:text-5xl mb-2">Modern</p>
            <h2 className="font-display text-4xl md:text-6xl text-primary tracking-wider uppercase mb-4">
              Shehzadi
            </h2>
            <p className="font-body text-sm md:text-base text-muted-foreground tracking-wider uppercase mb-8 max-w-sm">
              Bridal Lehengas for the Modern Bride
            </p>
            <a href='/shop/lehengas' ><button className="btn-outline">
              SHOP NOW
            </button> </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernShehzadi;
