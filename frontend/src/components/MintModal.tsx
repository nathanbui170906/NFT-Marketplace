'use client';

import React, { useState } from 'react';
import { useWeb3, NFTItem } from '../context/Web3Context';
import { Sparkles, Image as ImageIcon, Plus, Tag, ShieldCheck, Check, Layers } from 'lucide-react';

interface MintModalProps {
  onClose: () => void;
}

const PRESET_ARTWORKS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000',
];

export const MintModal: React.FC<MintModalProps> = ({ onClose }) => {
  const { mintNFT } = useWeb3();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(PRESET_ARTWORKS[0]);
  const [category, setCategory] = useState<NFTItem['category']>('Digital Art');
  const [royaltyPct, setRoyaltyPct] = useState<number>(5);
  const [instantList, setInstantList] = useState(true);
  const [listPrice, setListPrice] = useState('1.5');
  const [isMinting, setIsMinting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    setIsMinting(true);
    const success = await mintNFT(
      name,
      description,
      image,
      category,
      royaltyPct,
      instantList ? listPrice : undefined
    );
    setIsMinting(false);
    if (success) onClose();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass-panel rounded-3xl border border-cyan-500/30 p-6 md:p-8 space-y-8">
        
        {/* Title Header */}
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-accent via-purple-600 to-pink-500 p-0.5 shadow-glow-cyan">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-accent animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">NFT Mint Studio</h2>
            <p className="text-xs text-slate-400">Mint new ERC-721 token with ERC-2981 royalties on EVM smart contracts</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Form Controls */}
          <div className="md:col-span-7 space-y-5">
            
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                NFT Title / Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cybernetic Vision #01"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
              >
                <option value="Digital Art">Digital Art</option>
                <option value="Collectibles">Collectibles</option>
                <option value="Gaming">Gaming</option>
                <option value="Metaverse">Metaverse</option>
                <option value="Music">Music</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Description *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Provide details regarding artwork backstory, utility, or traits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Presets Artwork Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Image Source / Presets
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {PRESET_ARTWORKS.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setImage(url)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 ${
                      image === url ? 'border-cyan-accent shadow-glow-cyan' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="preset" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or paste custom image URL..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full mt-2 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2 text-xs text-slate-200"
              />
            </div>

            {/* Creator Royalty Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Creator Royalty (ERC-2981)
                </label>
                <span className="text-xs font-mono font-bold text-purple-400">{royaltyPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={royaltyPct}
                onChange={(e) => setRoyaltyPct(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Instant Marketplace Listing */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-cyan-accent" />
                  <span className="text-xs font-bold text-slate-200">Instant Marketplace Listing</span>
                </div>
                <input
                  type="checkbox"
                  checked={instantList}
                  onChange={(e) => setInstantList(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </div>

              {instantList && (
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Listing Price:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    className="w-32 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-1 text-xs text-cyan-accent font-mono font-bold"
                  />
                  <span className="text-xs text-slate-400">ETH</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isMinting}
              className="w-full py-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-cyan-accent via-purple-600 to-pink-500 text-white shadow-glow-cyan hover:opacity-95 transition-all btn-glow"
            >
              {isMinting ? 'Minting Token on Chain...' : 'Mint & Launch NFT'}
            </button>

          </div>

          {/* Right Token Live Preview */}
          <div className="md:col-span-5 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Mint Preview</div>
            
            <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 space-y-3">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-slate-950/80 text-[10px] font-bold text-cyan-accent border border-cyan-500/40">
                  {category}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100">{name || 'NFT Token Title'}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{description || 'Token description preview...'}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Royalty Fee</span>
                  <span className="font-mono text-purple-400 font-bold">{royaltyPct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <span className="font-mono text-cyan-accent font-bold">
                    {instantList ? `${listPrice} ETH` : 'Unlisted'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
