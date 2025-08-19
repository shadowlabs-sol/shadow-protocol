'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink, Settings, Bell, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { SettingsModal } from './SettingsModal';
import { NotificationsPanel } from './NotificationsPanel';

export const WalletButton: React.FC = () => {
  const { publicKey, disconnect, wallet, connected, connecting, select, wallets, connect } = useWallet();
  const { setVisible } = useWalletModal();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Listen for wallet selection and auto-connect
  useEffect(() => {
    if (wallet && !connected && !connecting) {
      connect().catch((err) => {
        console.error('Failed to connect wallet:', err);
        toast.error('Failed to connect wallet. Please try again.');
      });
    }
  }, [wallet, connected, connecting, connect]);

  // Check for unread notifications
  useEffect(() => {
    if (publicKey) {
      const checkUnread = () => {
        const key = `notifications_${publicKey.toBase58()}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const notifications = JSON.parse(saved);
            const unread = notifications.filter((n: any) => !n.read).length;
            setUnreadCount(unread);
          } catch (error) {
            console.error('Failed to load notifications:', error);
          }
        }
      };
      
      checkUnread();
      const interval = setInterval(checkUnread, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [publicKey]);

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
      // First try to open the modal
      setVisible(true);
      
      // If wallets are available, log them for debugging
      if (wallets && wallets.length > 0) {
        console.log('Available wallets:', wallets.map(w => w.adapter.name));
      }
    } catch (error) {
      console.error('Error opening wallet modal:', error);
      toast.error('Failed to open wallet selector');
    }
  }, [setVisible, wallets]);

  const handleDisconnect = () => {
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
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
      >
        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        Connecting...
      </button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <div className="relative">
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
      >
        {wallet?.adapter.icon && (
          <img 
            src={wallet.adapter.icon} 
            alt={wallet.adapter.name} 
            className="w-5 h-5"
          />
        )}
        <span className="text-white font-medium">
          {truncateAddress(publicKey.toBase58())}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-1">
                {wallet?.adapter.icon && (
                  <img 
                    src={wallet.adapter.icon} 
                    alt={wallet.adapter.name} 
                    className="w-5 h-5"
                  />
                )}
                <span className="text-sm font-medium text-white">
                  {wallet?.adapter.name}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {publicKey.toBase58()}
              </div>
            </div>

            <div className="p-1">
              <button
                onClick={copyAddress}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </button>

              <button
                onClick={openExplorer}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </button>

              <div className="border-t border-gray-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    setNotificationsOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSettingsOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>

              <div className="border-t border-gray-800 mt-1 pt-1">
                <button
                  onClick={handleChangeWallet}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  Change Wallet
                </button>
              </div>

              <div className="border-t border-gray-800 mt-1 pt-1">
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
};