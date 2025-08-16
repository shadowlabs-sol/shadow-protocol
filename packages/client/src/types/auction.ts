import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export enum AuctionType {
  SEALED = 'SEALED',
  DUTCH = 'DUTCH',
  BATCH = 'BATCH'
}

export enum AuctionStatus {
  CREATED = 'CREATED',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED'
}

export interface Auction {
  id: string;
  auctionId: BN;
  creator: PublicKey;
  assetMint: PublicKey;
  type: AuctionType;
  status: AuctionStatus;
  startTime: Date;
  endTime: Date;
  minimumBid: BN;
  reservePrice?: BN;
  reservePriceEncrypted?: Uint8Array;
  currentPrice?: BN;
  priceDecreaseRate?: BN;
  bidCount: number;
  winner?: PublicKey;
  winningAmount?: BN;
  settledAt?: Date;
}

export interface CreateAuctionParams {
  type: AuctionType;
  assetMint: string;
  duration: number;
  minimumBid: number;
  reservePrice?: number;
  startingPrice?: number;
  priceDecreaseRate?: number;
}