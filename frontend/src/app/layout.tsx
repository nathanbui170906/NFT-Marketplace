import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '../context/Web3Context';

export const metadata: Metadata = {
  title: 'Apex NFT Marketplace | Web3 Decentralized Trading Engine',
  description: 'Next-gen NFT and Digital Goods Marketplace built with Solidity smart contracts, ERC-721 token minting, English auctions, and ERC-2981 creator royalties.',
  keywords: ['NFT', 'Marketplace', 'Web3', 'Ethereum', 'Solidity', 'Foundry', 'Next.js', 'Decentralized', 'Auctions'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-slate-100 antialiased">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
