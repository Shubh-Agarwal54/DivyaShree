import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import './NavBar.css'

const navLinks = [
  { label: 'SALE', to: '/sale', highlight: true },
  { label: 'BESTSELLERS', to: '/bestsellers' },
  { label: 'NEW ARRIVALS', to: '/new-arrivals' },
  { label: 'SAREES', to: '/shop/sarees' },
  { label: 'LEHENGAS', to: '/shop/lehengas' },
  { label: 'SUITS & SETS', to: '/shop/suits-sets' },
  { label: 'GOWNS & KURTIS', to: '/shop/gowns' },
  { label: 'OCCASION', to: '/occasion' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getCartItemCount } = useCart();
  const cartCount = getCartItemCount();

  return (
    <header className="sticky top-0 z-50 bg-background">
      {/* Top announcement bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 px-4">
        <p className="text-xs md:text-sm font-body tracking-wide">
          FREE SHIPPING ON ORDERS ABOVE ₹2999 | COD AVAILABLE | EASY RETURNS
        </p>
      </div>

      {/* Main navbar */}
      <nav className="border-b border-border bg-background">
        <div className="container mx-auto px-4">
          {/* Top row - Logo, Search, Icons */}
          <div className="flex items-center justify-between py-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Search bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-xs">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for Sarees, Lehengas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-sm bg-background text-sm font-body focus:outline-none focus:border-primary"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              </div>
            </div>

            {/* Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 lg:relative lg:left-auto lg:translate-x-0 lg:flex-none text-center logo-container">
              <Link to="/" className="inline-block">
                <h1 className="font-display text-2xl md:text-3xl text-primary tracking-wide nav-logo">
                  <span className="text-gold">✦</span> Shree Divya <span className="text-gold">✦</span>
                </h1>
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4 flex-1 lg:flex-none justify-end">
              <Link to="/account" className="hidden md:flex items-center gap-1 text-sm font-body hover:text-primary transition-colors">
                <User size={20} />
                <span className="hidden lg:inline">Account</span>
              </Link>
              <Link to="/wishlist" className="hidden md:flex items-center gap-1 text-sm font-body hover:text-primary transition-colors">
                <Heart size={20} />
                <span className="hidden lg:inline">Wishlist</span>
              </Link>
              <Link to="/cart" className="flex items-center gap-1 text-sm font-body hover:text-primary transition-colors relative">
                <ShoppingBag size={20} />
                <span className="hidden lg:inline">Bag</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 lg:right-6 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search bar - Mobile */}
          <div className="lg:hidden pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for Sarees, Lehengas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-sm bg-background text-sm font-body focus:outline-none focus:border-primary"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center justify-center gap-6 py-3 border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`flex items-center gap-1 text-xs font-body tracking-widest transition-colors hover:text-primary ${
                  link.highlight ? 'text-primary font-semibold' : 'text-foreground'
                }`}
              >
                {link.label}
                {link.hasDropdown && <ChevronDown size={14} />}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg animate-fade-in">
            <div className="container mx-auto px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between py-3 border-b border-border text-sm font-body ${
                    link.highlight ? 'text-primary font-semibold' : 'text-foreground'
                  }`}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown size={16} />}
                </Link>
              ))}
              <div className="flex gap-6 mt-4 pt-4">
                <Link to="/account" className="flex items-center gap-2 text-sm font-body" onClick={() => setIsMenuOpen(false)}>
                  <User size={18} /> Account
                </Link>
                <Link to="/wishlist" className="flex items-center gap-2 text-sm font-body" onClick={() => setIsMenuOpen(false)}>
                  <Heart size={18} /> Wishlist
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
