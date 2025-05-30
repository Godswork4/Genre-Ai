import { useState } from 'react';
import { CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Portfolio = () => {
  const [assets] = useState([
    {
      name: 'Ethereum',
      symbol: 'ETH',
      amount: '2.5',
      value: 4500.00,
      change: 5.2,
    },
    {
      name: 'Polkadot',
      symbol: 'DOT',
      amount: '150',
      value: 750.00,
      change: -2.1,
    },
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: '0.45',
      value: 15750.00,
      change: 3.8,
    },
  ]);

  const totalValue = assets.reduce((acc, asset) => acc + asset.value, 0);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl shadow-lg p-8 backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
              <p className="mt-1 text-gray-400">Track your assets and performance</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center bg-surface-dark rounded-xl p-4">
                <CurrencyDollarIcon className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Assets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-surface rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Your Assets</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {assets.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-6 py-4 hover:bg-surface-light transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                        <span className="text-white font-semibold">{asset.symbol}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-white">{asset.name}</h4>
                      <p className="text-sm text-gray-400">{asset.amount} {asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-white">${asset.value.toLocaleString()}</p>
                    <div className="flex items-center justify-end">
                      {asset.change >= 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`ml-1 text-sm ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(asset.change)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-surface rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Performance</h3>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-lg"></div>
            <div className="h-64 bg-surface-dark rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Performance chart will be implemented here</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { title: 'Deposit', description: 'Add funds to your portfolio' },
            { title: 'Trade', description: 'Swap between assets' },
            { title: 'Withdraw', description: 'Withdraw to your wallet' },
          ].map((action, index) => (
            <motion.button
              key={action.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 bg-surface rounded-xl hover:shadow-glow transition-all duration-300"
            >
              <h4 className="text-lg font-semibold text-white">{action.title}</h4>
              <p className="mt-1 text-sm text-gray-400">{action.description}</p>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Portfolio; 