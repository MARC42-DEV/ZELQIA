import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler } from 'lucide-react';

const SIZES = [
  { indianSize: 10, diameterMm: 16.0 },
  { indianSize: 12, diameterMm: 16.5 },
  { indianSize: 14, diameterMm: 17.3 },
  { indianSize: 16, diameterMm: 18.1 },
  { indianSize: 18, diameterMm: 18.9 }
];

export default function SizeVisualizerModal({ isOpen, onClose }) {
  const [selectedSize, setSelectedSize] = useState(SIZES[2]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-zelqia-card border border-zelqia-gold/40 rounded-sm p-6 text-zelqia-ivory"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-zelqia-muted hover:text-zelqia-ivory">
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-zelqia-gold mb-2">
              <Ruler size={22} />
              <h2 className="font-serif text-xl tracking-wider uppercase">Interactive Ring Scale</h2>
            </div>
            <p className="text-xs text-zelqia-muted font-sans mb-6">
              Place your existing ring over the circle to match the exact diameter.
            </p>

            <div className="flex flex-col items-center justify-center py-8 bg-zelqia-bg border border-zelqia-border/50 mb-6">
              <div
                style={{
                  width: `${selectedSize.diameterMm * 6}px`,
                  height: `${selectedSize.diameterMm * 6}px`
                }}
                className="rounded-full border-2 border-dashed border-zelqia-gold flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(229,178,93,0.3)]"
              >
                <span className="text-[11px] text-zelqia-gold font-sans font-bold">
                  {selectedSize.diameterMm} mm
                </span>
              </div>
              <span className="text-xs text-zelqia-ivory mt-4 font-sans font-medium">
                Standard Indian Size: <strong className="text-zelqia-gold">#{selectedSize.indianSize}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              {SIZES.map((size) => (
                <button
                  key={size.indianSize}
                  onClick={() => setSelectedSize(size)}
                  className={`flex-1 py-2 text-xs font-sans transition-all border ${
                    selectedSize.indianSize === size.indianSize
                      ? 'bg-zelqia-gold text-zelqia-bg border-zelqia-gold font-bold'
                      : 'bg-zelqia-bg text-zelqia-muted border-zelqia-border hover:border-zelqia-gold'
                  }`}
                >
                  Size {size.indianSize}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}