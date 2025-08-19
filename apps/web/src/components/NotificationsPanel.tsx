'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Gavel,
  DollarSign,
  Trophy,
  AlertCircle,
  Check,
  X,
  Clock,
  Trash2,
  Archive
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  type: 'bid' | 'auction' | 'settlement' | 'win' | 'outbid' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    auctionId?: string;
    amount?: number;
    bidder?: string;
    txHash?: string;
  };
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const { publicKey } = useWallet();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);

  // Load notifications from localStorage
  useEffect(() => {
    if (publicKey) {
      loadNotifications();
    }
  }, [publicKey]);

  // Subscribe to notification events
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent<Notification>) => {
      const newNotification = event.detail;
      setNotifications(prev => [newNotification, ...prev]);
      
      // Save to localStorage
      if (publicKey) {
        const key = `notifications_${publicKey.toBase58()}`;
        const updated = [newNotification, ...notifications];
        localStorage.setItem(key, JSON.stringify(updated.slice(0, 50))); // Keep last 50
      }
      
      // Show toast if settings allow
      const settings = localStorage.getItem('shadowProtocolSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.notifications[newNotification.type] !== false) {
          toast.success(newNotification.title, {
            duration: 4000,
            icon: getNotificationIcon(newNotification.type)
          });
        }
      }
    };

    window.addEventListener('shadowNotification', handleNewNotification as EventListener);
    return () => {
      window.removeEventListener('shadowNotification', handleNewNotification as EventListener);
    };
  }, [publicKey, notifications]);

  const loadNotifications = () => {
    if (!publicKey) return;
    
    const key = `notifications_${publicKey.toBase58()}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    } else {
      // Load sample notifications for demo
      setNotifications([
        {
          id: '1',
          type: 'bid',
          title: 'New Bid Received',
          message: 'Someone placed a bid of 2.5 SOL on your auction',
          timestamp: Date.now() - 3600000,
          read: false,
          metadata: { auctionId: '123', amount: 2.5 }
        },
        {
          id: '2',
          type: 'win',
          title: 'You Won an Auction!',
          message: 'Congratulations! You won the NFT auction with a bid of 5 SOL',
          timestamp: Date.now() - 7200000,
          read: false,
          metadata: { auctionId: '456', amount: 5 }
        },
        {
          id: '3',
          type: 'settlement',
          title: 'Auction Settled',
          message: 'Your auction has been settled. Winner: 5FHw...2UJnM',
          timestamp: Date.now() - 86400000,
          read: true,
          metadata: { auctionId: '789' }
        }
      ]);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'bid': return '💰';
      case 'auction': return '🔨';
      case 'settlement': return '✅';
      case 'win': return '🏆';
      case 'outbid': return '⚠️';
      case 'system': return 'ℹ️';
      default: return '📬';
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'bid': return <DollarSign className="w-4 h-4" />;
      case 'auction': return <Gavel className="w-4 h-4" />;
      case 'settlement': return <Check className="w-4 h-4" />;
      case 'win': return <Trophy className="w-4 h-4" />;
      case 'outbid': return <AlertCircle className="w-4 h-4" />;
      case 'system': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'bid': return 'text-green-400 bg-green-400/10';
      case 'auction': return 'text-blue-400 bg-blue-400/10';
      case 'settlement': return 'text-purple-400 bg-purple-400/10';
      case 'win': return 'text-yellow-400 bg-yellow-400/10';
      case 'outbid': return 'text-orange-400 bg-orange-400/10';
      case 'system': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    saveNotifications();
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    saveNotifications();
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    saveNotifications();
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications();
    toast.success('All notifications cleared');
  };

  const saveNotifications = () => {
    if (!publicKey) return;
    const key = `notifications_${publicKey.toBase58()}`;
    localStorage.setItem(key, JSON.stringify(notifications));
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-800 flex gap-2">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Check className="w-3 h-3" />
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Archive className="w-12 h-12 mb-3" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-purple-500/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg ${getIconColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(notification.timestamp)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper function to emit notifications
export const emitNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const event = new CustomEvent('shadowNotification', {
    detail: {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false
    }
  });
  window.dispatchEvent(event);
};