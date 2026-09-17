import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Shield, RefreshCw, Gift, MapPin, Eye } from 'lucide-react';

export default function ProductDetailPage({ product, onBack, onAddToCart, onBuyNow, onDropHint }) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState('');
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  const activeVariant = product?.variants?.[selectedVariantIdx] || product?.variants?.[0] || {};
  const images = activeVariant.images?.length > 0
    ? activeVariant.images
    : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800'];

  const basePrice = activeVariant.price || 2999;
  const effectivePrice = isGiftWrap ? basePrice + 149 : basePrice;

  const checkPincode = (e) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      const formattedDate = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      setDeliveryMsg(`⚡ Estimated Delivery by ${formattedDate} | Free Insured Shipping`);
    } else {
      setDeliveryMsg('❌ Please enter a valid 6-digit Indian Pincode.');
    }
  };

  const handleAdd = () => {
    onAddToCart({ product, variant: activeVariant, isGiftWrap, giftNote });
  };

  const handleBuy = () => {
    onBuyNow({ product, variant: activeVariant, isGiftWrap, giftNote });
  };

  return (
    <div className="min-h-screen bg-zelqia-bg text-zelqia-ivory font-sans pb-24 md:pb-16 animate-fadeIn">
      {/* Top Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-b border-zelqia-border/30 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-zelqia-gold hover:text-zelqia-goldLight transition-colors"
        >
          <ArrowLeft size={16} /> Back to Vault
        </button>
        <span className="text-[11px] text-zelqia-muted uppercase tracking-wider">
          Vault / {product.category} / <span className="text-zelqia-ivory">{product.title}</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:w-20">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-16 h-16 md:w-20 md:h-20 border flex-shrink-0 transition-all ${
                  activeImageIdx === idx ? 'border-zelqia-gold shadow-[0_0_10px_rgba(229,178,93,0.3)]' : 'border-zelqia-border/40 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="flex-1 relative aspect-square bg-zelqia-card border border-zelqia-border/40 overflow-hidden group">
            <img
              src={images[activeImageIdx] || images[0]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-crosshair"
            />
            {product.isAntiTarnish && (
              <span className="absolute top-4 left-4 bg-zelqia-bg/85 backdrop-blur-md border border-zelqia-border text-zelqia-gold text-xs tracking-wider px-3 py-1 uppercase font-semibold flex items-center gap-1.5 shadow-lg">
                <Sparkles size={12} /> Anti-Tarnish Lifetime Shield
              </span>
            )}
          </div>
        </div>

        {/* Right: Decision Details */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-zelqia-gold mb-1">
              <Eye size={14} />
              <span className="font-semibold tracking-wider uppercase">14 people viewing this piece right now</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-zelqia-ivory tracking-wide leading-tight">
              {product.title}
            </h1>
            <p className="text-xs text-zelqia-muted mt-1 font-sans">
              Purity: <span className="text-zelqia-gold font-medium">{product.purity || 'Fine 18K Gold Plated, 925 Silver & Stainless steels'}</span>
            </p>
          </div>

          {/* Price with Dynamic Gift Addition */}
          <div className="flex items-baseline gap-4 border-y border-zelqia-border/30 py-4">
            <span className="text-3xl font-serif text-zelqia-gold font-bold">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </span>
            {activeVariant.compareAtPrice && (
              <>
                <span className="text-sm font-sans text-zelqia-muted line-through">
                  ₹{activeVariant.compareAtPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs bg-zelqia-gold/20 text-zelqia-gold font-bold px-2 py-0.5 uppercase tracking-wider">
                  Save ₹{(activeVariant.compareAtPrice - basePrice).toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>

          {/* Tone Selector */}
          <div>
            <label className="text-xs uppercase tracking-widest text-zelqia-muted block mb-2 font-medium">
              Select Finish: <strong className="text-zelqia-ivory">{activeVariant.metalTone || 'Yellow Gold'}</strong>
            </label>
            <div className="flex gap-3">
              {product.variants?.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedVariantIdx(idx);
                    setActiveImageIdx(0);
                  }}
                  className={`px-4 py-2 border text-xs font-sans uppercase tracking-wider flex items-center gap-2 transition-all ${
                    selectedVariantIdx === idx
                      ? 'bg-zelqia-cardElevated border-zelqia-gold text-zelqia-gold font-bold shadow-md'
                      : 'bg-zelqia-card border-zelqia-border text-zelqia-muted hover:border-zelqia-gold'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      v.metalTone === 'Yellow Gold' ? 'bg-[#E5B25D]' : v.metalTone === 'Rose Gold' ? 'bg-[#E0A899]' : 'bg-[#D9D9D9]'
                    }`}
                  />
                  {v.metalTone}
                </button>
              ))}
            </div>
          </div>

          {/* Luxury Gift Packaging Box */}
          <div className="bg-zelqia-card border border-zelqia-border/40 p-4 rounded-sm">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isGiftWrap}
                onChange={(e) => setIsGiftWrap(e.target.checked)}
                className="accent-zelqia-gold w-4 h-4 cursor-pointer"
              />
              <Gift size={16} className="text-zelqia-gold" />
              <span className="text-xs uppercase tracking-wider font-semibold text-zelqia-ivory">
                Add ZELQIA Signature Wax-Sealed Gift Box (+₹149)
              </span>
            </label>
            {isGiftWrap && (
              <input
                type="text"
                placeholder="Write your personalized handwritten note here..."
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                maxLength={150}
                className="mt-3 w-full bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
              />
            )}
          </div>

          {/* Pincode Estimator */}
          <form onSubmit={checkPincode} className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-zelqia-muted flex items-center gap-1">
              <MapPin size={13} className="text-zelqia-gold" /> Estimated Delivery
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="bg-zelqia-card border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none flex-1"
              />
              <button
                type="submit"
                className="bg-zelqia-cardElevated border border-zelqia-border hover:border-zelqia-gold text-zelqia-gold text-xs uppercase tracking-wider px-4 py-2"
              >
                Check
              </button>
            </div>
            {deliveryMsg && <p className="text-xs text-zelqia-gold font-sans mt-1">{deliveryMsg}</p>}
          </form>

          {/* Desktop CTAs */}
          <div className="hidden md:flex gap-3 pt-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-zelqia-card border border-zelqia-gold text-zelqia-gold hover:bg-zelqia-cardElevated text-xs uppercase tracking-[0.2em] font-bold py-4 transition-all shadow-lg active:scale-95"
            >
              Add To Bag
            </button>
            <button
              onClick={handleBuy}
              className="flex-1 bg-zelqia-gold hover:bg-zelqia-goldLight text-zelqia-bg text-xs uppercase tracking-[0.2em] font-bold py-4 transition-all shadow-xl active:scale-95"
            >
              Buy Now
            </button>
          </div>

          {/* Drop a hint button */}
          <button
            type="button"
            onClick={() => onDropHint(product.title)}
            className="w-full text-center py-2 text-xs text-zelqia-gold hover:text-zelqia-goldLight border border-zelqia-gold/30 hover:border-zelqia-gold uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 mt-1"
          >
            <span>💌</span> Drop a hint to someone special
          </button>

          {/* Details Accordion */}
          <div className="border-t border-zelqia-border/30 pt-4 space-y-3 text-xs text-zelqia-muted font-sans leading-relaxed">
            <div className="bg-zelqia-card p-4 border border-zelqia-border/30">
              <h4 className="text-zelqia-ivory font-semibold uppercase tracking-wider mb-2 font-serif text-sm">
                Craftsmanship & Story
              </h4>
              <p>{product.description || 'Handcrafted meticulously by master artisans using premium 18k gold plating over hypoallergenic sterling silver and stainless steels.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zelqia-card p-3 border border-zelqia-border/30 flex items-center gap-2">
                <Shield size={16} className="text-zelqia-gold flex-shrink-0" />
                <span className="text-zelqia-ivory text-[11px]">925 Hallmark Certified</span>
              </div>
              <div className="bg-zelqia-card p-3 border border-zelqia-border/30 flex items-center gap-2">
                <RefreshCw size={16} className="text-zelqia-gold flex-shrink-0" />
                <span className="text-zelqia-ivory text-[11px]">7 Days Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-zelqia-bg/95 backdrop-blur-md border-t border-zelqia-border p-3 flex gap-3 md:hidden shadow-2xl">
        <button
          onClick={handleAdd}
          className="flex-1 bg-zelqia-card border border-zelqia-gold text-zelqia-gold font-bold text-xs uppercase tracking-wider py-3.5 active:bg-zelqia-cardElevated"
        >
          Add to Bag
        </button>
        <button
          onClick={handleBuy}
          className="flex-1 bg-zelqia-gold text-zelqia-bg font-bold text-xs uppercase tracking-wider py-3.5 shadow-lg active:bg-zelqia-goldLight"
        >
          Buy Now (₹{effectivePrice.toLocaleString('en-IN')})
        </button>
      </div>
    </div>
  );
}