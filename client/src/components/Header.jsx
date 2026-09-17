import React, { useState, useRef } from 'react';
import { Search, ShoppingBag, Heart, Menu, X, Package, User } from 'lucide-react';

export default function Header({
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  currentUser,
  onOpenAuth,
  onSecretAdminTrigger,
  onSelectCategory,
  searchQuery,
  onSearchChange
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  const handleLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);

    if (logoTapCount.current >= 4) {
      logoTapCount.current = 0;
      onSecretAdminTrigger();
    } else {
      logoTapTimer.current = setTimeout(() => {
        logoTapCount.current = 0;
      }, 1000);
    }
  };

  const handleCategoryClick = (cat) => {
    onSelectCategory(cat);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-zelqia-bg/95 backdrop-blur-md border-b border-zelqia-border/30 transition-all duration-300">
      {/* Top Banner */}
      <div className="bg-zelqia-gold/10 border-b border-zelqia-border/20 py-1.5 px-2 text-center flex items-center justify-between max-w-7xl mx-auto">
        <span className="hidden sm:inline-block text-[10px] text-zelqia-muted font-sans">
          {currentUser ? `Welcome back, ${currentUser.name}` : 'Demi-Fine Royal Jewellery'}
        </span>
        <p className="text-[10px] md:text-[11px] tracking-widest text-zelqia-gold uppercase font-sans font-medium mx-auto">
          Pay via UPI & Get Extra 5% Off | Free Insured Shipping
        </p>
        <button
          onClick={onOpenOrders}
          className="hidden sm:flex items-center gap-1 text-[10px] text-zelqia-gold hover:underline uppercase tracking-wider"
        >
          <Package size={12} /> My Orders
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-zelqia-ivory p-2 -ml-2"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand Logo */}
        <div
          onClick={handleLogoTap}
          className="flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform"
        >
          <h1 className="font-serif text-2xl md:text-3xl tracking-[0.22em] text-zelqia-gold uppercase font-bold">
            ZELQIA
          </h1>
          <span className="text-[8px] tracking-[0.3em] text-zelqia-gold/80 uppercase -mt-1 font-sans">
            Jewellery & Accessories
          </span>
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-zelqia-ivory/80 font-sans">
          {['ALL', 'Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Men'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="hover:text-zelqia-gold transition-colors"
            >
              {cat === 'Men' ? "Men's" : cat}
            </button>
          ))}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3 md:gap-4 text-zelqia-ivory">
          {/* Live Search */}
          <div className="hidden sm:flex items-center bg-zelqia-card border border-zelqia-border/40 px-3 py-1.5 rounded-sm">
            <Search size={14} className="text-zelqia-gold mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search pieces..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent text-xs text-zelqia-ivory focus:outline-none w-28 placeholder:text-zelqia-muted"
            />
          </div>

          {/* User Profile / Zepto Login */}
          <button
            onClick={onOpenAuth}
            className="hover:text-zelqia-gold transition-colors p-1"
            title="Profile"
          >
            <User size={19} className={currentUser ? "text-zelqia-gold" : ""} />
          </button>

          {/* My Orders Button */}
          <button
            onClick={onOpenOrders}
            className="hover:text-zelqia-gold transition-colors p-1"
            title="My Orders"
          >
            <Package size={19} />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="relative hover:text-zelqia-gold transition-colors p-1"
            title="Wishlist"
          >
            <Heart size={19} className={wishlistCount > 0 ? "fill-zelqia-gold text-zelqia-gold" : ""} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-zelqia-gold text-zelqia-bg text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button onClick={onOpenCart} className="relative hover:text-zelqia-gold transition-colors p-1">
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-zelqia-gold text-zelqia-bg text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zelqia-card border-b border-zelqia-border/50 px-5 py-4 space-y-3">
          <div className="flex items-center bg-zelqia-bg border border-zelqia-border/60 px-3 py-2 rounded-sm mb-3">
            <Search size={14} className="text-zelqia-gold mr-2" />
            <input
              type="text"
              placeholder="Search rings, necklaces..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent text-xs text-zelqia-ivory focus:outline-none w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs uppercase tracking-wider font-sans">
            {['ALL', 'Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Men'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className="text-left py-2 px-3 bg-zelqia-bg/60 border border-zelqia-border/30 text-zelqia-ivory hover:text-zelqia-gold rounded-sm"
              >
                {cat === 'Men' ? "Men's" : cat}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-zelqia-border/40 flex justify-between">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenOrders();
              }}
              className="text-xs uppercase tracking-wider text-zelqia-gold flex items-center gap-1 font-semibold"
            >
              <Package size={14} /> My Orders & Tracking
            </button>
          </div>
        </div>
      )}
    </header>
  );
}