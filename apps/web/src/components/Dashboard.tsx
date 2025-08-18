'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from './WalletButton';
import { motion } from 'framer-motion';
import { Plus, Shield, Eye, Zap, RefreshCw } from 'lucide-react';
import { useShadowProtocol } from '@/context/ShadowProtocolContext';
import { AuctionCard } from './AuctionCard';
import { CreateAuctionModal } from './CreateAuctionModal';
import { AuctionManagementModal } from './AuctionManagementModal';
import toast, { Toaster } from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { 
    auctions, 
    loading, 
    createAuction, 
    submitBid, 
    settleAuction,
    deleteAuction,
    refreshAuctions 
  } = useShadowProtocol();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [showManagementModal, setShowManagementModal] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid rgba(75, 85, 99, 0.3)'
          },
        }}
      />
      
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-2xl bg-gradient-to-r from-black/80 via-gray-900/80 to-black/80 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Shadow Protocol" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Shadow Protocol
                </h1>
                <p className="text-xs text-gray-500">Private Auctions on Solana</p>
              </div>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="text-center max-w-5xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-thin text-white mb-4 tracking-tight"
          >
            Zero-Knowledge <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Auctions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 mb-8 leading-relaxed"
          >
            Institutional-grade privacy for DeFi. MEV-protected, encrypted bids, 
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-800/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-2">
            {['all', 'active', 'ended'].map((filterType) => (
              <motion.button
                key={filterType}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filterType as any)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  filter === filterType
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20'
                    : 'bg-gray-900/50 text-gray-400 border-2 border-gray-800/50 hover:border-gray-700 hover:bg-gray-900/70'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </motion.button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshAuctions}
              disabled={loading}
              className="p-3 bg-gray-900/50 border-2 border-gray-800/50 rounded-xl hover:border-gray-700 hover:bg-gray-900/70 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
            {connected && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-5 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Auction
              </motion.button>
            )}
          </div>
        </div>

        {/* Auctions Grid */}
        {!connected ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-2 border-gray-800/50 rounded-2xl backdrop-blur-sm"
          >
            <Shield className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-3">Connect Your Wallet</h3>
            <p className="text-gray-500 max-w-md mx-auto">Connect your Solana wallet to view active auctions and start bidding with complete privacy</p>
          </motion.div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-400 text-lg">Loading auctions...</p>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-2 border-gray-800/50 rounded-2xl backdrop-blur-sm"
          >
            <p className="text-gray-400 text-lg">No auctions found</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to create one!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction: any) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onBid={submitBid}
                onSettle={settleAuction}
                onManage={() => {
                  setSelectedAuction(auction);
                  setShowManagementModal(true);
                }}
                isCreator={publicKey?.toBase58() === auction.creator}
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

      {/* Auction Management Modal */}
      <AuctionManagementModal
        isOpen={showManagementModal}
        onClose={() => {
          setShowManagementModal(false);
          setSelectedAuction(null);
        }}
        auction={selectedAuction}
        onDelete={deleteAuction}
        onSettle={settleAuction}
        isCreator={publicKey?.toBase58() === selectedAuction?.creator}
      />
    </div>
  );
};