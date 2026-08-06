'use client';

import React, { useState } from 'react';
import { useWeb3, NFTItem } from '../context/Web3Context';
import { NFTCard } from './NFTCard';
import { LayoutDashboard, Wallet, Tag, Award, Sparkles, CheckCircle } from 'lucide-react';

interface DashboardViewProps {
  onSelectItem: (item: NFTItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectItem }) => {
  const { account, userNfts, balance, isDemoMode } = useWeb3();
  const [activeTab, setActiveTab] = useState<'owned' | 'listings' | 'offers'>('owned');

  const ownedItems = userNfts.filter((item) => item.type === 'unlisted');
  const activeListings = userNfts.filter((item) => item.type === 'fixed' || item.type === 'auction');
  const itemsWithOffers = userNfts.filter((item) => !!item.highestOffer);

  const portfolioValueEth = userNfts.reduce((acc, i) => acc + parseFloat(i.price), 0).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-accent">
            <Wallet className="w-4 h-4" />
            <span>Connected Portfolio: {account}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100">User Dashboard</h2>
          <p className="text-xs text-slate-400">Manage your digital collection, active marketplace listings, and incoming bids.</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
          <div>
            <div className="text-xl font-extrabold text-cyan-accent font-mono">{userNfts.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total NFTs</div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-purple-400 font-mono">{activeListings.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Listings</div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-pink-400 font-mono">{portfolioValueEth} ETH</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Est. Value</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('owned')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'owned'
              ? 'bg-cyan-500/20 text-cyan-accent border border-cyan-500/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Collection ({ownedItems.length})
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'listings'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-glow-purple'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Marketplace Listings ({activeListings.length})
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'offers'
              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-glow-pink'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Incoming Offers ({itemsWithOffers.length})
        </button>
      </div>

      {/* Grid Content */}
      {activeTab === 'owned' && (
        <div>
          {ownedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {ownedItems.map((item) => (
                <NFTCard key={item.id} item={item} onSelect={onSelectItem} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-10 text-center rounded-2xl text-slate-400 text-sm">
              No unlisted items in your collection. Mint or buy items from the marketplace!
            </div>
          )}
        </div>
      )}

      {activeTab === 'listings' && (
        <div>
          {activeListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {activeListings.map((item) => (
                <NFTCard key={item.id} item={item} onSelect={onSelectItem} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-10 text-center rounded-2xl text-slate-400 text-sm">
              No active listings currently on sale. Select an item from your collection to list it!
            </div>
          )}
        </div>
      )}

      {activeTab === 'offers' && (
        <div>
          {itemsWithOffers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {itemsWithOffers.map((item) => (
                <NFTCard key={item.id} item={item} onSelect={onSelectItem} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-10 text-center rounded-2xl text-slate-400 text-sm">
              No incoming direct ETH offers received yet.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
