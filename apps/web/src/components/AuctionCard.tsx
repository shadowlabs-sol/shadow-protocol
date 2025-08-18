'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, DollarSign, Shield, TrendingDown, Award, ArrowRight, Loader2, Settings, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface AuctionCardProps {
  auction: any;
  onBid: (auctionId: string, amount: number) => Promise<void>;
  onSettle: (auctionId: string) => Promise<void>;
  onManage?: () => void;
  isCreator?: boolean;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction, onBid, onSettle, onManage, isCreator }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [showBidInput, setShowBidInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBid = async () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    const minBidInSol = auction.minimumBid ? parseFloat(auction.minimumBid) / 1e9 : 0;
    if (minBidInSol && amount < minBidInSol) {
      toast.error(`Minimum bid is ${minBidInSol.toFixed(4)} SOL`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onBid(auction.auctionId, amount);
      setBidAmount('');
      setShowBidInput(false);
      toast.success('Bid submitted successfully!');
    } catch (error) {
      console.error('Failed to submit bid:', error);
      toast.error('Failed to submit bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettle = async () => {
    setIsSubmitting(true);
    try {
      await onSettle(auction.auctionId);
      toast.success('Auction settled successfully!');
    } catch (error) {
      console.error('Failed to settle auction:', error);
      toast.error('Failed to settle auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeRemaining = auction.endTime ? formatDistanceToNow(new Date(auction.endTime)) : 'N/A';
  const isActive = auction.status === 'ACTIVE';
  const isEnded = auction.status === 'ENDED' || auction.status === 'SETTLED';
  const canSettle = auction.status === 'ENDED';

  const getStatusColor = () => {
    switch (auction.status) {
      case 'ACTIVE': return 'from-green-500 to-emerald-500';
      case 'ENDED': return 'from-yellow-500 to-orange-500';
      case 'SETTLED': return 'from-blue-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = () => {
    switch (auction.type) {
      case 'SEALED': return <Shield className="w-4 h-4" />;
      case 'DUTCH': return <TrendingDown className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-800/50 rounded-2xl overflow-hidden backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-pink-600/5 group-hover:to-purple-600/10 transition-all duration-500" />
      
      {/* Status Badge and Manage Button */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {onManage && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onManage}
            className="p-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all backdrop-blur-sm"
            title="Manage Auction"
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>
        )}
        <div className={`px-3 py-1.5 bg-gradient-to-r ${getStatusColor()} rounded-full flex items-center gap-1.5`}>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-white">{auction.status}</span>
        </div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gray-800/50 rounded-lg">
              {getTypeIcon()}
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {auction.type} Auction
            </span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            {auction.title || `Auction #${auction.auctionId.slice(0, 8)}`}
          </h3>
          {auction.description && (
            <p className="text-sm text-gray-400 line-clamp-2">{auction.description}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">Time Left</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {isActive ? timeRemaining : isEnded ? 'Ended' : 'Not Started'}
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">Bids</span>
            </div>
            <p className="text-sm font-semibold text-white">{auction.bidCount || 0}</p>
          </div>

          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-xs">Min Bid</span>
            </div>
            <p className="text-sm font-semibold text-white">{auction.minimumBid ? (parseFloat(auction.minimumBid) / 1e9).toFixed(4) : '0'} SOL</p>
          </div>

          {auction.type === 'DUTCH' && auction.currentPrice && (
            <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="text-xs">Current</span>
              </div>
              <p className="text-sm font-semibold text-white">{auction.currentPrice ? (parseFloat(auction.currentPrice) / 1e9).toFixed(4) : '0'} SOL</p>
            </div>
          )}
        </div>

        {/* Winner Info */}
        {auction.winner && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-300 mb-1">Winner</p>
                <p className="text-sm font-mono text-white">
                  {auction.winner.slice(0, 6)}...{auction.winner.slice(-4)}
                </p>
              </div>
              {auction.winningAmount && (
                <div className="text-right">
                  <p className="text-xs text-purple-300 mb-1">Amount</p>
                  <p className="text-sm font-bold text-white">{auction.winningAmount ? (parseFloat(auction.winningAmount) / 1e9).toFixed(4) : '0'} SOL</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Section */}
        {isActive && !showBidInput && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBidInput(true)}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 group"
          >
            <Shield className="w-4 h-4" />
            Place Encrypted Bid
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}

        {isActive && showBidInput && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="relative">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:bg-gray-800/70 focus:outline-none transition-all pr-16"
                step="0.01"
                min={auction.minimumBid || '0'}
                disabled={isSubmitting}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">SOL</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBid}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Submit Bid
                  </>
                )}
              </button>
              <button
                onClick={() => setShowBidInput(false)}
                disabled={isSubmitting}
                className="px-4 py-3 bg-gray-800/50 text-gray-400 rounded-xl hover:bg-gray-800/70 border border-gray-700/50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {canSettle && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSettle}
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Settling...
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                Settle Auction
              </>
            )}
          </motion.button>
        )}

        {auction.status === 'SETTLED' && (
          <div className="py-3 px-4 bg-gray-800/30 rounded-xl border border-gray-700/30 text-center">
            <p className="text-sm text-gray-400">Auction Completed</p>
          </div>
        )}
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
    </motion.div>
  );
};