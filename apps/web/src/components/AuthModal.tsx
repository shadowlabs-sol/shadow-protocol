'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/context/AuthContext';
import { 
  X, Wallet, Shield, CheckCircle, Loader2, 
  User, Mail, Edit2, Camera, Link2, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'profile';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  mode = 'login' 
}) => {
  const { connected, publicKey } = useWallet();
  const { user, login, isLoading, refreshUser } = useAuth();
  const [currentMode, setCurrentMode] = useState(mode);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      setCurrentMode('profile');
    } else {
      setCurrentMode('login');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    await login();
    if (user) {
      setCurrentMode('profile');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update local state with new data first for immediate feedback
      setProfileData({
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        bio: updatedUser.bio || '',
        avatar: updatedUser.avatar || '',
      });
      
      // Then refresh user in context (this will update everywhere)
      await refreshUser();
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Close modal after successful save to see the updated dropdown
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 opacity-50" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {currentMode === 'login' ? (
                /* Login View */
                <div className="relative p-8">
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="inline-flex p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-4"
                    >
                      <Shield className="w-12 h-12 text-purple-600" />
                    </motion.div>
                    
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Welcome to Shadow
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Sign in with your wallet to continue
                    </p>
                  </div>

                  {!connected ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p className="text-sm text-yellow-800">
                          Please connect your wallet first to sign in
                        </p>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold"
                      >
                        Connect Wallet
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-900">Connected Wallet</span>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-xs font-mono text-purple-700">
                          {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <Wallet className="w-5 h-5" />
                            Sign Message to Login
                          </>
                        )}
                      </motion.button>

                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Profile View */
                <div className="relative p-8">
                  <div className="text-center mb-6">
                    <div className="relative inline-block mb-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                      >
                        {profileData.avatar ? (
                          <img 
                            src={profileData.avatar} 
                            alt="Avatar" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          profileData.username?.charAt(0).toUpperCase() || 
                          user?.walletAddress.charAt(0).toUpperCase()
                        )}
                      </motion.div>
                      {isEditing && (
                        <button className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full shadow-lg">
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profileData.username || 'Anonymous User'}
                    </h2>
                    <p className="text-sm text-gray-500 font-mono">
                      {user?.walletAddress.slice(0, 8)}...{user?.walletAddress.slice(-8)}
                    </p>
                    
                    {user?.verified && (
                      <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={profileData.username}
                          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter email"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          rows={3}
                          placeholder="Tell us about yourself"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Save Changes
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditing(false)}
                          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-2xl font-bold text-gray-900">{user?.totalBids || 0}</p>
                          <p className="text-xs text-gray-600">Total Bids</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-2xl font-bold text-gray-900">{user?.auctionsWon || 0}</p>
                          <p className="text-xs text-gray-600">Auctions Won</p>
                        </div>
                      </div>
                      
                      {profileData.bio && (
                        <div className="p-4 bg-purple-50 rounded-xl">
                          <p className="text-sm text-gray-700">{profileData.bio}</p>
                        </div>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditing(true)}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};