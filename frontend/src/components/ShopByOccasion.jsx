import { Link } from 'react-router-dom';
import { useFadeUpScroll, useStaggerScroll } from '@/hooks/useScrollAnimations';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import product6 from '@/assets/product-6.jpg';
import product8 from '@/assets/product-8.jpg';

const occasions = [
  {
    id: 1,
    name: 'DIWALI',
    image: product4,
    link: '/occasion/diwali',
  },
  {
    id: 2,
    name: 'PUJA',
    image: product6,
    link: '/occasion/puja',
  },
  {
    id: 3,
    name: 'HALDI/SANGEET',
    image: product3,
    link: '/occasion/haldi-sangeet',
  },
  {
    id: 4,
    name: 'KARWACHAUTH',
    image: product8,
    link: '/occasion/karwachauth',
  },
];

const ShopByOccasion = () => {
  const titleRef = useFadeUpScroll({ duration: 0.8 });
  const gridRef = useStaggerScroll({ stagger: 0.15, yOffset: 40 });

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <p ref={titleRef} className="section-subtitle mb-8">BROWSE BY MOMENT</p>
        
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {occasions.map((occasion) => (
            <Link
              key={occasion.id}
              to={occasion.link}
              className="group"
            >
              <div className="relative overflow-hidden rounded-full aspect-square">
                <img
                  src={occasion.image}
                  alt={occasion.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="font-display text-sm md:text-lg text-background text-center px-4">
                    {occasion.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByOccasion;
