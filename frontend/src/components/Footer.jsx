import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  shop: [
    'Sarees',
    'Lehengas',
    'Suits & Sets',
    'Gowns',
    'Kurtis',
    'Accessories',
  ],
  help: [
    'Track Order',
    'Returns & Exchanges',
    'Shipping Info',
    'Size Guide',
    'FAQs',
    'Contact Us',
  ],
  about: [
    'Our Story',
    'Stores'
  ],
  policies: [
    'Privacy Policy',
    'Terms of Service',
    'Refund Policy',
    'Shipping Policy',
  ],
};

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-6 lg:mb-0">
            <h3 className="font-display text-2xl mb-4">
              <span className="text-gold">✦</span>  Shree Divya <span className="text-gold">✦</span>
            </h3>
            <p className="font-body text-sm text-primary-foreground/80 mb-6">
              Celebrating the beauty of Indian tradition with contemporary elegance. Your destination for exquisite ethnic wear.
            </p>
            
            {/* Social icons */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-primary-foreground/30 rounded-full flex items-center justify-center hover:bg-gold hover:border-gold transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-primary-foreground/30 rounded-full flex items-center justify-center hover:bg-gold hover:border-gold transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-primary-foreground/30 rounded-full flex items-center justify-center hover:bg-gold hover:border-gold transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-primary-foreground/30 rounded-full flex items-center justify-center hover:bg-gold hover:border-gold transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/shop/sarees" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Sarees</Link></li>
              <li><Link to="/shop/lehengas" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Lehengas</Link></li>
              <li><Link to="/shop/suits-sets" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Suits & Sets</Link></li>
              <li><Link to="/shop/gowns" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Gowns</Link></li>
              <li><Link to="/shop/kurtis" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Kurtis</Link></li>
              <li><Link to="/shop/accessories" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-2">
              <li><Link to="/help/track-order" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Track Order</Link></li>
              <li><Link to="/help/returns-exchanges" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/help/shipping-info" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Shipping Info</Link></li>
              <li><Link to="/help/size-guide" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Size Guide</Link></li>
              <li><Link to="/help/faqs" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">FAQs</Link></li>
              <li><Link to="/help/contact" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider mb-4">About</h4>
            <ul className="space-y-2">
              <li><Link to="/about/our-story" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Our Story</Link></li>
              <li><Link to="/about/stores" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">Stores</Link></li>
            </ul>
          </div>

          {/* Contact & App */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-display text-sm uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span className="font-body text-sm text-primary-foreground/80">
                  Sanjay Place Agra, Uttar Pradesh 282002
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0" />
                <a href="tel:+918979893427" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors">
                  +91 8979893427
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0" />
                <a href="mailto:divyashreefashion2025@gmail.com" className="font-body text-sm text-primary-foreground/80 hover:text-gold transition-colors break-all">
                  divyashreefashion2025@gmail.com
                </a>
              </li>
            </ul>
            
            {/* App download */}
            <h4 className="font-display text-sm uppercase tracking-wider mb-3">Download App</h4>
            <div className="flex gap-2">
              <a href="#" className="block">
                <div className="bg-foreground text-background px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gold transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M17.523 2.047c-.518-.01-1.19.172-1.988.61l-8.8 4.82c-1.308.72-2.147 1.32-2.524 1.82-.41.54-.522 1.19-.354 1.95.168.76.564 1.59 1.19 2.49.625.9 1.208 1.55 1.748 1.95.54.4 1.16.47 1.85.2.69-.27 1.565-.78 2.625-1.52l1.29-.9 1.22 1.85c.548.83 1.14 1.52 1.775 2.08.635.56 1.305.93 2.01 1.11.705.18 1.395.16 2.07-.06.675-.22 1.28-.6 1.815-1.14.535-.54.97-1.21 1.305-2.01.335-.8.535-1.68.6-2.64.065-.96.01-1.94-.165-2.94-.175-1-.465-1.94-.87-2.82-.405-.88-.915-1.65-1.53-2.31-.615-.66-1.305-1.16-2.07-1.5-.765-.34-1.575-.53-2.43-.57l-.203-.01z"/>
                  </svg>
                  <div>
                    <p className="text-[8px] leading-tight">GET IT ON</p>
                    <p className="text-xs font-semibold leading-tight">Google Play</p>
                  </div>
                </div>
              </a>
              <a href="#" className="block">
                <div className="bg-foreground text-background px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gold transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div>
                    <p className="text-[8px] leading-tight">Download on the</p>
                    <p className="text-xs font-semibold leading-tight">App Store</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body text-xs text-primary-foreground/60 text-center md:text-left">
              © 2026 Shree Divya. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/policies/privacy" className="font-body text-xs text-primary-foreground/60 hover:text-gold transition-colors">Privacy Policy</Link>
              <Link to="/policies/terms" className="font-body text-xs text-primary-foreground/60 hover:text-gold transition-colors">Terms of Service</Link>
              <Link to="/policies/refund" className="font-body text-xs text-primary-foreground/60 hover:text-gold transition-colors">Refund Policy</Link>
              <Link to="/policies/shipping" className="font-body text-xs text-primary-foreground/60 hover:text-gold transition-colors">Shipping Policy</Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-body text-xs text-primary-foreground/60">We Accept:</span>
              <div className="flex gap-1">
                {['Visa', 'MC', 'Amex', 'UPI'].map((payment) => (
                  <span key={payment} className="bg-primary-foreground/10 px-2 py-1 rounded text-[10px] font-body">
                    {payment}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
