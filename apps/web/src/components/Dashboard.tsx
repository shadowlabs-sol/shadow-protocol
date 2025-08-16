'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { Plus, Shield, Eye, Zap, RefreshCw } from 'lucide-react';
import { useShadowProtocol } from '@/context/ShadowProtocolContext';
import { AuctionCard } from './AuctionCard';
import { CreateAuctionModal } from './CreateAuctionModal';
import toast, { Toaster } from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { connected } = useWallet();
  const { 
    auctions, 
    loading, 
    createAuction, 
    submitBid, 
    settleAuction,
    refreshAuctions 
  } = useShadowProtocol();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');

  const filteredAuctions = auctions.filter((auction: any) => {
    if (filter === 'all') return true;
    if (filter === 'active') return auction.status === 'ACTIVE';
    if (filter === 'ended') return auction.status === 'ENDED' || auction.status === 'SETTLED';
    return true;
  });

  const features = [
    {
      icon: Shield,
      title: 'MEV Protection',
      description: 'Front-running resistant auctions'
    },
    {
      icon: Eye,
      title: 'Private Bids',
      description: 'Encrypted until settlement'
    },
    {
      icon: Zap,
      title: 'Instant Settlement',
      description: 'Automated winner determination'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-xl bg-black/50 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Shadow Protocol
              </h1>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-4"
          >
            Private Auctions on Solana
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-8"
          >
            Institutional-grade privacy for DeFi auctions. MEV-protected, encrypted bids, 
            and transparent settlements powered by Arcium Network.
          </motion.p>
          
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
              >
                <feature.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-2">
            {['all', 'active', 'ended'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={refreshAuctions}
              disabled={loading}
              className="p-2 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {connected && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                Create Auction
              </button>
            )}
          </div>
        </div>

        {/* Auctions Grid */}
        {!connected ? (
          <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-xl">
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Connect Wallet</h3>
            <p className="text-gray-500">Connect your wallet to view and participate in auctions</p>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading auctions...</p>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-xl">
            <p className="text-gray-400">No auctions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction: any) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onBid={submitBid}
                onSettle={settleAuction}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create Auction Modal */}
      <CreateAuctionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createAuction}
      />
    </div>
  );
};