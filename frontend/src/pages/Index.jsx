import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import CategorySection from '@/components/CategorySection';
import BestsellerSection from '@/components/BestsellerSection';
import CuratedSection from '@/components/CuratedSection';
import ModernShehzadi from '@/components/ModernShehzadi';
import AppExclusive from '@/components/AppExclusive';
import ProductGrid from '@/components/ProductGrid';
import FabricSection from '@/components/FabricSection';
import StoreExperienceSection from '@/components/StoreExperienceSection';
import ShopByOccasion from '@/components/ShopByOccasion';
import TestimonialSection from '@/components/TestimonialSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroBanner />
        <CategorySection />
        <BestsellerSection />
        <CuratedSection />
        <ModernShehzadi />
        <AppExclusive />
        <ProductGrid subtitle="IN FOCUS NOW" />
        <FabricSection />
        <StoreExperienceSection />
        <ShopByOccasion />
        <TestimonialSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
