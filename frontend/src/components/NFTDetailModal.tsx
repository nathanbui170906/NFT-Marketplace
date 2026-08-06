'use client';

import React, { useState } from 'react';
import { NFTItem, useWeb3 } from '../context/Web3Context';
import { X, Clock, ShieldCheck, Tag, Gavel, Sparkles, Send, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface NFTDetailModalProps {
  item: NFTItem | null;
  onClose: () => void;
}

export const NFTDetailModal: React.FC<NFTDetailModalProps> = ({ item, onClose }) => {
  const { account, buyNFT, placeBid, endAuction, makeOffer, acceptOffer, listNFTForSale, cancelListing } = useWeb3();

  const [bidAmount, setBidAmount] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);

  if (!item) return null;

  const isOwner = account && (
    item.owner.toLowerCase() === account.toLowerCase() ||
    item.seller.toLowerCase() === account.toLowerCase()
  );

  const ethPrice = parseFloat(item.type === 'auction' ? (item.highestBid || item.price) : item.price);
  const minRequiredBid = (item.highestBid ? parseFloat(item.highestBid) * 1.05 : parseFloat(item.price)).toFixed(4);

  const handleBuy = async () => {
    setIsSubmitting(true);
    await buyNFT(item);
    setIsSubmitting(false);
    onClose();
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount) return;
    setIsSubmitting(true);
    const success = await placeBid(item, bidAmount);
    setIsSubmitting(false);
    if (success) onClose();
  };

  const handleEndAuction = async () => {
    setIsSubmitting(true);
    await endAuction(item);
    setIsSubmitting(false);
    onClose();
  };

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAmount) return;
    setIsSubmitting(true);
    const success = await makeOffer(item, offerAmount);
    setIsSubmitting(false);
    if (success) onClose();
  };

  const handleAcceptOffer = async () => {
    setIsSubmitting(true);
    await acceptOffer(item);
    setIsSubmitting(false);
    onClose();
  };

  const handleList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listPrice) return;
    setIsSubmitting(true);
    const success = await listNFTForSale(item, listPrice);
    setIsSubmitting(false);
    if (success) onClose();
  };

  const handleCancelList = async () => {
    setIsSubmitting(true);
    await cancelListing(item);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-cyan-500/30 shadow-2xl p-6 md:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:border-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Media Preview */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              {isImgLoading && (
                <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-cyan-400/40 animate-bounce" />
                </div>
              )}
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                onLoad={() => setIsImgLoading(false)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isImgLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-slate-300 text-xs font-semibold">
                {item.category}
              </div>
            </div>

            {/* Attributes Grid */}
            {item.attributes && item.attributes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">NFT Attributes</span>
                <div className="grid grid-cols-2 gap-2">
                  {item.attributes.map((attr, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-cyan-accent uppercase font-semibold">{attr.trait_type}</div>
                      <div className="text-xs font-bold text-slate-200 mt-0.5">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Details & Action Controls */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-accent">
                <span>Contract: 0x5FbD...80aa3</span>
                <span>•</span>
                <span>ID #{item.tokenId}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">{item.name}</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">{item.description}</p>
            </div>

            {/* Creator / Seller Payout info */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Seller</span>
                <span className="font-mono text-slate-200 font-semibold">{item.seller.substring(0, 8)}...</span>
              </div>
              <div>
                <span className="text-slate-400 block">Royalty Standard</span>
                <span className="font-semibold text-purple-400">ERC-2981 ({(item.royaltyBps / 100).toFixed(1)}%)</span>
              </div>
            </div>

            {/* Pricing / Auction Status Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>{item.type === 'auction' ? 'Current High Bid' : 'Sale Price'}</span>
                {item.type === 'auction' && (
                  <span className="flex items-center space-x-1 text-purple-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Active Auction</span>
                  </span>
                )}
              </div>

              <div className="text-3xl font-black text-cyan-accent font-mono">
                {ethPrice.toFixed(4)} ETH
                <span className="text-xs text-slate-400 font-normal ml-2">
                  (~${(ethPrice * 3200).toFixed(2)})
                </span>
              </div>

              {/* Offer Info if available */}
              {item.highestOffer && (
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Active Direct Offer:</span>
                  <span className="font-bold text-pink-400 font-mono">{item.highestOffer} ETH</span>
                </div>
              )}
            </div>

            {/* Action Buttons depending on user role & listing type */}
            <div className="space-y-4">
              
              {/* FIXED PRICE SALE BUY BUTTON */}
              {item.type === 'fixed' && !isOwner && (
                <button
                  onClick={handleBuy}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-accent via-purple-600 to-pink-500 text-white shadow-glow-cyan hover:opacity-95 transition-all btn-glow"
                >
                  {isSubmitting ? 'Processing Transaction...' : `Buy Now for ${item.price} ETH`}
                </button>
              )}

              {/* TIMED AUCTION BID FORM */}
              {item.type === 'auction' && !isOwner && (
                <form onSubmit={handleBid} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder={`Min bid ${minRequiredBid} ETH`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white shadow-glow-purple transition-all"
                    >
                      Place Bid
                    </button>
                  </div>
                </form>
              )}

              {/* DIRECT OFFER FORM */}
              {item.type !== 'auction' && !isOwner && (
                <form onSubmit={handleMakeOffer} className="space-y-3 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 block">Make a Direct Offer</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Offer amount in ETH"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-pink-600 text-slate-100 hover:text-white border border-slate-700 transition-all"
                    >
                      Make Offer
                    </button>
                  </div>
                </form>
              )}

              {/* OWNER ACTIONS */}
              {isOwner && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="text-xs font-bold text-cyan-accent uppercase tracking-wider">Owner Controls</div>
                  
                  {item.type !== 'unlisted' && (
                    <button
                      onClick={handleCancelList}
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/80 transition-all"
                    >
                      Cancel Marketplace Listing
                    </button>
                  )}

                  {item.type === 'unlisted' && (
                    <form onSubmit={handleList} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Set Listing Price in ETH"
                          value={listPrice}
                          onChange={(e) => setListPrice(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-100"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white"
                        >
                          List for Sale
                        </button>
                      </div>
                    </form>
                  )}

                  {item.highestOffer && (
                    <button
                      onClick={handleAcceptOffer}
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80 transition-all"
                    >
                      Accept Highest Offer ({item.highestOffer} ETH)
                    </button>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
