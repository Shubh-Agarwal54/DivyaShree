import { Link } from 'react-router-dom';
import { useFadeUpScroll, useStaggerScroll } from '@/hooks/useScrollAnimations';
import curated1 from '@/assets/curated-1.jpg';
import curated2 from '@/assets/curated-2.jpg';
import curated3 from '@/assets/curated-3.jpg';
import curated4 from '@/assets/curated-4.jpg';

const curatedItems = [
  {
    id: 1,
    name: "SNEAK PEEK & WHAT'S NEW",
    image: curated1,
    link: '/curated/sneak-peek',
  },
  {
    id: 2,
    name: 'OSHI CRUSHERS',
    image: curated2,
    link: '/curated/oshi-crushers',
  },
  {
    id: 3,
    name: 'CULT FAVES',
    image: curated3,
    link: '/curated/cult-faves',
  },
  {
    id: 4,
    name: 'CURATED FOR YOU',
    image: curated4,
    link: '/curated/curated-for-you',
  },
];

const CuratedSection = () => {
  const titleRef = useFadeUpScroll({ duration: 0.8 });
  const gridRef = useStaggerScroll({ stagger: 0.15, yOffset: 40 });

  return (
    <section className="py-12 md:py-16 bg-cream-dark">
      <div className="container mx-auto px-4">
        <p ref={titleRef} className="section-subtitle mb-8">CURATED EDITS</p>
        
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {curatedItems.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg aspect-square">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-xs md:text-sm text-background text-center leading-tight">
                    {item.name}
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

export default CuratedSection;
