import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShieldCheck, Tag, Plus, Minus } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  items = [],
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout,
  appliedCouponPercent,
  onApplyCoupon
}) {
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  const rawSubtotal = items.reduce((acc, curr) => {
    const price = curr?.variant?.price || curr?.price || 0;
    const qty = curr?.quantity || 1;
    return acc + price * qty;
  }, 0);

  const discountAmount = Math.round((rawSubtotal * appliedCouponPercent) / 100);
  const subtotal = rawSubtotal - discountAmount;

  const freeShippingThreshold = 1999;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'ZELQIA10') {
      onApplyCoupon(10);
      setCouponMsg('✔ Coupon ZELQIA10 Applied (10% OFF)');
    } else if (couponCode.trim().toUpperCase() === 'ROYAL5') {
      onApplyCoupon(5);
      setCouponMsg('✔ Coupon ROYAL5 Applied (5% OFF)');
    } else {
      onApplyCoupon(0);
      setCouponMsg('❌ Invalid Coupon Code');
    }
  };

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
                <h2 className="font-serif text-lg tracking-wider uppercase text-zelqia-gold">
                  Your Shopping Bag ({items.length})
                </h2>
                <button onClick={onClose} className="text-zelqia-muted hover:text-zelqia-ivory p-1">
                  <X size={20} />
                </button>
              </div>

              {/* Free Shipping Milestone */}
              <div className="bg-zelqia-cardElevated p-4 border-b border-zelqia-border/20">
                <p className="text-xs font-sans text-zelqia-ivory mb-2">
                  {subtotal >= freeShippingThreshold ? (
                    <span className="text-zelqia-gold font-semibold">🎉 You unlocked Free Insured Shipping!</span>
                  ) : (
                    `Add ₹${(freeShippingThreshold - subtotal).toLocaleString('en-IN')} more for Free Shipping.`
                  )}
                </p>
                <div className="w-full bg-zelqia-bg h-1.5 rounded-full overflow-hidden border border-zelqia-border/40">
                  <div
                    style={{ width: `${progress}%` }}
                    className="bg-zelqia-gold h-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Items List with + / - Quantity buttons */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-16 text-zelqia-muted text-sm font-sans">
                    Your shopping bag is empty.
                  </div>
                ) : (
                  items.map((item, idx) => {
                    const title = item?.product?.title || item?.title || 'Jewellery Piece';
                    const metalTone = item?.variant?.metalTone || item?.metalTone || 'Yellow Gold';
                    const price = item?.variant?.price || item?.price || 0;
                    const image =
                      item?.variant?.images?.[0] ||
                      item?.images?.[0] ||
                      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200';
                    const qty = item?.quantity || 1;

                    return (
                      <div key={idx} className="flex gap-4 border-b border-zelqia-border/20 pb-4 items-center">
                        <img
                          src={image}
                          alt={title}
                          className="w-16 h-16 object-cover bg-zelqia-bg border border-zelqia-border/30 rounded-sm"
                        />
                        <div className="flex-1">
                          <h4 className="font-serif text-sm text-zelqia-ivory line-clamp-1">{title}</h4>
                          <span className="text-[11px] text-zelqia-muted">{metalTone}</span>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-zelqia-border bg-zelqia-bg">
                              <button
                                onClick={() => onUpdateQty(idx, qty - 1)}
                                className="p-1 hover:text-zelqia-gold text-zelqia-muted"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-2 text-xs font-sans font-semibold text-zelqia-ivory">{qty}</span>
                              <button
                                onClick={() => onUpdateQty(idx, qty + 1)}
                                className="p-1 hover:text-zelqia-gold text-zelqia-muted"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <span className="text-xs font-sans text-zelqia-gold font-semibold">
                              ₹{(price * qty).toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={() => onRemoveItem(idx)}
                              className="text-zelqia-muted hover:text-red-400 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer & Promo Coupon */}
              {items.length > 0 && (
                <div className="p-5 border-t border-zelqia-border/30 bg-zelqia-cardElevated">
                  <form onSubmit={handleApplyCoupon} className="mb-3">
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center bg-zelqia-bg border border-zelqia-border px-2.5 py-1.5 rounded-sm">
                        <Tag size={13} className="text-zelqia-gold mr-1.5 flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Coupon (e.g. ZELQIA10)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="bg-transparent text-xs text-zelqia-ivory uppercase focus:outline-none w-full"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-zelqia-card border border-zelqia-border hover:border-zelqia-gold text-zelqia-gold text-xs uppercase px-3 py-1.5"
                      >
                        Apply
                      </button>
                    </div>
                    {couponMsg && (
                      <p className={`text-[10px] mt-1 font-sans ${appliedCouponPercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {couponMsg}
                      </p>
                    )}
                  </form>

                  <div className="flex items-center gap-2 bg-zelqia-gold/10 border border-zelqia-border p-2 mb-3">
                    <ShieldCheck size={16} className="text-zelqia-gold flex-shrink-0" />
                    <span className="text-[10px] text-zelqia-gold font-sans font-medium">
                      Pay online via UPI for extra 5% discount.
                    </span>
                  </div>

                  <div className="space-y-1 mb-3 text-xs font-sans">
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Coupon Discount</span>
                        <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="uppercase tracking-wider text-zelqia-muted">Subtotal</span>
                      <span className="text-lg font-serif text-zelqia-gold font-bold">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onProceedCheckout}
                    className="w-full bg-zelqia-gold hover:bg-zelqia-goldLight text-zelqia-bg font-sans font-semibold py-3.5 text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                  >
                    Proceed to Secure Checkout
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