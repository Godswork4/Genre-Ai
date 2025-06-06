import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TRNService } from '../services/trnService';
import { useAuth } from '../store/authStore';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  value: number;
  change24h: number;
}

interface PoolPosition {
  id: string;
  liquidity: string;
  apy: number;
  value: number;
}

const Portfolio: React.FC = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [pools, setPools] = useState<PoolPosition[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) return;

      try {
        // Fetch token balances and rates
        const tokenData = await Promise.all([
          {
            symbol: 'trn',
            name: 'TRN',
            balance: await TRNService.getTokenBalance(user.futurePassAddress, 'trn'),
            rate: (await TRNService.getExchangeRate('trn', 'usdt')).rate
          },
          {
            symbol: 'root',
            name: 'ROOT',
            balance: await TRNService.getTokenBalance(user.futurePassAddress, 'root'),
            rate: (await TRNService.getExchangeRate('root', 'usdt')).rate
          }
        ]);

        // Calculate token values
        const tokenBalances = tokenData.map(token => ({
          symbol: token.symbol,
          name: token.name,
          balance: token.balance,
          value: parseFloat(token.balance) * token.rate,
          change24h: 0 // Implement price change tracking
        }));

        // Fetch pool positions
        const poolData = await Promise.all([
          TRNService.getPoolInfo('trn-root'),
          TRNService.getPoolInfo('trn-usdt'),
          TRNService.getPoolInfo('root-usdt')
        ]);

        const poolPositions = poolData.map((pool, index) => ({
          id: ['TRN-ROOT', 'TRN-USDT', 'ROOT-USDT'][index],
          liquidity: pool.totalLiquidity,
          apy: pool.apy,
          value: parseFloat(pool.totalLiquidity)
        }));

        setTokens(tokenBalances);
        setPools(poolPositions);
        setTotalValue(
          tokenBalances.reduce((sum, token) => sum + token.value, 0) +
          poolPositions.reduce((sum, pool) => sum + pool.value, 0)
        );
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setError('Failed to fetch portfolio data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [user]);

  return (
    <div className="space-y-6">
        {/* Portfolio Overview */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
          <p className="text-xl text-white">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Token Balances */}
          <div className="bg-[#1a1b1f] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Token Balances</h3>
            <div className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-16 bg-[#212226] rounded-lg" />
                  ))}
                </div>
              ) : tokens.length > 0 ? (
                tokens.map(token => (
        <motion.div
                    key={token.symbol}
                    initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-[#212226] rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-white">{token.name}</h4>
                      <p className="text-sm text-gray-400">{token.balance} {token.symbol.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">${token.value.toLocaleString()}</p>
                      <p className={`text-sm ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No tokens found</p>
              )}
                    </div>
                  </div>

          {/* Pool Positions */}
          <div className="bg-[#1a1b1f] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pool Positions</h3>
            <div className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-[#212226] rounded-lg" />
                  ))}
                </div>
              ) : pools.length > 0 ? (
                pools.map(pool => (
        <motion.div
                    key={pool.id}
                    initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-[#212226] rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-white">{pool.id}</h4>
                      <p className="text-sm text-gray-400">
                        ${parseFloat(pool.liquidity).toLocaleString()} TVL
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">${pool.value.toLocaleString()}</p>
                      <p className="text-sm text-green-500">{pool.apy}% APY</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No pool positions found</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
      </div>
      )}
    </div>
  );
};

export default Portfolio; 