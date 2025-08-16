'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, BN } from '@coral-xyz/anchor';
import { RescueCipher, x25519, getMXEPublicKey, awaitComputationFinalization } from '@arcium-hq/client';
import { randomBytes } from 'crypto';
import toast from 'react-hot-toast';

// Import the Shadow Protocol IDL (you'll need to generate this)
import ShadowProtocolIDL from '@/idl/shadow_protocol.json';

const PROGRAM_ID_STRING = process.env.NEXT_PUBLIC_PROGRAM_ID || '11111111111111111111111111111112';

export interface Auction {
  id: string;
  auctionId: string;
  creator: string;
  assetMint: string;
  type: 'SEALED' | 'DUTCH' | 'BATCH';
  status: 'CREATED' | 'ACTIVE' | 'ENDED' | 'SETTLED' | 'CANCELLED';
  startTime: Date;
  endTime: Date;
  minimumBid: string;
  currentPrice?: string;
  priceDecreaseRate?: string;
  startingPrice?: string;
  bidCount: number;
  winner?: string;
  winningAmount?: string;
  transactionHash?: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidder: string;
  amountEncrypted: string;
  timestamp: Date;
  isWinner: boolean;
  transactionHash?: string;
}

interface ShadowProtocolContextType {
  auctions: Auction[];
  userBids: Bid[];
  loading: boolean;
  program: Program | null;
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
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState<Program | null>(null);
  const [provider, setProvider] = useState<AnchorProvider | null>(null);
  const [mxePublicKey, setMxePublicKey] = useState<Uint8Array | null>(null);
  const [programId, setProgramId] = useState<PublicKey | null>(null);

  // Initialize Anchor program
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (publicKey && signTransaction && signAllTransactions) {
      try {
        const pid = new PublicKey(PROGRAM_ID_STRING);
        setProgramId(pid);
        
        const anchorProvider = new AnchorProvider(
          connection,
          {
            publicKey,
            signTransaction,
            signAllTransactions,
          },
          { commitment: 'confirmed' }
        );

        const program = new Program(
          ShadowProtocolIDL as unknown as Idl,
          anchorProvider
        );

        setProgram(program);
        setProvider(anchorProvider);

        // Fetch MXE public key for encryption
        getMXEPublicKey(anchorProvider, pid)
          .then(key => setMxePublicKey(key))
          .catch(err => console.error('Failed to get MXE public key:', err));
      } catch (error) {
        console.error('Failed to initialize program:', error);
      }
    }
  }, [publicKey, signTransaction, signAllTransactions, connection]);

  const refreshAuctions = async () => {
    try {
      setLoading(true);
      
      // Fetch from database API
      const response = await fetch('/api/auctions');
      const dbAuctions = await response.json();
      
      // Also fetch from blockchain if program is available
      if (program) {
        try {
          const onchainAuctions = await (program.account as any)['AuctionAccount'].all();
          
          // Merge database and on-chain data
          const mergedAuctions = dbAuctions.map((dbAuction: any) => {
            const onchainMatch = onchainAuctions.find(
              (oa: any) => oa.account.auctionId.toString() === dbAuction.auctionId
            );
            
            if (onchainMatch) {
              return {
                ...dbAuction,
                status: mapAuctionStatus(onchainMatch.account.status),
                bidCount: onchainMatch.account.bidCount.toNumber(),
                winner: onchainMatch.account.winner?.toBase58(),
                winningAmount: onchainMatch.account.winningAmount?.toString(),
              };
            }
            return dbAuction;
          });
          
          setAuctions(mergedAuctions);
        } catch (error) {
          console.error('Failed to fetch on-chain auctions:', error);
          setAuctions(dbAuctions);
        }
      } else {
        setAuctions(dbAuctions);
      }
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
      
      const response = await fetch(`/api/bids?bidder=${publicKey.toBase58()}`);
      const bids = await response.json();
      
      setUserBids(bids);
    } catch (error) {
      console.error('Error fetching user bids:', error);
      toast.error('Failed to fetch your bids');
    } finally {
      setLoading(false);
    }
  };

  const createAuction = async (params: any) => {
    if (!publicKey || !program || !mxePublicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading('Creating auction...');
      
      // Encrypt reserve price using Arcium
      const privateKey = x25519.utils.randomPrivateKey();
      const publicKeyBytes = x25519.getPublicKey(privateKey);
      const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
      const cipher = new RescueCipher(sharedSecret);
      
      const nonce = randomBytes(16);
      const reservePriceEncrypted = cipher.encrypt([BigInt(params.reservePrice)], nonce);
      
      const auctionId = Date.now();
      
      // Create auction on-chain
      let signature;
      if (params.type === 'sealed') {
        signature = await program.methods
          .createSealedAuction(
            new BN(auctionId),
            new PublicKey(params.assetMint),
            new BN(params.duration),
            new BN(params.minimumBid),
            Array.from(reservePriceEncrypted[0]),
            new BN(Buffer.from(nonce).readBigUInt64LE())
          )
          .accounts({
            creator: publicKey,
            // Add other required accounts
          })
          .rpc();
      } else if (params.type === 'dutch') {
        signature = await program.methods
          .createDutchAuction(
            new BN(auctionId),
            new PublicKey(params.assetMint),
            new BN(params.startingPrice),
            new BN(params.priceDecreaseRate),
            new BN(params.duration),
            Array.from(reservePriceEncrypted[0]),
            new BN(Buffer.from(nonce).readBigUInt64LE())
          )
          .accounts({
            creator: publicKey,
            // Add other required accounts
          })
          .rpc();
      }
      
      // Save to database
      await fetch('/api/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId,
          creator: publicKey.toBase58(),
          assetMint: params.assetMint,
          type: params.type.toUpperCase(),
          startTime: Math.floor(Date.now() / 1000),
          endTime: Math.floor(Date.now() / 1000) + params.duration,
          minimumBid: params.minimumBid,
          reservePriceEncrypted: Array.from(reservePriceEncrypted[0]),
          reservePriceNonce: Buffer.from(nonce).toString('hex'),
          currentPrice: params.startingPrice,
          priceDecreaseRate: params.priceDecreaseRate,
          startingPrice: params.startingPrice,
          transactionHash: signature,
        }),
      });
      
      toast.dismiss(loadingToast);
      toast.success('Auction created successfully!');
      await refreshAuctions();
    } catch (error) {
      console.error('Error creating auction:', error);
      toast.error('Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const submitBid = async (auctionId: string, amount: number) => {
    if (!publicKey || !program || !provider || !mxePublicKey || !programId) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading('Submitting encrypted bid...');
      
      // Encrypt bid amount
      const privateKey = x25519.utils.randomPrivateKey();
      const publicKeyBytes = x25519.getPublicKey(privateKey);
      const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
      const cipher = new RescueCipher(sharedSecret);
      
      const nonce = randomBytes(16);
      const bidAmountEncrypted = cipher.encrypt([BigInt(amount)], nonce);
      
      // Generate computation offset for Arcium
      const computationOffset = new BN(randomBytes(8), 'hex');
      
      // Submit bid on-chain
      const signature = await program.methods
        .submitEncryptedBid(
          new BN(auctionId),
          Array.from(bidAmountEncrypted[0]),
          Array.from(publicKeyBytes),
          new BN(Buffer.from(nonce).readBigUInt64LE()),
          computationOffset
        )
        .accounts({
          bidder: publicKey,
          // Add other required accounts
        })
        .rpc();
      
      // Wait for Arcium computation
      await awaitComputationFinalization(
        provider,
        computationOffset,
        programId!,
        'confirmed'
      );
      
      // Save to database
      await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId,
          bidder: publicKey.toBase58(),
          amountEncrypted: Array.from(bidAmountEncrypted[0]),
          encryptionPublicKey: Array.from(publicKeyBytes),
          nonce: Buffer.from(nonce).toString('hex'),
          transactionHash: signature,
        }),
      });
      
      toast.dismiss(loadingToast);
      toast.success('Bid submitted successfully!');
      await refreshUserBids();
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error('Failed to submit bid');
    } finally {
      setLoading(false);
    }
  };

  const settleAuction = async (auctionId: string) => {
    if (!publicKey || !program || !provider || !programId) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading('Settling auction...');
      
      const computationOffset = new BN(randomBytes(8), 'hex');
      
      // Settle auction on-chain
      const signature = await program.methods
        .settleAuction(
          new BN(auctionId),
          computationOffset
        )
        .accounts({
          payer: publicKey,
          // Add other required accounts
        })
        .rpc();
      
      // Wait for Arcium computation to determine winner
      const finalizeSig = await awaitComputationFinalization(
        provider,
        computationOffset,
        programId!,
        'confirmed'
      );
      
      // Fetch settlement result from on-chain
      const auctionAccount = await (program.account as any)['AuctionAccount'].fetch(
        PublicKey.findProgramAddressSync(
          [Buffer.from('auction'), new BN(auctionId).toArrayLike(Buffer, 'le', 8)],
          programId!
        )[0]
      );
      
      // Save settlement to database
      await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId,
          winner: auctionAccount.winner?.toBase58(),
          winningAmount: auctionAccount.winningAmount?.toString(),
          transactionHash: signature,
          mpcComputationId: computationOffset.toString(),
        }),
      });
      
      toast.dismiss(loadingToast);
      toast.success('Auction settled successfully!');
      await refreshAuctions();
    } catch (error) {
      console.error('Error settling auction:', error);
      toast.error('Failed to settle auction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuctions();
  }, [program]);

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
        program,
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

function mapAuctionStatus(status: any): string {
  if (status.created) return 'CREATED';
  if (status.active) return 'ACTIVE';
  if (status.ended) return 'ENDED';
  if (status.settled) return 'SETTLED';
  if (status.cancelled) return 'CANCELLED';
  return 'CREATED';
}