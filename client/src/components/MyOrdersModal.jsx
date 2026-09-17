import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Truck, CheckCircle2, Clock } from 'lucide-react';

export default function MyOrdersModal({ isOpen, onClose, userPhone }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const savedOrders = JSON.parse(localStorage.getItem('zelqia_user_orders') || '[]');
      setOrders(savedOrders);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-zelqia-card border border-zelqia-gold/40 rounded-sm p-6 md:p-8 text-zelqia-ivory shadow-2xl my-8 max-h-[85vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-zelqia-muted hover:text-zelqia-ivory">
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 text-zelqia-gold mb-1">
            <Package size={22} />
            <h2 className="font-serif text-2xl uppercase tracking-wider">My Orders & Tracking</h2>
          </div>
          <p className="text-xs text-zelqia-muted font-sans mb-6">Live status of your handcrafted luxury dispatches</p>

          {orders.length === 0 ? (
            <div className="text-center py-16 text-zelqia-muted text-sm font-sans">
              <Package size={40} className="mx-auto text-zelqia-border mb-3" />
              <p>No active orders placed yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, idx) => (
                <div key={idx} className="bg-zelqia-bg border border-zelqia-border/60 p-5 rounded-sm">
                  <div className="flex flex-wrap items-center justify-between border-b border-zelqia-border/30 pb-3 mb-4 gap-2">
                    <div>
                      <span className="text-[10px] text-zelqia-muted uppercase tracking-wider block">Order ID</span>
                      <strong className="text-xs text-zelqia-gold font-sans">{order.orderId}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-zelqia-muted uppercase tracking-wider block">Date</span>
                      <span className="text-xs font-sans">{order.date || new Date().toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zelqia-muted uppercase tracking-wider block">Total Amount</span>
                      <strong className="text-xs text-zelqia-ivory font-serif">₹{order.grandTotal.toLocaleString('en-IN')} ({order.paymentMethod})</strong>
                    </div>
                  </div>

                  {/* Tracking Status Stepper (Amazon Style) */}
                  <div className="py-4">
                    <div className="flex items-center justify-between text-xs font-sans mb-2">
                      <span className="text-zelqia-gold flex items-center gap-1 font-semibold"><CheckCircle2 size={13} /> Order Placed</span>
                      <span className="text-zelqia-gold flex items-center gap-1 font-semibold"><CheckCircle2 size={13} /> Dispatched</span>
                      <span className="text-zelqia-gold flex items-center gap-1 font-semibold"><Truck size={13} /> In Transit</span>
                      <span className="text-zelqia-muted flex items-center gap-1"><Clock size={13} /> Delivered</span>
                    </div>
                    <div className="w-full bg-zelqia-card h-2 rounded-full overflow-hidden border border-zelqia-border/40">
                      <div className="bg-zelqia-gold h-full w-3/4 animate-pulse" />
                    </div>
                  </div>

                  {/* Items in this Order */}
                  <div className="space-y-2 mt-2">
                    {order.items?.map((it, iIdx) => (
                      <div key={iIdx} className="flex items-center justify-between text-xs font-sans text-zelqia-muted">
                        <span>{it.product?.title || it.title} ({it.variant?.metalTone || 'Yellow Gold'}) × {it.quantity || 1}</span>
                        <span className="text-zelqia-ivory font-medium">₹{((it.variant?.price || it.price) * (it.quantity || 1)).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}