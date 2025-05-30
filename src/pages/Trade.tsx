import { useState } from 'react';
import { ArrowsUpDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Trade = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('DOT');
  const [amount, setAmount] = useState('');

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl shadow-lg p-8 backdrop-blur-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-2">Trade Tokens</h2>
          <p className="text-gray-400 mb-8">Swap tokens at the best rates</p>
          
          {/* From Token */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">From</label>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex space-x-4"
            >
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="block w-1/3 rounded-xl bg-surface-dark border border-gray-800 text-white focus:border-primary focus:ring focus:ring-primary/20"
              >
                <option value="ETH">ETH</option>
                <option value="DOT">DOT</option>
                <option value="BTC">BTC</option>
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="block w-2/3 rounded-xl bg-surface-dark border border-gray-800 text-white placeholder-gray-500 focus:border-primary focus:ring focus:ring-primary/20"
              />
            </motion.div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-6">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSwap}
              className="rounded-full p-3 bg-surface-dark hover:bg-surface-light transition-colors"
            >
              <ArrowsUpDownIcon className="h-6 w-6 text-primary" />
            </motion.button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">To</label>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex space-x-4"
            >
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="block w-1/3 rounded-xl bg-surface-dark border border-gray-800 text-white focus:border-primary focus:ring focus:ring-primary/20"
              >
                <option value="DOT">DOT</option>
                <option value="ETH">ETH</option>
                <option value="BTC">BTC</option>
              </select>
              <input
                type="text"
                readOnly
                value="0.0"
                className="block w-2/3 rounded-xl bg-surface-dark border border-gray-800 text-white"
              />
            </motion.div>
          </div>

          {/* Trade Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {/* Implement trade logic */}}
            className="w-full mt-8 bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-xl font-medium shadow-glow hover:shadow-glow-strong transition-all duration-300"
          >
            Trade Now
          </motion.button>

          {/* Price Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 bg-surface-dark rounded-xl border border-gray-800"
          >
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span className="flex items-center">
                Exchange Rate
                <InformationCircleIcon className="h-4 w-4 ml-1" />
              </span>
              <span>1 {fromToken} = 15.5 {toToken}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span className="flex items-center">
                Network Fee
                <InformationCircleIcon className="h-4 w-4 ml-1" />
              </span>
              <span>~$2.50</span>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-400">
              Powered by AI for the best rates across DEXs
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Trade; 