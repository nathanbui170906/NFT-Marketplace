'use client';

import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Wallet, Sparkles, Zap, Shield, PlusCircle, LayoutDashboard, Compass } from 'lucide-react';

interface NavbarProps {
  activeTab: 'explore' | 'mint' | 'dashboard';
  setActiveTab: (tab: 'explore' | 'mint' | 'dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { account, balance, isConnected, isDemoMode, connectWallet, disconnectWallet, toggleDemoMode } = useWeb3();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-card-border backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-accent via-purple-600 to-pink-500 p-0.5 shadow-glow-cyan">
            <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-cyan-accent animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider text-gradient">APEX</span>
            <span className="text-xs block text-slate-400 font-semibold tracking-widest uppercase">NFT MARKETPLACE</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-2 bg-slate-950/60 p-1.5 rounded-full border border-slate-800/80">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'explore'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-accent border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore Market</span>
          </button>

          <button
            onClick={() => setActiveTab('mint')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'mint'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-accent border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mint Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-accent border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Web3 Wallet & Mode Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Mode Switcher Badge */}
          <button
            onClick={toggleDemoMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isDemoMode
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 shadow-glow-purple'
                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
            }`}
            title="Toggle between Interactive Demo Mode and Live Browser Web3 Wallet"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isDemoMode ? 'Demo Web3' : 'Live Wallet'}</span>
          </button>

          {/* Wallet Balance & Connected Account */}
          {isConnected ? (
            <div className="flex items-center space-x-2">
              <div className="hidden lg:flex flex-col text-right px-3 py-1 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Balance</span>
                <span className="text-xs font-bold text-cyan-accent">{balance} ETH</span>
              </div>

              <div className="flex items-center space-x-2 bg-slate-900 border border-cyan-500/30 px-3.5 py-2 rounded-xl text-sm font-mono text-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : ''}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="text-xs text-slate-400 hover:text-rose-400 ml-1 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-accent via-purple-600 to-pink-500 text-white shadow-glow-cyan hover:opacity-95 transition-all btn-glow"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
