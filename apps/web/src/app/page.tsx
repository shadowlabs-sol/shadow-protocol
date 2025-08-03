'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  Clock, 
  TrendingUp, 
  Lock,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AuctionGrid } from '@/components/auctions/AuctionGrid';
import { CreateAuctionModal } from '@/components/auctions/CreateAuctionModal';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useShadowProtocol } from '@/hooks/useShadowProtocol';
import { AuctionType } from '@shadow-protocol/shared';

export default function HomePage() {
  const { connected } = useWallet();
  const { client, auctions, loading } = useShadowProtocol();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    totalVolume: 0,
    averageBids: 0,
  });

  useEffect(() => {
    if (auctions) {
      const activeCount = auctions.filter(a => a.status === 1).length;
      const totalVolume = auctions.reduce((sum, a) => sum + (a.winningAmount || 0), 0);
      const avgBids = auctions.length > 0 ? 
        auctions.reduce((sum, a) => sum + a.bidCount, 0) / auctions.length : 0;

      setStats({
        totalAuctions: auctions.length,
        activeAuctions: activeCount,
        totalVolume,
        averageBids: Math.round(avgBids * 10) / 10,
      });
    }
  }, [auctions]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-shadow-900 via-shadow-800 to-shadow-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-shadow-800/50 border border-shadow-700 mb-8">
              <Shield className="w-4 h-4 mr-2 text-auction-sealed" />
              <span className="text-sm font-medium">Powered by Arcium MPC Technology</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-shadow-200 to-shadow-400 bg-clip-text text-transparent">
              Privacy-First Auctions
            </h1>
            
            <p className="text-xl lg:text-2xl text-shadow-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              The first truly private auction platform on Solana. Create and participate in 
              sealed-bid auctions with complete privacy until settlement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {connected ? (
                <>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    size="lg"
                    className="bg-auction-sealed hover:bg-auction-sealed/80 text-white px-8 py-4 text-lg font-semibold"
                  >
                    Create Auction
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-shadow-600 text-white hover:bg-shadow-800 px-8 py-4 text-lg"
                    onClick={() => document.getElementById('auctions')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Browse Auctions
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-shadow-400 mb-4">Connect your wallet to get started</p>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-shadow-600 text-white hover:bg-shadow-800"
                  >
                    Connect Wallet
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-shadow-900 mb-4">
              Why Shadow Protocol?
            </h2>
            <p className="text-xl text-shadow-600 max-w-2xl mx-auto">
              Traditional auctions are broken. We fix them with cutting-edge cryptography.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Eye className="w-8 h-8" />,
                title: "Complete Privacy",
                description: "Bids remain encrypted until auction settlement. No front-running, no manipulation.",
                color: "text-auction-sealed"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Instant Settlement",
                description: "Powered by Arcium's MPC technology for fast, secure, and trustless settlements.",
                color: "text-yellow-500"
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: "MEV Protection",
                description: "Encrypted order flow eliminates MEV extraction and sandwich attacks.",
                color: "text-auction-dutch"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Fair Price Discovery",
                description: "True market prices without information leakage or bid manipulation.",
                color: "text-green-500"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Multiple Formats",
                description: "Sealed-bid, Dutch auctions, and batch settlements for any use case.",
                color: "text-auction-batch"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enterprise Ready",
                description: "Institutional-grade privacy for high-value transactions and corporate use.",
                color: "text-red-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-auction-hover transition-shadow duration-300">
                  <div className={`${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-shadow-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-shadow-600">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {connected && (
        <section className="py-16 bg-shadow-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Auctions"
                value={stats.totalAuctions}
                icon={<TrendingUp className="w-6 h-6" />}
                trend={+12}
              />
              <StatsCard
                title="Active Auctions"
                value={stats.activeAuctions}
                icon={<Clock className="w-6 h-6" />}
                trend={+5}
              />
              <StatsCard
                title="Total Volume"
                value={`${(stats.totalVolume / 1000000).toFixed(1)}M SOL`}
                icon={<Zap className="w-6 h-6" />}
                trend={+25}
              />
              <StatsCard
                title="Avg. Bids/Auction"
                value={stats.averageBids}
                icon={<Eye className="w-6 h-6" />}
                trend={+8}
              />
            </div>
          </div>
        </section>
      )}

      {/* Active Auctions Section */}
      <section id="auctions" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-shadow-900 mb-4">
              {connected ? 'Active Auctions' : 'Example Auctions'}
            </h2>
            <p className="text-xl text-shadow-600 max-w-2xl mx-auto">
              {connected 
                ? 'Participate in live auctions with complete privacy'
                : 'Connect your wallet to view and participate in real auctions'
              }
            </p>
          </motion.div>

          {connected ? (
            <AuctionGrid 
              auctions={auctions || []} 
              loading={loading}
              onCreateAuction={() => setShowCreateModal(true)}
            />
          ) : (
            <div className="text-center py-16">
              <div className="mb-8 text-shadow-400">
                <Lock className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Connect your wallet to view auctions</p>
              </div>
              <Button size="lg" className="bg-auction-sealed hover:bg-auction-sealed/80">
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Create Auction Modal */}
      {showCreateModal && (
        <CreateAuctionModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Refresh auctions
          }}
        />
      )}
    </div>
  );
}