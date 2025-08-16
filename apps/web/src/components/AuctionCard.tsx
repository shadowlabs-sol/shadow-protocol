'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, TrendingDown, Lock, ChevronRight } from 'lucide-react';
import { Auction } from '@/context/ShadowProtocolContext';

interface AuctionCardProps {
  auction: Auction;
  onBid: (auctionId: string, amount: number) => void;
  onSettle: (auctionId: string) => void;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction, onBid, onSettle }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [showBidInput, setShowBidInput] = useState(false);

  const timeRemaining = () => {
    const now = Date.now();
    const endTime = new Date(auction.endTime).getTime();
    const remaining = (endTime - now) / 1000;
    if (remaining <= 0) return 'Ended';
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getCurrentPrice = () => {
    if (auction.type === 'DUTCH' && auction.currentPrice && auction.priceDecreaseRate) {
      const elapsed = (Date.now() - new Date(auction.startTime).getTime()) / 1000;
      const currentPrice = parseInt(auction.currentPrice) - (parseInt(auction.priceDecreaseRate) * elapsed);
      return Math.max(currentPrice, parseInt(auction.minimumBid));
    }
    return parseInt(auction.minimumBid);
  };

  const handleBidSubmit = () => {
    const amount = parseFloat(bidAmount);
    if (amount > 0) {
      onBid(auction.id, amount);
      setBidAmount('');
      setShowBidInput(false);
    }
  };

  const isEnded = Date.now() > new Date(auction.endTime).getTime();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{auction.id}</h3>
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
            auction.type === 'SEALED' ? 'bg-purple-500/20 text-purple-400' :
            auction.type === 'DUTCH' ? 'bg-blue-500/20 text-blue-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            {auction.type === 'SEALED' ? 'Sealed Bid' : 
             auction.type === 'DUTCH' ? 'Dutch Auction' : 'Batch'}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs ${
          auction.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
          auction.status === 'ENDED' ? 'bg-yellow-500/20 text-yellow-400' :
          auction.status === 'SETTLED' ? 'bg-gray-500/20 text-gray-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {auction.status}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{timeRemaining()}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span className="text-sm">{auction.bidCount} bids</span>
        </div>

        {auction.type === 'DUTCH' && (
          <div className="flex items-center gap-2 text-gray-400">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">Current: ${getCurrentPrice().toLocaleString()}</span>
          </div>
        )}

        {auction.type === 'SEALED' && (
          <div className="flex items-center gap-2 text-gray-400">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Min bid: ${auction.minimumBid.toLocaleString()}</span>
          </div>
        )}
      </div>

      {auction.status === 'ACTIVE' && !isEnded && (
        <>
          {!showBidInput ? (
            <button
              onClick={() => setShowBidInput(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Place Bid
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleBidSubmit}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Submit Bid
                </button>
                <button
                  onClick={() => setShowBidInput(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {auction.status === 'ENDED' && !auction.winner && (
        <button
          onClick={() => onSettle(auction.id)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
        >
          Settle Auction
        </button>
      )}

      {auction.winner && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm font-semibold">Winner</p>
          <p className="text-white text-xs truncate">{auction.winner}</p>
          <p className="text-gray-400 text-sm mt-1">
            Amount: ${auction.winningAmount?.toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
};