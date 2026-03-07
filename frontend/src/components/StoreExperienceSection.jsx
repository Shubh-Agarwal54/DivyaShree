import { useEffect, useState } from 'react';
import storeExperience from '@/assets/store-experience.jpg';
import { bannerAPI } from '@/services/api';


const StoreExperienceSection = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    bannerAPI.getAll().then((res) => {
      if (res.success) setData(res.data?.['store-experience']);
    }).catch(() => {});
  }, []);

  const t = data?.texts || {};
  const imgSrc = data?.imageUrl || storeExperience;

  return (
    <section className="relative overflow-hidden">
      <div className="relative">
        <img
          src={imgSrc}
          alt="Experience our stores - Visit our boutique"
          className="w-full h-[400px] md:h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
          <div className="text-center">
            <p className="font-script text-gold text-3xl md:text-5xl mb-2">{t.scriptText || 'Experience Our'}</p>
            <h2 className="font-display text-5xl md:text-7xl text-background tracking-widest uppercase mb-8">
              {t.displayTitle || 'STORES'}
            </h2>
            <a href={t.buttonLink || '/about/stores'}>
              <button className="bg-background text-foreground px-10 py-4 font-body text-sm tracking-widest uppercase hover:bg-gold transition-all duration-300 border border-background hover:border-gold">
                {t.buttonText || 'VISIT US'}
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreExperienceSection;
