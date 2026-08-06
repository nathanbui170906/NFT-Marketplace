'use client';

import React from 'react';
import { Zap, Github, Twitter, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-accent to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-slate-950 font-bold" />
              </div>
              <span className="text-lg font-bold text-gradient">APEX MARKETPLACE</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Decentralized NFT & Digital Goods Marketplace engineered on EVM Smart Contracts with ERC-721 token standards, English auctions, and ERC-2981 royalty enforcement.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Smart Contracts</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-cyan-accent cursor-pointer">Marketplace (Foundry)</li>
              <li className="hover:text-cyan-accent cursor-pointer">MarketplaceNFT.sol</li>
              <li className="hover:text-cyan-accent cursor-pointer">ERC-2981 Royalties</li>
              <li className="hover:text-cyan-accent cursor-pointer">ReentrancyGuard</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-cyan-accent cursor-pointer">Foundry Documentation</li>
              <li className="hover:text-cyan-accent cursor-pointer">Next.js App Router</li>
              <li className="hover:text-cyan-accent cursor-pointer">Ethers.js v6</li>
              <li className="hover:text-cyan-accent cursor-pointer">Tailwind CSS</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div>© 2026 Apex Web3 NFT Marketplace. All rights reserved.</div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Smart Contracts Verified</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
