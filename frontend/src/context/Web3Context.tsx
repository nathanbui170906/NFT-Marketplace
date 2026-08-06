'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MARKETPLACE_ADDRESS, NFT_COLLECTION_ADDRESS, MARKETPLACE_ABI, NFT_COLLECTION_ABI } from '../contracts/contractsConfig';

export interface NFTItem {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  category: 'Digital Art' | 'Collectibles' | 'Gaming' | 'Metaverse' | 'Music';
  seller: string;
  owner: string;
  price: string; // in ETH
  type: 'fixed' | 'auction' | 'unlisted';
  royaltyBps: number; // e.g. 500 = 5%
  // Auction specific
  highestBid?: string;
  highestBidder?: string;
  endTime?: number; // timestamp in ms
  // Offers
  highestOffer?: string;
  highestOfferor?: string;
  offerId?: number;
  listingId?: number;
  auctionId?: number;
  attributes?: { trait_type: string; value: string }[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface Web3ContextType {
  account: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  isDemoMode: boolean;
  items: NFTItem[];
  userNfts: NFTItem[];
  toasts: ToastMessage[];
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  toggleDemoMode: () => void;
  mintNFT: (name: string, description: string, image: string, category: NFTItem['category'], royaltyPct: number, listPrice?: string) => Promise<boolean>;
  buyNFT: (item: NFTItem) => Promise<boolean>;
  placeBid: (item: NFTItem, bidAmountEth: string) => Promise<boolean>;
  endAuction: (item: NFTItem) => Promise<boolean>;
  makeOffer: (item: NFTItem, offerAmountEth: string) => Promise<boolean>;
  acceptOffer: (item: NFTItem) => Promise<boolean>;
  listNFTForSale: (item: NFTItem, priceEth: string) => Promise<boolean>;
  cancelListing: (item: NFTItem) => Promise<boolean>;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const INITIAL_MOCK_NFTS: NFTItem[] = [
  {
    id: '1',
    tokenId: 1,
    name: 'Cyberpunk Samurai #777',
    description: 'A neon-clad warrior from Neo-Tokyo 2099, equipped with a plasma blade and holographic armor.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    category: 'Digital Art',
    seller: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    owner: MARKETPLACE_ADDRESS,
    price: '1.85',
    type: 'fixed',
    royaltyBps: 500,
    listingId: 1,
    attributes: [
      { trait_type: 'Weapon', value: 'Plasma Katana' },
      { trait_type: 'Armor', value: 'Nanotech Mesh' },
      { trait_type: 'Rarity', value: 'Legendary' }
    ]
  },
  {
    id: '2',
    tokenId: 2,
    name: 'Aetheria Cosmic Nexus',
    description: 'An ethereal manifestation of dark matter energy swirling across interstellar galaxies.',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000&auto=format&fit=crop',
    category: 'Collectibles',
    seller: '0x3C44CdD05a90026634E59F694382336D88849644',
    owner: MARKETPLACE_ADDRESS,
    price: '2.50',
    type: 'auction',
    highestBid: '3.45',
    highestBidder: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    endTime: Date.now() + 14400000, // 4 hours from now
    royaltyBps: 250,
    auctionId: 1,
    attributes: [
      { trait_type: 'Dimension', value: 'Void IX' },
      { trait_type: 'Core', value: 'Singularity' }
    ]
  },
  {
    id: '3',
    tokenId: 3,
    name: 'Neon Horizon Drive',
    description: 'High-speed synthwave cruiser traveling down the endless digital highway under a retro sun.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop',
    category: 'Metaverse',
    seller: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    owner: MARKETPLACE_ADDRESS,
    price: '0.95',
    type: 'fixed',
    royaltyBps: 300,
    listingId: 2,
    highestOffer: '0.85',
    highestOfferor: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    offerId: 1,
    attributes: [
      { trait_type: 'Speed', value: 'Mach 3' },
      { trait_type: 'Engine', value: 'V8 Turbo Electric' }
    ]
  },
  {
    id: '4',
    tokenId: 4,
    name: 'Quantum Synthesis Core',
    description: 'Interactive generative audio-reactive cube generating real-time algorithmic soundscapes.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop',
    category: 'Gaming',
    seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    owner: MARKETPLACE_ADDRESS,
    price: '4.00',
    type: 'auction',
    highestBid: '5.20',
    highestBidder: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    endTime: Date.now() + 43200000, // 12 hours from now
    royaltyBps: 500,
    auctionId: 2,
    attributes: [
      { trait_type: 'Frequency', value: '432Hz' },
      { trait_type: 'Type', value: 'Quantum Relic' }
    ]
  },
  {
    id: '5',
    tokenId: 5,
    name: 'Solaris Abstract #04',
    description: 'Vibrant fluid glass sculpture captured in 8K resolution displaying luminous prismatic reflections.',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop',
    category: 'Digital Art',
    seller: '0x3C44CdD05a90026634E59F694382336D88849644',
    owner: '0x3C44CdD05a90026634E59F694382336D88849644',
    price: '1.20',
    type: 'unlisted',
    highestOffer: '1.10',
    highestOfferor: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    offerId: 2,
    royaltyBps: 400,
    attributes: [
      { trait_type: 'Palette', value: 'Prismatic Synth' },
      { trait_type: 'Edition', value: '1 of 1' }
    ]
  }
];

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true); // Default to interactive demo mode
  const [items, setItems] = useState<NFTItem[]>(INITIAL_MOCK_NFTS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Demo user default account
  const DEMO_ACCOUNT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  useEffect(() => {
    if (isDemoMode) {
      setAccount(DEMO_ACCOUNT);
      setBalance('25.4500');
      setChainId(31337); // Anvil / Hardhat chain ID
    }
  }, [isDemoMode]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const network = await provider.getNetwork();
        const userBal = await provider.getBalance(accounts[0]);

        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
        setBalance(parseFloat(ethers.formatEther(userBal)).toFixed(4));
        setIsDemoMode(false);
        addToast('success', 'Wallet Connected', `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
      } catch (err: any) {
        addToast('error', 'Connection Failed', err.message || 'Could not connect to wallet');
      }
    } else {
      addToast('info', 'Web3 Wallet Not Detected', 'Using interactive Demo Mode with simulated Web3 provider.');
      setIsDemoMode(true);
      setAccount(DEMO_ACCOUNT);
      setBalance('25.4500');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance('0.00');
    setChainId(null);
    addToast('info', 'Disconnected', 'Wallet disconnected');
  };

  const toggleDemoMode = () => {
    const newDemoState = !isDemoMode;
    setIsDemoMode(newDemoState);
    if (newDemoState) {
      setAccount(DEMO_ACCOUNT);
      setBalance('25.4500');
      setChainId(31337);
      addToast('info', 'Demo Mode Activated', 'Now using simulated Web3 wallet with 25.45 ETH test balance.');
    } else {
      connectWallet();
    }
  };

  // Mint NFT
  const mintNFT = async (
    name: string,
    description: string,
    image: string,
    category: NFTItem['category'],
    royaltyPct: number,
    listPrice?: string
  ): Promise<boolean> => {
    try {
      addToast('info', 'Minting NFT...', 'Constructing token metadata and signing transaction.');

      // Perform live or demo execution
      if (!isDemoMode && typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const nftContract = new ethers.Contract(NFT_COLLECTION_ADDRESS, NFT_COLLECTION_ABI, signer);

        const royaltyBps = Math.floor(royaltyPct * 100);
        const tx = await nftContract.mintToken(image, royaltyBps);
        await tx.wait();

        if (listPrice && parseFloat(listPrice) > 0) {
          const mktContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
          const appTx = await nftContract.setApprovalForAll(MARKETPLACE_ADDRESS, true);
          await appTx.wait();
          const listTx = await mktContract.listItem(NFT_COLLECTION_ADDRESS, 1, ethers.parseEther(listPrice));
          await listTx.wait();
        }
      }

      // Add to local state
      const newTokenId = items.length + 1;
      const newItem: NFTItem = {
        id: newTokenId.toString(),
        tokenId: newTokenId,
        name,
        description,
        image: image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000',
        category,
        seller: account || DEMO_ACCOUNT,
        owner: listPrice ? MARKETPLACE_ADDRESS : (account || DEMO_ACCOUNT),
        price: listPrice || '0.00',
        type: listPrice ? 'fixed' : 'unlisted',
        royaltyBps: royaltyPct * 100,
        listingId: listPrice ? Math.floor(Math.random() * 1000) + 10 : undefined,
        attributes: [
          { trait_type: 'Creator Royalty', value: `${royaltyPct}%` },
          { trait_type: 'Mint Standard', value: 'ERC-721 + ERC-2981' },
        ],
      };

      setItems((prev) => [newItem, ...prev]);
      addToast('success', 'NFT Minted Successfully!', `Token #${newTokenId} "${name}" is now on-chain.`);
      return true;
    } catch (err: any) {
      addToast('error', 'Minting Failed', err.message || 'Error executing mint transaction.');
      return false;
    }
  };

  // Buy NFT
  const buyNFT = async (item: NFTItem): Promise<boolean> => {
    try {
      addToast('info', 'Processing Purchase', `Buying ${item.name} for ${item.price} ETH...`);

      if (!isDemoMode && typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const mktContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);

        const tx = await mktContract.buyItem(item.listingId || 1, {
          value: ethers.parseEther(item.price),
        });
        await tx.wait();
      }

      // Deduct simulated balance & transfer ownership
      if (isDemoMode) {
        const cost = parseFloat(item.price);
        const curBal = parseFloat(balance);
        if (cost > curBal) {
          addToast('error', 'Insufficient Funds', 'Your ETH balance is too low for this purchase.');
          return false;
        }
        setBalance((curBal - cost).toFixed(4));
      }

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                owner: account || DEMO_ACCOUNT,
                type: 'unlisted',
                listingId: undefined,
              }
            : i
        )
      );

      addToast('success', 'Purchase Complete!', `You now own ${item.name}!`);
      return true;
    } catch (err: any) {
      addToast('error', 'Purchase Failed', err.message || 'Transaction reverted');
      return false;
    }
  };

  // Place Bid on Auction
  const placeBid = async (item: NFTItem, bidAmountEth: string): Promise<boolean> => {
    try {
      const bidVal = parseFloat(bidAmountEth);
      const minBid = item.highestBid ? parseFloat(item.highestBid) * 1.05 : parseFloat(item.price);

      if (bidVal < minBid) {
        addToast('error', 'Bid Too Low', `Minimum required bid is ${minBid.toFixed(4)} ETH (5% increment).`);
        return false;
      }

      addToast('info', 'Submitting Bid', `Placing bid of ${bidAmountEth} ETH on ${item.name}...`);

      if (isDemoMode) {
        const curBal = parseFloat(balance);
        if (bidVal > curBal) {
          addToast('error', 'Insufficient Balance', 'Not enough ETH to cover your bid.');
          return false;
        }
      }

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                highestBid: bidAmountEth,
                highestBidder: account || DEMO_ACCOUNT,
              }
            : i
        )
      );

      addToast('success', 'Bid Placed!', `You are now the highest bidder with ${bidAmountEth} ETH.`);
      return true;
    } catch (err: any) {
      addToast('error', 'Bid Failed', err.message || 'Failed to place bid');
      return false;
    }
  };

  // End Auction
  const endAuction = async (item: NFTItem): Promise<boolean> => {
    try {
      addToast('info', 'Finalizing Auction', `Settling auction for ${item.name}...`);

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                owner: item.highestBidder || item.seller,
                type: 'unlisted',
                auctionId: undefined,
              }
            : i
        )
      );

      addToast('success', 'Auction Finalized!', `NFT ownership transferred to ${item.highestBidder ? 'highest bidder' : 'seller'}.`);
      return true;
    } catch (err: any) {
      addToast('error', 'Auction Finalization Failed', err.message || 'Error ending auction');
      return false;
    }
  };

  // Make Offer
  const makeOffer = async (item: NFTItem, offerAmountEth: string): Promise<boolean> => {
    try {
      addToast('info', 'Placing ETH Offer', `Offering ${offerAmountEth} ETH for ${item.name}...`);

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                highestOffer: offerAmountEth,
                highestOfferor: account || DEMO_ACCOUNT,
                offerId: Math.floor(Math.random() * 1000) + 1,
              }
            : i
        )
      );

      addToast('success', 'Offer Created!', `Your offer of ${offerAmountEth} ETH was sent to seller.`);
      return true;
    } catch (err: any) {
      addToast('error', 'Offer Failed', err.message || 'Error making offer');
      return false;
    }
  };

  // Accept Offer
  const acceptOffer = async (item: NFTItem): Promise<boolean> => {
    try {
      if (!item.highestOffer || !item.highestOfferor) return false;
      addToast('info', 'Accepting Offer', `Accepting ${item.highestOffer} ETH offer from ${item.highestOfferor.substring(0, 6)}...`);

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                owner: item.highestOfferor!,
                type: 'unlisted',
                highestOffer: undefined,
                highestOfferor: undefined,
              }
            : i
        )
      );

      addToast('success', 'Offer Accepted!', `Sold for ${item.highestOffer} ETH!`);
      return true;
    } catch (err: any) {
      addToast('error', 'Failed to Accept Offer', err.message || 'Error accepting offer');
      return false;
    }
  };

  // List NFT for Sale
  const listNFTForSale = async (item: NFTItem, priceEth: string): Promise<boolean> => {
    try {
      addToast('info', 'Listing Item', `Listing ${item.name} for ${priceEth} ETH on Marketplace...`);

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                price: priceEth,
                type: 'fixed',
                owner: MARKETPLACE_ADDRESS,
                listingId: Math.floor(Math.random() * 1000) + 1,
              }
            : i
        )
      );

      addToast('success', 'Item Listed!', `${item.name} is now live on the marketplace.`);
      return true;
    } catch (err: any) {
      addToast('error', 'Listing Failed', err.message || 'Failed to list item');
      return false;
    }
  };

  // Cancel Listing
  const cancelListing = async (item: NFTItem): Promise<boolean> => {
    try {
      addToast('info', 'Canceling Listing', `Removing ${item.name} from market...`);

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                owner: account || DEMO_ACCOUNT,
                type: 'unlisted',
                listingId: undefined,
              }
            : i
        )
      );

      addToast('success', 'Listing Canceled', `${item.name} returned to your wallet.`);
      return true;
    } catch (err: any) {
      addToast('error', 'Cancellation Failed', err.message || 'Error canceling listing');
      return false;
    }
  };

  const userNfts = items.filter((i) => i.owner.toLowerCase() === (account || DEMO_ACCOUNT).toLowerCase() || i.seller.toLowerCase() === (account || DEMO_ACCOUNT).toLowerCase());

  return (
    <Web3Context.Provider
      value={{
        account,
        balance,
        chainId,
        isConnected: !!account,
        isDemoMode,
        items,
        userNfts,
        toasts,
        connectWallet,
        disconnectWallet,
        toggleDemoMode,
        mintNFT,
        buyNFT,
        placeBid,
        endAuction,
        makeOffer,
        acceptOffer,
        listNFTForSale,
        cancelListing,
        addToast,
        removeToast,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
