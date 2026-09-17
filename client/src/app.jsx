import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductDetailPage from './components/ProductDetailPage';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import DropAHintModal from './components/DropAHintModal';
import SizeVisualizerModal from './components/SizeVisualizerModal';
import ShoppableUGC from './components/ShoppableUGC';
import AdminProductManager from './components/AdminProductManager';
import ZeptoAuthModal from './components/ZeptoAuthModal';
import UserProfileDrawer from './components/UserProfileDrawer';
import MyOrdersModal from './components/MyOrdersModal';
import { Sparkles, Shield, RefreshCw, Truck, CheckCircle, ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';
import { shopifyClient } from './shopifyClient';
const API_BASE = 'http://localhost:5000';

export default function App() {
  const [products, setProducts] = useState([]);
  const [ugcPosts, setUgcPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Zepto User Authentication & Profile Drawer
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zelqia_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);

  // Cart & Wishlist Storage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('zelqia_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('zelqia_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCouponPercent, setAppliedCouponPercent] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [hintProductTitle, setHintProductTitle] = useState('Signature ZELQIA Vault');
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    localStorage.setItem('zelqia_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('zelqia_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Live Fetcher from Shopify Storefront API
  // Live Fetcher: Connects to Shopify Storefront
  const loadData = async () => {
    try {
      // 1. Fetch live products from Shopify
      const shopifyProducts = await shopifyClient.getProducts();

      if (shopifyProducts && shopifyProducts.length > 0) {
        console.log('✅ Loaded Live Products from Shopify:', shopifyProducts.length);
        setProducts(shopifyProducts);
      } else {
        // Fallback to local database if Shopify store has 0 products yet
        const prodRes = await fetch(`${API_BASE}/api/products`);
        const prodData = await prodRes.json();
        if (prodData.success) setProducts(prodData.products);
      }

      // 2. Fetch UGC Reels from Backend
      const ugcRes = await fetch(`${API_BASE}/api/ugc`);
      const ugcData = await ugcRes.json();
      if (ugcData.success) setUgcPosts(ugcData.posts);
    } catch (err) {
      console.error('Shopify sync error (using local database fallback):', err);
      const prodRes = await fetch(`${API_BASE}/api/products`);
      const prodData = await prodRes.json();
      if (prodData.success) setProducts(prodData.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Shortcuts: Ctrl+Shift+A (Admin) and Escape (Close All Modals)
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        promptAdminLogin();
      }
      if (e.key === 'Escape') {
        setIsCartOpen(false);
        setIsWishlistOpen(false);
        setIsProfileOpen(false);
        setIsCheckoutOpen(false);
        setIsHintOpen(false);
        setIsSizeOpen(false);
        setIsAuthModalOpen(false);
        setIsMyOrdersOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const promptAdminLogin = () => {
    const pin = window.prompt('ZELQIA Vault Passcode:');
    if (pin === '1234') {
      setIsAdminView(true);
    } else if (pin !== null) {
      alert('Unauthorized access attempt.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zelqia_user');
    setCurrentUser(null);
    setIsProfileOpen(false);
    alert('Logged out successfully from ZELQIA.');
  };

  const handleToggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) return prev.filter((p) => p._id !== product._id);
      return [...prev, product];
    });
  };

  const handleRemoveWishlistItem = (id) => {
    setWishlist((prev) => prev.filter((p) => p._id !== id));
  };

  const handleMoveWishlistToCart = (product) => {
    handleAddToCart({ product, variant: product.variants?.[0] });
    handleRemoveWishlistItem(product._id);
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleAddToCart = (item) => {
    const product = item.product || item;
    const variant = item.variant || product.variants?.[0] || {
      sku: `SKU-${Date.now()}`,
      price: product.price || 2999,
      metalTone: 'Yellow Gold',
      images: [product.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800']
    };

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => (i.variant?.sku || i.sku) === variant.sku);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          product,
          variant,
          quantity: 1,
          isGiftWrap: item.isGiftWrap || false,
          giftNote: item.giftNote || ''
        }
      ];
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
    } else {
      const updated = [...cartItems];
      updated[index].quantity = newQty;
      setCartItems(updated);
    }
  };

  const handleStartCheckout = () => {
    setIsCartOpen(false);
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleBuyNow = (item) => {
    handleAddToCart(item);
    setIsCartOpen(false);
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleRemoveItem = (index) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleOrderSuccess = (order) => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    setOrderSuccessData(order);
  };

  const handleShopLook = (ugcItem) => {
    const foundProduct = products.find((p) =>
      p.title?.toLowerCase().includes(ugcItem.title?.toLowerCase())
    );
    if (foundProduct) {
      setSelectedProduct(foundProduct);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleAddToCart({
        title: ugcItem.title,
        price: 3499,
        metalTone: 'Yellow Gold',
        images: [ugcItem.image || ugcItem.mediaUrl]
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = searchQuery.trim() === '' || p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 1. ADMIN VIEW
  if (isAdminView) {
    return (
      <AdminProductManager
        onBackToStore={() => {
          setIsAdminView(false);
          loadData();
        }}
      />
    );
  }

  // 2. PRODUCT DETAILS VIEW
  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-zelqia-bg text-zelqia-ivory selection:bg-zelqia-gold selection:text-zelqia-bg">
        <Header
          cartCount={cartItems.reduce((a, c) => a + c.quantity, 0)}
          wishlistCount={wishlist.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenOrders={() => {
            if (!currentUser) setIsAuthModalOpen(true);
            else setIsMyOrdersOpen(true);
          }}
          currentUser={currentUser}
          onOpenAuth={() => {
            if (currentUser) {
              setIsProfileOpen(true);
            } else {
              setIsAuthModalOpen(true);
            }
          }}
          onSecretAdminTrigger={promptAdminLogin}
          onSelectCategory={() => setSelectedProduct(null)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <ProductDetailPage
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onDropHint={(title) => {
            setHintProductTitle(title);
            setIsHintOpen(true);
          }}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQty={handleUpdateCartQty}
          onRemoveItem={handleRemoveItem}
          appliedCouponPercent={appliedCouponPercent}
          onApplyCoupon={setAppliedCouponPercent}
          onProceedCheckout={handleStartCheckout}
        />

        <WishlistDrawer
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          items={wishlist}
          onRemoveItem={handleRemoveWishlistItem}
          onMoveToCart={handleMoveWishlistToCart}
        />

        <UserProfileDrawer
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          currentUser={currentUser}
          onOpenOrders={() => setIsMyOrdersOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onLogout={handleLogout}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          appliedDiscountPercent={appliedCouponPercent}
          onOrderSuccess={handleOrderSuccess}
        />

        <MyOrdersModal
          isOpen={isMyOrdersOpen}
          onClose={() => setIsMyOrdersOpen(false)}
          userPhone={currentUser?.phone}
        />

        <DropAHintModal
          isOpen={isHintOpen}
          onClose={() => setIsHintOpen(false)}
          productTitle={hintProductTitle}
          productUrl={window.location.href}
        />

        <SizeVisualizerModal isOpen={isSizeOpen} onClose={() => setIsSizeOpen(false)} />
      </div>
    );
  }

  const totalCartCount = cartItems.reduce((a, c) => a + c.quantity, 0);

  // 3. MAIN STOREFRONT VIEW
  return (
    <div className="min-h-screen bg-zelqia-bg text-zelqia-ivory pb-16 md:pb-0 overflow-x-hidden selection:bg-zelqia-gold selection:text-zelqia-bg">
      <Header
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrders={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setIsMyOrdersOpen(true);
        }}
        currentUser={currentUser}
        onOpenAuth={() => {
          if (currentUser) {
            setIsProfileOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onSecretAdminTrigger={promptAdminLogin}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* CONTINUOUS MARQUEE 1 */}
      <div className="bg-zelqia-gold text-zelqia-bg py-2.5 overflow-hidden whitespace-nowrap flex font-sans font-bold text-[11px] uppercase tracking-[0.25em] select-none border-y border-zelqia-goldDark">
        <div className="flex gap-10 animate-marquee flex-shrink-0">
          <span>✨ 18K Fine Demi-Fine Gold</span>
          <span>•</span>
          <span>🛡️ Anti-Tarnish Lifetime Protective Coating</span>
          <span>•</span>
          <span>💎 925 Hallmark Certified Authenticity</span>
          <span>•</span>
          <span>🎁 Luxury Wax-Sealed Gift Box</span>
          <span>•</span>
          <span>⚡ Same-Day Insured Courier Dispatch</span>
          <span>•</span>
          <span>🔄 7-Day Easy Returns & Exchange</span>
          <span>•</span>
        </div>
        <div className="flex gap-10 animate-marquee flex-shrink-0" aria-hidden="true">
          <span>✨ 18K Fine Demi-Fine Gold</span>
          <span>•</span>
          <span>🛡️ Anti-Tarnish Lifetime Protective Coating</span>
          <span>•</span>
          <span>💎 925 Hallmark Certified Authenticity</span>
          <span>•</span>
          <span>🎁 Luxury Wax-Sealed Gift Box</span>
          <span>•</span>
          <span>⚡ Same-Day Insured Courier Dispatch</span>
          <span>•</span>
          <span>🔄 7-Day Easy Returns & Exchange</span>
          <span>•</span>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="relative h-[68vh] md:h-[78vh] flex items-center justify-center text-center px-4 overflow-hidden border-b border-zelqia-border/30">
        <div className="absolute inset-0 bg-gradient-to-t from-zelqia-bg via-zelqia-bg/50 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1800"
          alt="Luxury Jewellery"
          className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
        />

        <div className="relative z-20 max-w-2xl mx-auto flex flex-col items-center">
          <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-zelqia-gold mb-3 font-sans font-semibold">
            Fine 18K Gold Plated, 925 Silver & Stainless steels
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-zelqia-ivory tracking-wide leading-tight mb-6">
            Timeless Luxury, <br />
            <span className="italic text-zelqia-gold font-light">Endless Elegance.</span>
          </h1>
          <div className="flex gap-3.5">
            <a
              href="#bestsellers"
              className="bg-zelqia-gold hover:bg-zelqia-goldLight text-zelqia-bg font-sans text-xs uppercase tracking-[0.2em] font-bold py-3.5 px-8 transition-all shadow-xl active:scale-95 flex items-center gap-2"
            >
              Explore Vault <ArrowDown size={14} />
            </a>
            <button
              onClick={() => setIsSizeOpen(true)}
              className="border border-zelqia-gold/50 hover:border-zelqia-gold text-zelqia-gold font-sans text-xs uppercase tracking-[0.2em] py-3.5 px-6 transition-all active:scale-95"
            >
              Size Scale
            </button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-zelqia-card border-b border-zelqia-border/30 py-5 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-zelqia-gold">
            <Shield size={16} />
            <span className="text-[11px] md:text-xs font-sans tracking-wide text-zelqia-ivory">925 Hallmark Certified</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-zelqia-gold">
            <Sparkles size={16} />
            <span className="text-[11px] md:text-xs font-sans tracking-wide text-zelqia-ivory">Anti-Tarnish Shield</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-zelqia-gold">
            <RefreshCw size={16} />
            <span className="text-[11px] md:text-xs font-sans tracking-wide text-zelqia-ivory">7 Days Easy Returns</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-zelqia-gold">
            <Truck size={16} />
            <span className="text-[11px] md:text-xs font-sans tracking-wide text-zelqia-ivory">Free Insured Shipping</span>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-10 flex items-center justify-center gap-2.5 overflow-x-auto pb-2">
        {['ALL', 'Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Men'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 text-xs uppercase tracking-widest font-sans whitespace-nowrap transition-all border rounded-sm ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-zelqia-gold text-zelqia-bg border-zelqia-gold font-bold shadow-md'
                : 'bg-zelqia-card text-zelqia-muted border-zelqia-border/40 hover:border-zelqia-gold'
            }`}
          >
            {cat === 'Men' ? "Men's" : cat}
          </button>
        ))}
      </div>

      {/* Main Products Grid */}
      <main id="bestsellers" className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-zelqia-ivory tracking-wide">The Vault Collection</h2>
            <p className="text-xs text-zelqia-gold font-sans uppercase tracking-widest mt-1">
              Showing {filteredProducts.length} Handcrafted Pieces • Click any piece for details
            </p>
          </div>
          <button
            onClick={() => {
              setHintProductTitle('Signature ZELQIA Vault');
              setIsHintOpen(true);
            }}
            className="text-xs font-sans text-zelqia-gold hover:text-zelqia-goldLight underline underline-offset-4"
          >
            Drop a Hint 💌
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zelqia-gold font-serif text-lg">Unlocking ZELQIA Vault...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zelqia-border/50 p-6">
            <p className="text-zelqia-muted text-sm font-sans">No pieces match your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onQuickAdd={handleAddToCart}
                isWishlisted={wishlist.some((w) => w._id === prod._id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </main>

      {/* Reverse Marquee */}
      <div className="bg-zelqia-card border-y border-zelqia-border/40 py-3 overflow-hidden whitespace-nowrap flex font-serif text-base tracking-[0.2em] text-zelqia-gold/80 select-none">
        <div className="flex gap-12 animate-marqueeReverse flex-shrink-0">
          <span>👑 DEMI-FINE ROYAL CRAFTSMANSHIP</span>
          <span>•</span>
          <span>✦ 100% ETHICALLY SOURCED ZIRCONS</span>
          <span>•</span>
          <span>✦ HYPOALLERGENIC & NICKEL FREE</span>
          <span>•</span>
          <span>✦ DISPATCHED IN SIGNATURE JEWELLERY BOX</span>
          <span>•</span>
        </div>
        <div className="flex gap-12 animate-marqueeReverse flex-shrink-0" aria-hidden="true">
          <span>👑 DEMI-FINE ROYAL CRAFTSMANSHIP</span>
          <span>•</span>
          <span>✦ 100% ETHICALLY SOURCED ZIRCONS</span>
          <span>•</span>
          <span>✦ HYPOALLERGENIC & NICKEL FREE</span>
          <span>•</span>
          <span>✦ DISPATCHED IN SIGNATURE JEWELLERY BOX</span>
          <span>•</span>
        </div>
      </div>

      {/* Shoppable Reels & UGC */}
      <ShoppableUGC posts={ugcPosts} onShopLook={handleShopLook} />

      {/* Footer */}
      <footer className="bg-zelqia-card border-t border-zelqia-border/30 py-10 px-4 text-center">
        <h3 className="font-serif text-2xl tracking-[0.25em] text-zelqia-gold mb-1 font-bold">ZELQIA</h3>
        <p className="text-xs text-zelqia-muted font-sans max-w-sm mx-auto mb-4">
          Handcrafted demi-fine jewellery designed for timeless everyday luxury.
        </p>
        <p className="text-[11px] text-zelqia-muted/60 font-sans">
          © 2025 ZELQIA. All Rights Reserved.
        </p>
      </footer>

      {/* Floating WhatsApp Concierge */}
      <a
        href="https://wa.me/919702847331?text=Hi%20Zelqia%20Team,%20I%20have%20an%20inquiry%20about%20a%20jewellery%20piece"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 md:bottom-6 left-6 z-30 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 font-sans text-xs uppercase tracking-wider font-semibold active:scale-95 transition-all"
        title="Chat with Jewellery Expert"
      >
        <MessageCircle size={18} />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-16 md:bottom-6 right-6 z-30 bg-zelqia-gold/90 hover:bg-zelqia-gold text-zelqia-bg p-3 rounded-full shadow-2xl transition-all active:scale-90"
          title="Back to Top"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Modals & Drawers */}
      <ZeptoAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (cartItems.length > 0) {
            setIsCheckoutOpen(true);
          }
        }}
      />

      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onOpenOrders={() => setIsMyOrdersOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onLogout={handleLogout}
      />

      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        userPhone={currentUser?.phone}
      />

      {orderSuccessData && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zelqia-card border border-zelqia-gold p-8 max-w-md text-center shadow-2xl">
            <CheckCircle size={48} className="text-zelqia-gold mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-zelqia-ivory mb-2">Order Confirmed!</h3>
            <p className="text-xs text-zelqia-muted font-sans mb-4">
              Thank you, <strong>{orderSuccessData.customer.name}</strong>. Your ZELQIA package (#{orderSuccessData.orderId}) is being prepared with insured dispatch.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setOrderSuccessData(null);
                  setIsMyOrdersOpen(true);
                }}
                className="flex-1 bg-zelqia-card border border-zelqia-gold text-zelqia-gold text-xs uppercase tracking-widest font-bold py-3"
              >
                Track Order
              </button>
              <button
                onClick={() => setOrderSuccessData(null)}
                className="flex-1 bg-zelqia-gold text-zelqia-bg text-xs uppercase tracking-widest font-bold py-3"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveItem}
        appliedCouponPercent={appliedCouponPercent}
        onApplyCoupon={setAppliedCouponPercent}
        onProceedCheckout={handleStartCheckout}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlist}
        onRemoveItem={handleRemoveWishlistItem}
        onMoveToCart={handleMoveWishlistToCart}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        appliedDiscountPercent={appliedCouponPercent}
        onOrderSuccess={handleOrderSuccess}
      />

      <DropAHintModal
        isOpen={isHintOpen}
        onClose={() => setIsHintOpen(false)}
        productTitle={hintProductTitle}
        productUrl={window.location.href}
      />

      <SizeVisualizerModal isOpen={isSizeOpen} onClose={() => setIsSizeOpen(false)} />
    </div>
  );
}