import { Star } from 'lucide-react';
import { useFadeUpScroll, useStaggerScroll } from '@/hooks/useScrollAnimations';
import product1 from '@/assets/product-1.jpg';
import product5 from '@/assets/product-5.jpg';
import product7 from '@/assets/product-7.jpg';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    comment: 'Absolutely stunning lehenga! The quality exceeded my expectations. Everyone at my wedding complimented me on the outfit. Will definitely shop again!',
    image: product1,
    product: 'Pink Silk Lehenga',
  },
  {
    id: 2,
    name: 'Ananya Patel',
    location: 'Delhi',
    rating: 5,
    comment: 'The bridal collection is to die for! Found my dream wedding outfit here. The craftsmanship and attention to detail is impeccable.',
    image: product5,
    product: 'Red Bridal Lehenga',
  },
  {
    id: 3,
    name: 'Kavya Reddy',
    location: 'Bangalore',
    rating: 5,
    comment: 'Love the variety of designs and the customer service was excellent. The outfit arrived perfectly packaged and fit like a dream!',
    image: product7,
    product: 'Organza Suit Set',
  },
];

const TestimonialSection = () => {
  const titleRef = useFadeUpScroll({ duration: 0.8 });
  const gridRef = useStaggerScroll({ stagger: 0.2, yOffset: 50 });

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div ref={titleRef}>
          <p className="section-subtitle mb-2"> SHREE DIVYA CUSTOMERS TELL IT LIKE IT IS</p>
          <h2 className="section-title mb-10">What Our Customers Say</h2>
        </div>
        
        <div ref={gridRef} className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-lg overflow-hidden shadow-card"
            >
              {/* Product image */}
              <div className="relative h-48 md:h-56 overflow-hidden">
                <img
                  src={testimonial.image}
                  alt={testimonial.product}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-background/90 px-3 py-1 rounded-sm">
                  <p className="text-xs font-body text-foreground">{testimonial.product}</p>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-gold text-gold" />
                  ))}
                </div>
                
                {/* Comment */}
                <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-4">
                  "{testimonial.comment}"
                </p>
                
                {/* Author */}
                <div>
                  <p className="font-display text-sm text-foreground">{testimonial.name}</p>
                  <p className="font-body text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
