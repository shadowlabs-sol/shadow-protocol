'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, TrendingDown, Lock } from 'lucide-react';

interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (params: any) => void;
}

export const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate 
}) => {
  const [auctionType, setAuctionType] = useState<'sealed' | 'dutch'>('sealed');
  const [formData, setFormData] = useState({
    assetMint: '',
    duration: 24,
    minimumBid: '',
    reservePrice: '',
    startingPrice: '',
    priceDecreaseRate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      type: auctionType,
      ...formData,
      duration: formData.duration * 3600, // Convert hours to seconds
      minimumBid: parseFloat(formData.minimumBid),
      reservePrice: parseFloat(formData.reservePrice),
      startingPrice: auctionType === 'dutch' ? parseFloat(formData.startingPrice) : undefined,
      priceDecreaseRate: auctionType === 'dutch' ? parseFloat(formData.priceDecreaseRate) : undefined,
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 z-50"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Auction</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Auction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAuctionType('sealed')}
                    className={`py-3 px-4 rounded-lg border transition-colors ${
                      auctionType === 'sealed'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Lock className="w-4 h-4 mx-auto mb-1" />
                    Sealed Bid
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuctionType('dutch')}
                    className={`py-3 px-4 rounded-lg border transition-colors ${
                      auctionType === 'dutch'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 mx-auto mb-1" />
                    Dutch
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Asset Mint Address
                </label>
                <input
                  type="text"
                  value={formData.assetMint}
                  onChange={(e) => handleInputChange('assetMint', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="Enter token mint address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Duration (hours)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="24"
                  min="1"
                  max="720"
                  required
                />
              </div>

              {auctionType === 'sealed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Minimum Bid
                  </label>
                  <input
                    type="number"
                    value={formData.minimumBid}
                    onChange={(e) => handleInputChange('minimumBid', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Enter minimum bid amount"
                    required
                  />
                </div>
              )}

              {auctionType === 'dutch' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Starting Price
                    </label>
                    <input
                      type="number"
                      value={formData.startingPrice}
                      onChange={(e) => handleInputChange('startingPrice', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Enter starting price"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <TrendingDown className="w-4 h-4 inline mr-1" />
                      Price Decrease Rate (per second)
                    </label>
                    <input
                      type="number"
                      value={formData.priceDecreaseRate}
                      onChange={(e) => handleInputChange('priceDecreaseRate', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Enter decrease rate"
                      step="0.01"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Reserve Price (Encrypted)
                </label>
                <input
                  type="number"
                  value={formData.reservePrice}
                  onChange={(e) => handleInputChange('reservePrice', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="Enter reserve price (will be encrypted)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This value will be encrypted using Arcium Network
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Create Auction
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};