import { useEffect, useState } from 'react';
import appExclusive from '@/assets/app-exclusive.jpg';
import { bannerAPI } from '@/services/api';


const AppExclusive = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    bannerAPI.getAll().then((res) => {
      if (res.success) setData(res.data?.['app-exclusive']);
    }).catch(() => {});
  }, []);

  const t = data?.texts || {};
  const imgSrc = data?.imageUrl || appExclusive;

  return (
    <section className="relative overflow-hidden">
      <div className="relative">
        <img
          src={imgSrc}
          alt="App Exclusive Offer"
          className="w-full h-[250px] md:h-[350px] object-cover"
        />
        <div className="absolute inset-0 bg-foreground/30 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg">
              <p className="font-display text-3xl md:text-5xl text-background uppercase tracking-wider">
                {t.displayTitle || 'APP EXCLUSIVE'}
              </p>
              <p className="font-script text-gold text-2xl md:text-4xl mt-2">{t.scriptText || 'Offer'}</p>
              <div className="mt-6 flex items-center gap-4">
                <div>
                  <p className="font-display text-4xl md:text-6xl text-background font-bold">{t.discountText || 'FLAT 15%'}</p>
                  <p className="font-body text-sm text-background tracking-wider">USE CODE</p>
                  <p className="font-display text-lg md:text-xl text-gold font-bold">{t.couponCode || 'APPFIRST'}</p>
                </div>
              </div>
              <button className="mt-6 bg-background text-foreground px-8 py-3 font-body text-sm tracking-widest uppercase hover:bg-gold transition-all duration-300">
                {t.buttonText || 'GET THE APP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppExclusive;
