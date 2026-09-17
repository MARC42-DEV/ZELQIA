import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Heart } from 'lucide-react';

export default function WishlistDrawer({
  isOpen,
  onClose,
  items = [],
  onRemoveItem,
  onMoveToCart
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-screen max-w-md bg-zelqia-card border-l border-zelqia-border/40 text-zelqia-ivory flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-zelqia-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zelqia-gold">
                  <Heart size={18} className="fill-zelqia-gold" />
                  <h2 className="font-serif text-lg tracking-wider uppercase">
                    Your Wishlist ({items.length})
                  </h2>
                </div>
                <button onClick={onClose} className="text-zelqia-muted hover:text-zelqia-ivory p-1">
                  <X size={20} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-20 text-zelqia-muted text-sm font-sans flex flex-col items-center">
                    <Heart size={36} className="text-zelqia-border mb-3" />
                    <p>No saved pieces yet.</p>
                    <span className="text-[11px] text-zelqia-muted/70 mt-1">Tap the heart icon on any piece to save it here.</span>
                  </div>
                ) : (
                  items.map((product) => {
                    const variant = product.variants?.[0] || {};
                    const image = variant.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200';
                    const price = variant.price || product.price || 2999;

                    return (
                      <div
                        key={product._id}
                        className="flex gap-4 border-b border-zelqia-border/20 pb-4 items-center bg-zelqia-bg/50 p-3 rounded-sm border border-zelqia-border/30"
                      >
                        <img
                          src={image}
                          alt={product.title}
                          className="w-16 h-16 object-cover bg-zelqia-bg border border-zelqia-border/40 rounded-sm"
                        />
                        <div className="flex-1">
                          <h4 className="font-serif text-sm text-zelqia-ivory line-clamp-1">{product.title}</h4>
                          <span className="text-[11px] text-zelqia-muted block">{product.category}</span>
                          <span className="text-xs font-sans text-zelqia-gold font-semibold mt-1 block">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => onMoveToCart(product)}
                            className="bg-zelqia-gold hover:bg-zelqia-goldLight text-zelqia-bg text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-sm flex items-center gap-1 shadow-md"
                            title="Move to Bag"
                          >
                            <ShoppingBag size={12} /> Add
                          </button>
                          <button
                            onClick={() => onRemoveItem(product._id)}
                            className="text-zelqia-muted hover:text-red-400 text-center text-xs py-1"
                            title="Remove"
                          >
                            <Trash2 size={13} className="mx-auto" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-5 border-t border-zelqia-border/30 bg-zelqia-cardElevated text-center">
                  <p className="text-[11px] text-zelqia-gold font-sans mb-3">
                    Items in your wishlist are reserved at current prices.
                  </p>
                  <button
                    onClick={() => {
                      items.forEach((p) => onMoveToCart(p));
                    }}
                    className="w-full bg-zelqia-card border border-zelqia-gold text-zelqia-gold hover:bg-zelqia-gold hover:text-zelqia-bg font-sans font-semibold py-3 text-xs uppercase tracking-widest transition-all"
                  >
                    Move All to Shopping Bag
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}