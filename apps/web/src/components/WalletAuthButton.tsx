'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Wallet, ChevronDown, LogOut, Copy, ExternalLink, 
  User, Settings, Bell, Shield, Award, TrendingUp,
  LogIn, UserPlus, Sparkles, ArrowRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';

export const WalletAuthButton: React.FC = () => {
  const { publicKey, disconnect, wallet, connected, connecting, connect } = useWallet();
  const { setVisible } = useWalletModal();
  const { user, isAuthenticated, login, logout, refreshUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'profile'>('login');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Refresh user data when dropdown opens
  useEffect(() => {
    if (dropdownOpen && isAuthenticated) {
      const refresh = async () => {
        setIsRefreshing(true);
        await refreshUser();
        setIsRefreshing(false);
      };
      refresh();
    }
  }, [dropdownOpen, isAuthenticated, refreshUser]);
  
  // Listen for wallet selection and auto-connect
  useEffect(() => {
    if (wallet && !connected && !connecting) {
      connect().catch((err) => {
        console.error('Failed to connect wallet:', err);
        toast.error('Failed to connect wallet. Please try again.');
      });
    }
  }, [wallet, connected, connecting, connect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = useCallback(async () => {
    try {
      setVisible(true);
    } catch (error) {
      console.error('Error opening wallet modal:', error);
      toast.error('Failed to open wallet selector');
    }
  }, [setVisible]);

  const handleDisconnect = async () => {
    if (isAuthenticated) {
      await logout();
    }
    disconnect();
    setDropdownOpen(false);
    toast.success('Wallet disconnected');
  };

  const handleChangeWallet = () => {
    disconnect();
    setDropdownOpen(false);
    setTimeout(() => {
      setVisible(true);
    }, 200);
  };

  const handleLogin = () => {
    setModalMode('login');
    setShowAuthModal(true);
    setDropdownOpen(false);
  };

  const handleProfile = async () => {
    // Refresh user data before opening profile
    await refreshUser();
    setModalMode('profile');
    setShowAuthModal(true);
    setDropdownOpen(false);
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      toast.success('Address copied to clipboard');
    }
  };

  const openExplorer = () => {
    if (publicKey) {
      window.open(
        `https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`,
        '_blank'
      );
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (connecting) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-purple-200/20 rounded-xl text-gray-600"
      >
        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        Connecting...
      </button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <div className="relative">
        <motion.button
          onClick={handleConnect}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-200/50 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </motion.button>
      </div>
    );
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <motion.button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-purple-100 rounded-xl hover:border-purple-300 transition-all group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* User Avatar or Wallet Icon */}
          <div className="relative">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Avatar" 
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : wallet?.adapter.icon ? (
              <img 
                src={wallet.adapter.icon} 
                alt={wallet.adapter.name} 
                className="w-8 h-8 rounded-lg"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {publicKey.toBase58().charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Auth Status Indicator */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              isAuthenticated ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
          </div>
          
          <div className="flex flex-col items-start">
            {user?.username ? (
              <>
                <span className="text-sm font-semibold text-gray-900">
                  {user.username}
                </span>
                <span className="text-xs text-gray-500">
                  {truncateAddress(publicKey.toBase58())}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {truncateAddress(publicKey.toBase58())}
              </span>
            )}
          </div>
          
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform group-hover:text-gray-600 ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </motion.button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.15 
              }}
              className="absolute right-0 mt-3 w-80 bg-white/98 backdrop-blur-2xl border border-purple-100/50 rounded-3xl shadow-2xl shadow-purple-200/20 overflow-hidden z-50"
            >
              {/* User Info Section */}
              <div className="relative p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-purple-100">
                {isRefreshing && (
                  <div className="absolute top-2 right-2">
                    <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 
                         publicKey.toBase58().charAt(0).toUpperCase()}
                      </div>
                    )}
                    {user?.verified && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                        <Shield className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {isAuthenticated ? (
                      <>
                        <p className="font-semibold text-gray-900">
                          {user?.username || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {wallet?.adapter.name}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-gray-900">Not Signed In</p>
                        <p className="text-xs text-gray-500">
                          {wallet?.adapter.name}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Quick Stats with animations */}
                {isAuthenticated && (
                  <motion.div 
                    className="mt-3 grid grid-cols-3 gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isRefreshing ? 0.5 : 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <motion.div 
                      className="text-center p-2.5 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.p 
                        className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                        key={user?.totalBids}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                      >
                        {user?.totalBids || 0}
                      </motion.p>
                      <p className="text-xs text-gray-600 font-medium">Bids</p>
                    </motion.div>
                    <motion.div 
                      className="text-center p-2.5 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.p 
                        className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                        key={user?.auctionsWon}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                      >
                        {user?.auctionsWon || 0}
                      </motion.p>
                      <p className="text-xs text-gray-600 font-medium">Won</p>
                    </motion.div>
                    <motion.div 
                      className="text-center p-2.5 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.p 
                        className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                        key={user?.totalVolume}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                      >
                        {user?.totalVolume ? `${(Number(user.totalVolume) / 1e9).toFixed(1)}` : '0'}
                      </motion.p>
                      <p className="text-xs text-gray-600 font-medium">SOL</p>
                    </motion.div>
                  </motion.div>
                )}
              </div>

              <div className="p-2">
                {!isAuthenticated ? (
                  <motion.button
                    onClick={handleLogin}
                    className="w-full flex items-center gap-3 px-4 py-3 mb-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-200/50 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Sign In with Wallet</span>
                    <Sparkles className="w-5 h-5 ml-auto animate-pulse" />
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      onClick={handleProfile}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all group"
                      whileHover={{ x: 2 }}
                    >
                      <User className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">My Profile</span>
                      <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                    
                    <motion.button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all relative group"
                      whileHover={{ x: 2 }}
                    >
                      <Bell className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Notifications</span>
                      <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full animate-pulse">
                        3
                      </span>
                    </motion.button>
                    
                    <motion.button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all group"
                      whileHover={{ x: 2 }}
                    >
                      <Settings className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Settings</span>
                      <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  </>
                )}

                <div className="border-t border-gray-200 my-2" />

                <button
                  onClick={copyAddress}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Address
                </button>

                <button
                  onClick={openExplorer}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </button>

                <button
                  onClick={handleChangeWallet}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  Change Wallet
                </button>

                <div className="border-t border-gray-200 my-2" />

                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={modalMode}
      />
    </>
  );
};