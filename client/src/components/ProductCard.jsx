import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

export default function ProductCard({
  product,
  onSelectProduct,
  onQuickAdd,
  isWishlisted,
  onToggleWishlist
}) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const videoRef = useRef(null);

  const activeVariant = product?.variants?.[selectedVariantIndex] || product?.variants?.[0] || {};
  const image = activeVariant?.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800';

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) videoRef.current.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleQuickAddClick = (e) => {
    e.stopPropagation();
    onQuickAdd({ product, variant: activeVariant });
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-zelqia-card border border-zelqia-border/40 rounded-sm overflow-hidden flex flex-col justify-between hover:border-zelqia-gold/60 transition-all duration-500 shadow-md"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Clickable Image */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-square w-full bg-zelqia-cardElevated overflow-hidden cursor-pointer"
      >
        <img
          src={image}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            isHovered && activeVariant.hoverVideo ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {activeVariant.hoverVideo && (
          <video
            ref={videoRef}
            src={activeVariant.hoverVideo}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isAntiTarnish && (
            <span className="bg-zelqia-bg/85 backdrop-blur-md border border-zelqia-border text-zelqia-gold text-[10px] tracking-wider px-2 py-0.5 uppercase font-sans flex items-center gap-1 font-medium shadow-md">
              <Sparkles size={10} /> Anti-Tarnish
            </span>
          )}
        </div>

        {/* Wishlist Button with Heart Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-zelqia-bg/70 backdrop-blur-md text-zelqia-ivory hover:text-zelqia-gold transition-colors z-10"
        >
          <Heart size={16} className={isWishlisted ? "fill-zelqia-gold text-zelqia-gold" : ""} />
        </button>
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          {product.variants?.map((variant, idx) => {
            let dotColor = 'bg-[#E5B25D]';
            if (variant.metalTone === 'Rose Gold') dotColor = 'bg-[#E0A899]';
            if (variant.metalTone === '925 Silver') dotColor = 'bg-[#D9D9D9]';

            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVariantIndex(idx);
                }}
                className={`w-3.5 h-3.5 rounded-full ${dotColor} border transition-all ${
                  selectedVariantIndex === idx
                    ? 'ring-1 ring-offset-2 ring-zelqia-gold ring-offset-zelqia-bg scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title={variant.metalTone}
              />
            );
          })}
          <span className="text-[11px] text-zelqia-muted ml-1 font-sans">{activeVariant?.metalTone}</span>
        </div>

        <h3
          onClick={() => onSelectProduct(product)}
          className="font-serif text-zelqia-ivory text-base tracking-wide line-clamp-1 group-hover:text-zelqia-gold transition-colors cursor-pointer"
        >
          {product.title}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-zelqia-gold font-sans font-semibold text-base">
              ₹{(activeVariant?.price || product.price || 2999).toLocaleString('en-IN')}
            </span>
            {activeVariant?.compareAtPrice && (
              <span className="text-zelqia-muted font-sans text-xs line-through">
                ₹{activeVariant.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <button
            onClick={handleQuickAddClick}
            className={`text-xs uppercase tracking-widest transition-all pb-0.5 font-sans font-medium ${
              addedAnim ? 'text-green-400 font-bold' : 'text-zelqia-gold hover:text-zelqia-goldLight border-b border-zelqia-gold/40'
            }`}
          >
            {addedAnim ? '✔ Added!' : '+ Quick Add'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}