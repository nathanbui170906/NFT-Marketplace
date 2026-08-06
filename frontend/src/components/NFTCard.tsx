'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NFTItem } from '../context/Web3Context';
import { Clock, Tag, Gavel, Sparkles, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

interface NFTCardProps {
  item: NFTItem;
  onSelect: (item: NFTItem) => void;
  onQuickBuy?: (item: NFTItem) => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({ item, onSelect, onQuickBuy }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isLiked, setIsLiked] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);

  // Viewport scroll lazy loading state
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Scroll Intersection Observer for on-scroll load
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el); // Once scrolled into view, keep loaded
        }
      },
      {
        rootMargin: '150px 0px', // Trigger load 150px before scrolling into view
        threshold: 0.05,
      }
    );

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  // Auction Countdown Timer
  useEffect(() => {
    if (item.type === 'auction' && item.endTime) {
      const updateTimer = () => {
        const now = Date.now();
        const diff = item.endTime! - now;
        if (diff <= 0) {
          setTimeLeft('Ended');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [item.endTime, item.type]);

  const ethPrice = parseFloat(item.type === 'auction' ? (item.highestBid || item.price) : item.price);
  const usdPrice = (ethPrice * 3200).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(item)}
      className={`group relative glass-panel glass-panel-hover rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between border border-card-border transition-all duration-700 transform ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {/* Top Media Preview Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
        {/* Shimmer / Skeleton Loader while Image is Loading or pending scroll */}
        {(isImageLoading || !isInView) && (
          <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-shimmer" />
            <Sparkles className="w-8 h-8 text-cyan-500/40 absolute animate-bounce" />
          </div>
        )}

        {isInView && !hasImageError ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              setIsImageLoading(false);
              setHasImageError(true);
            }}
            className={`w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500 ${
              isImageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          />
        ) : hasImageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500 p-4 text-center">
            <Sparkles className="w-10 h-10 mb-2 opacity-50 text-cyan-400" />
            <span className="text-xs font-mono">Image Unavailable</span>
          </div>
        ) : null}

        {/* Top Badges overlay */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-200 text-xs font-semibold">
            {item.category}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="pointer-events-auto w-8 h-8 rounded-full bg-slate-950/70 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-pink-400 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
          </button>
        </div>

        {/* Bottom Banner Badge for Auctions */}
        {item.type === 'auction' && (
          <div className="absolute bottom-0 left-0 right-0 py-1.5 px-3 bg-purple-950/90 backdrop-blur-md border-t border-purple-500/30 flex items-center justify-between text-xs font-mono text-purple-200">
            <span className="flex items-center space-x-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>Ends in:</span>
            </span>
            <span className="font-bold text-cyan-accent">{timeLeft}</span>
          </div>
        )}
      </div>

      {/* Card Content Footer */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 tracking-wider uppercase">
              Token #{item.tokenId}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                item.type === 'fixed'
                  ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-accent'
                  : item.type === 'auction'
                  ? 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              {item.type === 'fixed' ? 'BUY NOW' : item.type === 'auction' ? 'LIVE AUCTION' : 'UNLISTED'}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-100 mt-1 line-clamp-1 group-hover:text-cyan-accent transition-colors">
            {item.name}
          </h3>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
            <span>By</span>
            <span className="font-mono text-slate-300">
              {item.seller.substring(0, 6)}...{item.seller.substring(38)}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-accent" />
          </div>
        </div>

        {/* Pricing Info & Action Button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              {item.type === 'auction' ? 'Highest Bid' : 'Price'}
            </div>
            <div className="text-base font-extrabold text-slate-100 font-mono flex items-center space-x-1">
              <span className="text-cyan-accent">{item.type === 'auction' ? (item.highestBid || item.price) : item.price} ETH</span>
            </div>
            <div className="text-[10px] text-slate-500">{usdPrice}</div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-accent border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition-all"
          >
            {item.type === 'fixed' ? 'Buy Now' : item.type === 'auction' ? 'Place Bid' : 'View Item'}
          </button>
        </div>
      </div>
    </div>
  );
};
