import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, HeartHandshake } from 'lucide-react';

export default function DropAHintModal({ isOpen, onClose, productTitle, productUrl }) {
  const [partnerPhone, setPartnerPhone] = useState('');
  const [senderName, setSenderName] = useState('');

  const handleSendWhatsAppHint = (e) => {
    e.preventDefault();
    const message = encodeURIComponent(
      `Hey! ${senderName || 'Someone special'} dropped you a sweet hint 💌:\n\n"I have my eye on the ${productTitle} from ZELQIA!"\n\nTake a look here: ${productUrl}`
    );
    window.open(`https://wa.me/${partnerPhone.replace(/\D/g, '')}?text=${message}`, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-zelqia-card border border-zelqia-gold/30 rounded-sm p-6 text-zelqia-ivory shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-zelqia-muted hover:text-zelqia-ivory">
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-zelqia-gold mb-2">
              <HeartHandshake size={24} />
              <span className="font-serif text-lg tracking-wider uppercase">Drop a Hint</span>
            </div>

            <p className="text-sm text-zelqia-muted mb-4 font-sans">
              Wish someone would gift you this piece? We'll anonymously send them a hint.
            </p>

            <form onSubmit={handleSendWhatsAppHint} className="flex flex-col gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-zelqia-muted">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-zelqia-bg border border-zelqia-border rounded-none p-2.5 text-sm text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-zelqia-muted">Their WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  className="w-full bg-zelqia-bg border border-zelqia-border rounded-none p-2.5 text-sm text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-zelqia-gold hover:bg-zelqia-goldLight text-zelqia-bg font-sans font-semibold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Send size={14} /> Send Hint via WhatsApp
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}