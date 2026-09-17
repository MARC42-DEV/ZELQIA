import React, { useRef } from 'react';
import { ShoppingBag, Instagram, Film } from 'lucide-react';

function UGCItem({ item, onShopItem }) {
  const videoRef = useRef(null);
  const isReel = item.mediaType === 'REEL' || item.mediaUrl?.startsWith('data:video') || item.mediaUrl?.endsWith('.mp4');

  return (
    <div
      onClick={() => onShopItem(item)}
      onMouseEnter={() => videoRef.current && videoRef.current.play().catch(() => {})}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
      className="group relative w-56 md:w-64 aspect-[9/16] bg-zelqia-card overflow-hidden border border-zelqia-border/40 rounded-sm flex-shrink-0 cursor-pointer shadow-lg active:scale-95 transition-transform"
    >
      {isReel ? (
        <>
          <video
            ref={videoRef}
            src={item.mediaUrl || item.image}
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-zelqia-gold z-10">
            <Film size={14} />
          </div>
        </>
      ) : (
        <img
          src={item.mediaUrl || item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}

      {/* Dark Overlay on Hover with Instant Buy CTA */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
        <span className="text-xs text-zelqia-gold font-sans font-medium flex items-center gap-1">
          <Instagram size={12} /> {item.handle || '@zelqia_jewels'}
        </span>
        <div>
          <p className="font-serif text-sm text-zelqia-ivory mb-2 line-clamp-2">{item.title}</p>
          <span className="bg-zelqia-gold text-zelqia-bg text-[10px] font-bold py-1.5 px-3 uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg">
            <ShoppingBag size={12} /> Shop This Look
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ShoppableUGC({ posts = [], onShopLook }) {
  const loopPosts = [...posts, ...posts, ...posts];

  return (
    <section className="py-16 overflow-hidden border-t border-zelqia-border/30">
      <div className="text-center mb-8 px-4">
        <span className="text-[10px] uppercase tracking-[0.35em] text-zelqia-gold font-sans font-semibold">
          Live Reels & Customer Looks
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-zelqia-ivory tracking-wide mt-1">Styled By You</h2>
        <a
          href="https://instagram.com/zelqia_jewels"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-sans text-zelqia-muted hover:text-zelqia-gold mt-1.5 inline-flex items-center justify-center gap-1.5 transition-colors"
        >
          <Instagram size={14} className="text-zelqia-gold" /> Follow @zelqia_jewels
        </a>
      </div>

      <div className="flex gap-4 w-max animate-marqueeSlow hover:[animation-play-state:paused] py-2">
        {loopPosts.map((item, idx) => (
          <UGCItem
            key={`${item._id || item.id}-${idx}`}
            item={item}
            onShopItem={onShopLook}
          />
        ))}
      </div>
    </section>
  );
}