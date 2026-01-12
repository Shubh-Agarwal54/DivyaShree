import { Link } from 'react-router-dom';
import { useFadeUpScroll, useStaggerScroll } from '@/hooks/useScrollAnimations';
import categoryMehndi from '@/assets/category-mehndi.jpg';
import categorySangeet from '@/assets/category-sangeet.jpg';
import categoryReception from '@/assets/category-reception.jpg';
import categoryBridesquad from '@/assets/category-bridesquad.jpg';

const categories = [
  {
    id: 1,
    name: 'ELEGANT MEHNDI HUES',
    image: categoryMehndi,
    link: '/category/mehndi-hues',
  },
  {
    id: 2,
    name: 'SANGEET & STYLE',
    image: categorySangeet,
    link: '/category/sangeet-style',
  },
  {
    id: 3,
    name: 'RECEPTION ROYALTY',
    image: categoryReception,
    link: '/category/reception-royalty',
  },
  {
    id: 4,
    name: 'BRIDE SQUAD GOALS',
    image: categoryBridesquad,
    link: '/category/bride-squad-goals',
  },
];

const CategorySection = () => {
  const titleRef = useFadeUpScroll({ duration: 0.8 });
  const gridRef = useStaggerScroll({ stagger: 0.15, yOffset: 40 });

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <p ref={titleRef} className="section-subtitle mb-8">YOUR SHAADI MUST-HAVES</p>
        
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="group category-card"
            >
              <div className="relative overflow-hidden rounded-lg aspect-[3/4]">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-sm md:text-base text-background text-center leading-tight">
                    {category.name}
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

export default CategorySection;
