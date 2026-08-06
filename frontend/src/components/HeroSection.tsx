'use client';

import React from 'react';
import { ArrowRight, Sparkles, Flame, ShieldCheck, Layers } from 'lucide-react';

interface HeroSectionProps {
  onExplore: () => void;
  onMint: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, onMint }) => {
  return (
    <div className="relative overflow-hidden bg-hero-gradient pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-card-border">
      
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column Text */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-accent text-xs font-semibold tracking-wide">
            <Flame className="w-4 h-4 text-cyan-accent animate-bounce" />
            <span>Decentralized ERC-721 Marketplace & Auction Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Discover, Trade & Collect <br />
            <span className="text-gradient">Next-Gen Digital Assets</span>
          </h1>

          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            Apex is a high-performance Web3 marketplace built on EVM smart contracts. Support for instant fixed-price sales, timed English auctions, direct ETH bids, and ERC-2981 creator royalties.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onExplore}
              className="flex items-center space-x-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-accent via-purple-600 to-pink-500 text-white shadow-glow-cyan hover:scale-105 transition-all btn-glow"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onMint}
              className="flex items-center space-x-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-slate-900/90 border border-slate-700 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Mint New NFT</span>
            </button>
          </div>

          {/* Key Stats Counter */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-accent font-mono">14.8K+</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Total Volume (ETH)</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">2.5%</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Low Platform Fee</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-pink-400 font-mono">100%</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Creator Royalties</div>
            </div>
          </div>
        </div>

        {/* Right Column Featured NFT Card Showcase */}
        <div className="lg:col-span-5 relative flex justify-center">
          
          <div className="relative w-full max-w-sm glass-panel rounded-2xl p-4 border border-cyan-500/30 shadow-glow-cyan animate-float">
            
            <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
                alt="Cyberpunk Samurai"
                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-cyan-accent text-xs font-mono font-bold flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Featured #777</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-100">Cyberpunk Samurai #777</h3>
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/30 text-purple-300">
                  Fixed Price
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-1">
                Equipped with plasma blade and holographic armor. Verified ERC-721 on-chain token.
              </p>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Price</div>
                  <div className="text-lg font-black text-cyan-accent font-mono">1.85 ETH</div>
                </div>
                <button
                  onClick={onExplore}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-accent border border-cyan-500/40 hover:bg-cyan-500/30 font-semibold text-xs transition-all"
                >
                  Buy Now
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
