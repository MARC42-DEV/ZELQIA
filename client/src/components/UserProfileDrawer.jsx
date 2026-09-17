import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Package, Heart, LogOut, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

export default function UserProfileDrawer({
  isOpen,
  onClose,
  currentUser,
  onOpenOrders,
  onOpenWishlist,
  onLogout
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm">
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="w-screen max-w-md bg-zelqia-card border-l border-zelqia-border/40 text-zelqia-ivory flex flex-col justify-between"
          >
            {/* 1. Header with User Card */}
            <div>
              <div className="p-5 border-b border-zelqia-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zelqia-gold">
                  <User size={18} />
                  <h2 className="font-serif text-lg tracking-wider uppercase">My Profile</h2>
                </div>
                <button onClick={onClose} className="text-zelqia-muted hover:text-zelqia-ivory p-1">
                  <X size={20} />
                </button>
              </div>

              {/* Zepto-Style User Greeting Card */}
              <div className="p-6 bg-zelqia-cardElevated border-b border-zelqia-border/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-zelqia-gold/20 border border-zelqia-gold flex items-center justify-center text-zelqia-gold font-serif text-xl font-bold shadow-lg">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'Z'}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-zelqia-ivory font-semibold">
                      {currentUser?.name || 'ZELQIA Member'}
                    </h3>
                    <p className="text-xs text-zelqia-gold font-sans flex items-center gap-1 mt-0.5">
                      <ShieldCheck size={13} /> Verified Luxury Patron
                    </p>
                  </div>
                </div>

                {/* Phone & Email Info */}
                <div className="mt-4 pt-4 border-t border-zelqia-border/20 space-y-1.5 text-xs text-zelqia-muted font-sans">
                  {currentUser?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-zelqia-gold" />
                      <span>+91 {currentUser.phone}</span>
                    </div>
                  )}
                  {currentUser?.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-zelqia-gold" />
                      <span>{currentUser.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Quick Navigation Options (Zepto App Layout) */}
              <div className="p-4 space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenOrders();
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-zelqia-bg border border-zelqia-border/40 hover:border-zelqia-gold transition-colors rounded-sm text-left"
                >
                  <div className="flex items-center gap-3">
                    <Package size={18} className="text-zelqia-gold" />
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zelqia-ivory">My Orders</h4>
                      <p className="text-[10px] text-zelqia-muted">Track live dispatches & invoices</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-zelqia-muted" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenWishlist();
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-zelqia-bg border border-zelqia-border/40 hover:border-zelqia-gold transition-colors rounded-sm text-left"
                >
                  <div className="flex items-center gap-3">
                    <Heart size={18} className="text-zelqia-gold" />
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zelqia-ivory">Saved Wishlist</h4>
                      <p className="text-[10px] text-zelqia-muted">View your favorite pieces</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-zelqia-muted" />
                </button>

                {/* Membership Privileges Banner */}
                <div className="p-4 bg-zelqia-gold/10 border border-zelqia-border rounded-sm mt-4">
                  <div className="flex items-center gap-2 text-zelqia-gold text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles size={14} /> VIP Membership Active
                  </div>
                  <p className="text-[11px] text-zelqia-muted leading-relaxed">
                    Enjoy flat 5% instant discount on UPI payments, free insured shipping, and lifetime anti-tarnish replating support.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Zepto-Style Clean Logout Button */}
            <div className="p-5 border-t border-zelqia-border/30 bg-zelqia-cardElevated">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-400 font-sans font-semibold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-sm shadow-md active:scale-95"
              >
                <LogOut size={16} /> Log Out from Account
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}   