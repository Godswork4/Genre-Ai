import React, { useEffect, useState } from 'react';
import { LiquidStakingService } from '../services/liquidStakingService';
import { useAuth } from '../store/authStore';
import { useDemoStore } from '../store/demoStore';
import { StakeForm } from '../components/Staking/StakeForm';
import { UnstakeForm } from '../components/Staking/UnstakeForm';
import { StakingStats } from '../components/Staking/StakingStats';
import { ValidatorList } from '../components/Staking/ValidatorList';
import { StakingPosition } from '../components/Staking/StakingPosition';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Staking: React.FC = () => {
  const { user } = useAuth();
  const { isDemoMode, demoWallet } = useDemoStore();
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [poolStats, setPoolStats] = useState<{
    totalStaked: string;
    exchangeRate: string;
    apy: number;
  }>();

  useEffect(() => {
    const loadPoolStats = async () => {
      try {
        const stats = await LiquidStakingService.getPoolStats();
        setPoolStats(stats);
      } catch (error) {
        console.error('Error loading pool stats:', error);
      }
    };

    loadPoolStats();
    // Refresh stats every minute
    const interval = setInterval(loadPoolStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Wallet Info */}
      <div className="mb-8 bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <UserCircleIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Connected Wallet</div>
              <div className="text-lg font-mono text-white">
                {isDemoMode 
                  ? demoWallet?.address 
                  : user?.futurePassAddress?.slice(0, 6) + '...' + user?.futurePassAddress?.slice(-4)}
              </div>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-400">
            {isDemoMode ? 'Demo Mode' : 'FuturePass'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Staking Forms */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'stake'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setActiveTab('stake')}
              >
                Stake
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'unstake'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setActiveTab('unstake')}
              >
                Unstake
              </button>
            </div>

            {activeTab === 'stake' ? (
              <StakeForm exchangeRate={poolStats?.exchangeRate} />
            ) : (
              <UnstakeForm exchangeRate={poolStats?.exchangeRate} />
            )}
          </div>

          {/* Validator List */}
          <div className="mt-8">
            <ValidatorList />
          </div>
        </div>

        {/* Right Column - Stats & Position */}
        <div>
          {/* Staking Stats */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <StakingStats
              totalStaked={poolStats?.totalStaked}
              apy={poolStats?.apy}
              exchangeRate={poolStats?.exchangeRate}
            />
          </div>

          {/* User's Staking Position */}
          {(user?.futurePassAddress || isDemoMode) && (
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <StakingPosition userAddress={isDemoMode ? demoWallet?.address! : user?.futurePassAddress!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Staking; 