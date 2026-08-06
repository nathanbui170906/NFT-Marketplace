'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useWeb3, NFTItem } from '../context/Web3Context';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { MarketplaceGrid } from '../components/MarketplaceGrid';
import { Footer } from '../components/Footer';
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from 'lucide-react';

const DynamicNFTDetailModal = dynamic(
  () => import('../components/NFTDetailModal').then((mod) => mod.NFTDetailModal),
  {
    loading: () => null,
  }
);

const DynamicMintModal = dynamic(
  () => import('../components/MintModal').then((mod) => mod.MintModal),
  {
    loading: () => (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4 glass-panel p-8 rounded-2xl border border-cyan-500/30">
          <Loader2 className="w-8 h-8 text-cyan-accent animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Loading Mint Interface...</p>
        </div>
      </div>
    ),
  }
);

const DynamicDashboardView = dynamic(
  () => import('../components/DashboardView').then((mod) => mod.DashboardView),
  {
    loading: () => (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4 glass-panel p-8 rounded-2xl border border-purple-500/30">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Loading Dashboard...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const { items, toasts, removeToast } = useWeb3();

  const [activeTab, setActiveTab] = useState<'explore' | 'mint' | 'dashboard'>('explore');
  const [selectedItem, setSelectedItem] = useState<NFTItem | null>(null);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-grow">
        
        {/* Toast Notifications Stack */}
        <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start space-x-3 transition-all animate-bounce ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
                  : toast.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
                  : 'bg-cyan-950/90 border-cyan-500/40 text-cyan-100'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />}

              <div className="flex-1 text-xs">
                <div className="font-bold text-sm">{toast.title}</div>
                <div className="opacity-90 mt-0.5">{toast.message}</div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Tab Views */}
        {activeTab === 'explore' && (
          <div>
            <HeroSection
              onExplore={() => {
                const gridElement = document.getElementById('explore-grid');
                gridElement?.scrollIntoView({ behavior: 'smooth' });
              }}
              onMint={() => setActiveTab('mint')}
            />
            <div id="explore-grid">
              <MarketplaceGrid items={items} onSelectItem={(item) => setSelectedItem(item)} />
            </div>
          </div>
        )}

        {activeTab === 'mint' && (
          <DynamicMintModal onClose={() => setActiveTab('explore')} />
        )}

        {activeTab === 'dashboard' && (
          <DynamicDashboardView onSelectItem={(item) => setSelectedItem(item)} />
        )}

        {/* NFT Detail Popup Modal */}
        {selectedItem && (
          <DynamicNFTDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
