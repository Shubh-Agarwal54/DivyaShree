import { Link } from 'react-router-dom';
import { useFadeUpScroll, useStaggerScroll } from '@/hooks/useScrollAnimations';
import curated1 from '@/assets/curated-1.jpg';
import curated2 from '@/assets/curated-2.jpg';
import curated3 from '@/assets/curated-3.jpg';
import curated4 from '@/assets/curated-4.jpg';

const fabrics = [
  {
    id: 1,
    name: 'GEORGETTE GLAM',
    image: curated1,
    path: '/fabric/georgette-glam',
  },
  {
    id: 2,
    name: 'SILK SAREES',
    image: curated2,
    path: '/fabric/silk-sarees',
  },
  {
    id: 3,
    name: 'ORGANZA SUITS',
    image: curated3,
    path: '/fabric/organza-suits',
  },
  {
    id: 4,
    name: 'TISSUE SAREES',
    image: curated4,
    path: '/fabric/tissue-sarees',
  },
];

const FabricSection = () => {
  const titleRef = useFadeUpScroll({ duration: 0.8 });
  const gridRef = useStaggerScroll({ stagger: 0.15, yOffset: 40 });

  return (
    <section className="py-12 md:py-16 bg-cream-dark">
      <div className="container mx-auto px-4">
        <p ref={titleRef} className="section-subtitle mb-8">SHOP BY FABRIC</p>
        
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {fabrics.map((fabric) => (
            <Link
              key={fabric.id}
              to={fabric.path}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg aspect-[3/4]">
                <img
                  src={fabric.image}
                  alt={fabric.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-sm md:text-base text-background text-center">
                    {fabric.name}
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

export default FabricSection;
