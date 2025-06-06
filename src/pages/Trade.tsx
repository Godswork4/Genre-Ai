import { useState } from 'react';
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Trade = () => {
  const [fromToken, setFromToken] = useState('TRN');
  const [toToken, setToToken] = useState('ROOT');
  const [amount, setAmount] = useState('');

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] pt-6">
      <div className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1b1f] rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Swap</h2>
            <button className="text-blue-500 hover:text-blue-400">
              <ArrowsUpDownIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* From Token */}
          <div className="space-y-4">
            <div className="bg-[#212226] rounded-lg p-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-2xl text-white placeholder-gray-500 outline-none"
              />
              <div className="flex justify-between items-center mt-2">
                <button className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20">
                  <span className="text-blue-500">{fromToken}</span>
                </button>
                <span className="text-gray-400 text-sm">Balance: 1,234.56 {fromToken}</span>
          </div>
          </div>

          {/* To Token */}
            <div className="bg-[#212226] rounded-lg p-4">
              <input
                type="text"
                readOnly
                value="0"
                className="w-full bg-transparent text-2xl text-white outline-none"
              />
              <div className="flex justify-between items-center mt-2">
                <button className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20">
                  <span className="text-blue-500">{toToken}</span>
                </button>
                <span className="text-gray-400 text-sm">Balance: 557.63 {toToken}</span>
              </div>
            </div>
          </div>

          {/* Swap Details */}
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">APY</span>
              <span className="text-white">15.24%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Unlock timer</span>
              <span className="text-white">7 days</span>
            </div>
          </div>

          {/* Swap Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Swap
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Trade; 