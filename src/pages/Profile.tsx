import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { useDemoStore } from '../store/demoStore';
import { FuturePassService } from '../services/futurePassService';
import {
  WalletIcon,
  ArrowsRightLeftIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  BeakerIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDemoMode, demoWallet } = useDemoStore();
  const [network, setNetwork] = useState('testnet');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNetworkChange = (newNetwork: string) => {
    setNetwork(newNetwork);
    // Implement network switching logic here
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      if (!isDemoMode) {
        await FuturePassService.logout();
      }
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    const address = isDemoMode ? demoWallet?.address : user?.futurePassAddress;
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openFaucet = () => {
    window.open('https://faucet.rootnet.live', '_blank');
  };

  const sections = [
    {
      title: 'Wallet',
      icon: WalletIcon,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-sm text-gray-400">Current Address</p>
              <p className="font-mono text-white break-all">
                {isDemoMode
                  ? demoWallet?.address
                  : user?.futurePassAddress}
              </p>
            </div>
            <button
              onClick={copyAddress}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
              title="Copy address"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">Copy</span>
                </>
              )}
            </button>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BeakerIcon className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-white">Testnet Details</h3>
            </div>
            <p className="text-sm text-gray-400 mb-2">
              This wallet is configured for the Root Network Testnet. You'll need testnet tokens to interact with the platform.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Network:</span>
                <span className="text-blue-400">Root Network Testnet</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Chain ID:</span>
                <span className="text-blue-400">7672</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">RPC URL:</span>
                <span className="text-blue-400">wss://testnet.rootnet.live/ws</span>
              </div>
            </div>
          </div>

          <button
            onClick={openFaucet}
            className="w-full flex items-center justify-center gap-2 p-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
          >
            <BeakerIcon className="w-5 h-5" />
            Get Testnet Tokens
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </button>

          {isDemoMode && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                You are currently in Demo Mode using a testnet wallet. Get testnet tokens to start trading.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Network',
      icon: ArrowsRightLeftIcon,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNetworkChange('testnet')}
              className={`p-4 rounded-lg text-center transition-colors ${
                network === 'testnet'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
              }`}
            >
              Testnet
            </button>
            <button
              onClick={() => handleNetworkChange('mainnet')}
              disabled={isDemoMode}
              className={`p-4 rounded-lg text-center transition-colors ${
                network === 'mainnet'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
              } ${isDemoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Mainnet
            </button>
          </div>
          <p className="text-sm text-gray-400">
            {isDemoMode 
              ? 'Demo mode is restricted to testnet only'
              : network === 'testnet'
              ? 'You are connected to the Root Network Testnet'
              : 'You are connected to the Root Network Mainnet'}
          </p>
        </div>
      )
    },
    {
      title: 'Settings',
      icon: CogIcon,
      content: (
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <WalletIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Wallet Profile</h1>
            <p className="text-gray-400">
              {isDemoMode ? 'Testnet Demo Account' : 'FuturePass Account'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              {section.content}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile; 