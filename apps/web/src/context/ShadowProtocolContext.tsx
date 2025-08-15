'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';

export interface Auction {
  id: string;
  creator: string;
  assetMint: string;
  type: 'sealed' | 'dutch' | 'batch';
  status: 'active' | 'ended' | 'settled' | 'cancelled';
  startTime: number;
  endTime: number;
  minimumBid: number;
  currentPrice?: number;
  priceDecreaseRate?: number;
  bidCount: number;
  winner?: string;
  winningAmount?: number;
  reservePriceEncrypted?: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidder: string;
  amountEncrypted: string;
  timestamp: number;
  isWinner: boolean;
}

interface ShadowProtocolContextType {
  auctions: Auction[];
  userBids: Bid[];
  loading: boolean;
  createAuction: (params: any) => Promise<void>;
  submitBid: (auctionId: string, amount: number) => Promise<void>;
  settleAuction: (auctionId: string) => Promise<void>;
  refreshAuctions: () => Promise<void>;
  refreshUserBids: () => Promise<void>;
}

const ShadowProtocolContext = createContext<ShadowProtocolContextType | undefined>(undefined);

export const useShadowProtocol = () => {
  const context = useContext(ShadowProtocolContext);
  if (!context) {
    throw new Error('useShadowProtocol must be used within ShadowProtocolProvider');
  }
  return context;
};

interface ShadowProtocolProviderProps {
  children: ReactNode;
}

export const ShadowProtocolProvider: React.FC<ShadowProtocolProviderProps> = ({ children }) => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshAuctions = async () => {
    try {
      setLoading(true);
      // Mock data for now - will integrate with actual client
      const mockAuctions: Auction[] = [
        {
          id: 'AUC_12345',
          creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          assetMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          type: 'sealed',
          status: 'active',
          startTime: Date.now() / 1000,
          endTime: Date.now() / 1000 + 86400,
          minimumBid: 50000,
          bidCount: 2,
          reservePriceEncrypted: '0x...',
        },
        {
          id: 'AUC_12346',
          creator: '8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          assetMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
          type: 'dutch',
          status: 'active',
          startTime: Date.now() / 1000,
          endTime: Date.now() / 1000 + 43200,
          minimumBid: 0,
          currentPrice: 100000,
          priceDecreaseRate: 1,
          bidCount: 0,
        },
      ];
      setAuctions(mockAuctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast.error('Failed to fetch auctions');
    } finally {
      setLoading(false);
    }
  };

  const refreshUserBids = async () => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      // Mock data for now
      const mockBids: Bid[] = [
        {
          id: 'BID_001',
          auctionId: 'AUC_12345',
          bidder: publicKey.toBase58(),
          amountEncrypted: '0x...',
          timestamp: Date.now() / 1000,
          isWinner: false,
        },
      ];
      setUserBids(mockBids);
    } catch (error) {
      console.error('Error fetching user bids:', error);
      toast.error('Failed to fetch your bids');
    } finally {
      setLoading(false);
    }
  };

  const createAuction = async (params: any) => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Creating auction...');
      
      // Will integrate with actual client
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.dismiss();
      toast.success('Auction created successfully!');
      await refreshAuctions();
    } catch (error) {
      console.error('Error creating auction:', error);
      toast.dismiss();
      toast.error('Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const submitBid = async (auctionId: string, amount: number) => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Submitting encrypted bid...');
      
      // Will integrate with actual client for encryption
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.dismiss();
      toast.success('Bid submitted successfully!');
      await refreshUserBids();
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.dismiss();
      toast.error('Failed to submit bid');
    } finally {
      setLoading(false);
    }
  };

  const settleAuction = async (auctionId: string) => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Settling auction...');
      
      // Will integrate with actual settlement logic
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.dismiss();
      toast.success('Auction settled successfully!');
      await refreshAuctions();
    } catch (error) {
      console.error('Error settling auction:', error);
      toast.dismiss();
      toast.error('Failed to settle auction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuctions();
  }, []);

  useEffect(() => {
    if (publicKey) {
      refreshUserBids();
    }
  }, [publicKey]);

  return (
    <ShadowProtocolContext.Provider
      value={{
        auctions,
        userBids,
        loading,
        createAuction,
        submitBid,
        settleAuction,
        refreshAuctions,
        refreshUserBids,
      }}
    >
      {children}
    </ShadowProtocolContext.Provider>
  );
};