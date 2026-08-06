'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NFTItem } from '../context/Web3Context';
import { NFTCard } from './NFTCard';
import { Search, Filter, ArrowUpDown, Layers, Loader2, Sparkles } from 'lucide-react';

interface MarketplaceGridProps {
  items: NFTItem[];
  onSelectItem: (item: NFTItem) => void;
}

const ITEMS_PER_PAGE = 8;

export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({ items, onSelectItem }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'newest'>('newest');
  
  // Lazy loading & pagination state
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const categories = ['All', 'Digital Art', 'Collectibles', 'Gaming', 'Metaverse', 'Music'];

  // Reset page count on filter changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCategory, selectedType, sortBy]);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tokenId.toString() === searchQuery;

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    const matchesType =
      selectedType === 'all' ||
      (selectedType === 'fixed' && item.type === 'fixed') ||
      (selectedType === 'auction' && item.type === 'auction') ||
      (selectedType === 'offers' && !!item.highestOffer);

    return matchesSearch && matchesCategory && matchesType;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    const priceA = parseFloat(a.type === 'auction' ? (a.highestBid || a.price) : a.price);
    const priceB = parseFloat(b.type === 'auction' ? (b.highestBid || b.price) : b.price);

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    return b.tokenId - a.tokenId;
  });

  const visibleItems = sortedItems.slice(0, visibleCount);
  const hasMore = visibleCount < sortedItems.length;

  const loadMoreItems = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 400);
  };

  // IntersectionObserver for automatic Infinite Scroll lazy loading
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isLoadingMore, visibleCount, sortedItems.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-6 h-6 text-cyan-accent" />
            <span>Explore Collections</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Showing {visibleItems.length} of {sortedItems.length} active listings on-chain
          </p>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, description, or Token ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-accent border border-cyan-500/50 shadow-glow-cyan'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Type & Sort Dropdowns */}
        <div className="flex items-center space-x-3">
          
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-lg font-medium ${selectedType === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('fixed')}
              className={`px-3 py-1 rounded-lg font-medium ${selectedType === 'fixed' ? 'bg-cyan-950 text-cyan-accent' : 'text-slate-400'}`}
            >
              Buy Now
            </button>
            <button
              onClick={() => setSelectedType('auction')}
              className={`px-3 py-1 rounded-lg font-medium ${selectedType === 'auction' ? 'bg-purple-950 text-purple-300' : 'text-slate-400'}`}
            >
              Auctions
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

      </div>

      {/* Grid Display */}
      {sortedItems.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleItems.map((item) => (
              <NFTCard key={item.id} item={item} onSelect={onSelectItem} />
            ))}

            {/* Skeleton Skeletons when fetching next lazy chunk */}
            {isLoadingMore &&
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="glass-panel rounded-2xl overflow-hidden animate-pulse border border-slate-800 flex flex-col justify-between h-[360px]"
                >
                  <div className="w-full aspect-square bg-slate-900/80 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-slate-800 animate-spin" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                    <div className="h-8 bg-slate-800/80 rounded mt-4" />
                  </div>
                </div>
              ))}
          </div>

          {/* Sentinel & Load More trigger */}
          <div ref={observerTarget} className="flex flex-col items-center justify-center pt-4">
            {hasMore ? (
              <button
                onClick={loadMoreItems}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold flex items-center space-x-2 transition-all shadow-lg"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 text-cyan-accent animate-spin" />
                    <span>Loading more items...</span>
                  </>
                ) : (
                  <span>Load More Listings ({sortedItems.length - visibleCount} remaining)</span>
                )}
              </button>
            ) : sortedItems.length > ITEMS_PER_PAGE ? (
              <p className="text-xs text-slate-500 font-mono">You've reached the end of the marketplace listings</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No NFTs Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or filter tags to find active listings.
          </p>
        </div>
      )}
    </div>
  );
};
