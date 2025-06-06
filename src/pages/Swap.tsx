import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import { useDemoStore } from '../store/demoStore';
import { createPublicClient, createWalletClient, http, parseEther, formatEther, getAddress } from 'viem';
import { rootNetwork } from '../config/web3.config';
import { DEX_CONFIG, swapContractABI, TOKEN_ADDRESSES, erc20ABI } from '../config/contracts';
import { TRNService } from '../services/trnService';
import { 
  RootIcon, 
  TrnIcon, 
  UsdtIcon 
} from '../components/Icons';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const TOKEN_ICONS = {
  ROOT: RootIcon,
  TRN: TrnIcon,
  USDT: UsdtIcon
};

const Swap: React.FC = () => {
  const { user } = useAuth();
  const { isDemoMode, demoWallet } = useDemoStore();
  const [fromToken, setFromToken] = useState('ROOT');
  const [toToken, setToToken] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [estimatedOutput, setEstimatedOutput] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [needsApproval, setNeedsApproval] = useState(false);

  // Create public client for reading blockchain data
  const publicClient = createPublicClient({
    chain: rootNetwork,
    transport: http()
  });

  // Create wallet client for writing transactions
  const walletClient = createWalletClient({
    chain: rootNetwork,
    transport: http()
  });

  const getTokenPath = (from: string, to: string) => {
    const fromAddress = from === 'ROOT' ? TOKEN_ADDRESSES.ROOT : TOKEN_ADDRESSES[from as keyof typeof TOKEN_ADDRESSES];
    const toAddress = to === 'ROOT' ? TOKEN_ADDRESSES.ROOT : TOKEN_ADDRESSES[to as keyof typeof TOKEN_ADDRESSES];
    return [fromAddress, toAddress].map(addr => getAddress(addr)) as [`0x${string}`, `0x${string}`];
  };

  // Fetch balances
  useEffect(() => {
    const fetchBalances = async () => {
      const activeAddress = isDemoMode ? demoWallet?.address : user?.futurePassAddress;
      if (!activeAddress) return;

      try {
        const newBalances: Record<string, string> = {};

        // Fetch ROOT balance using TRNService
        const rootBalance = await TRNService.getTokenBalance(activeAddress, 'root');
        newBalances['ROOT'] = rootBalance;

        // Fetch TRN balance
        const trnBalance = await TRNService.getTokenBalance(activeAddress, 'trn');
        newBalances['TRN'] = trnBalance;

        // Fetch USDT balance
        const usdtBalance = await TRNService.getTokenBalance(activeAddress, 'usdt');
        newBalances['USDT'] = usdtBalance;

        setBalances(newBalances);
        setError('');
      } catch (err) {
        console.error('Error fetching balances:', err);
        setError('Failed to fetch balances');
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000); // Refresh balances every 10 seconds
    return () => clearInterval(interval);
  }, [isDemoMode, demoWallet, user]);

  // Check if approval is needed
  useEffect(() => {
    const checkApproval = async () => {
      if (fromToken === 'ROOT' || !amount) {
        setNeedsApproval(false);
        return;
      }

      const activeAddress = isDemoMode ? demoWallet?.address : user?.futurePassAddress;
      if (!activeAddress) return;

      try {
        const formattedAddress = getAddress(activeAddress);
        const tokenAddress = getAddress(TOKEN_ADDRESSES[fromToken as keyof typeof TOKEN_ADDRESSES]);
        
        const allowance = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20ABI,
          functionName: 'allowance',
          args: [formattedAddress, getAddress(DEX_CONFIG.ROUTER_ADDRESS)]
        });

        setNeedsApproval(allowance < parseEther(amount));
      } catch (err) {
        console.error('Error checking allowance:', err);
        setNeedsApproval(true);
      }
    };

    checkApproval();
  }, [fromToken, amount, isDemoMode, demoWallet, user]);

  const handleApprove = async () => {
    const activeAddress = isDemoMode ? demoWallet?.address : user?.futurePassAddress;
    if (!activeAddress) {
      setError('No wallet connected');
      return;
    }

    try {
      setIsLoading(true);
      const formattedAddress = getAddress(activeAddress);
      const tokenAddress = getAddress(TOKEN_ADDRESSES[fromToken as keyof typeof TOKEN_ADDRESSES]);

      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'approve',
        args: [getAddress(DEX_CONFIG.ROUTER_ADDRESS), parseEther('999999999')],
        account: formattedAddress
      });

      await publicClient.waitForTransactionReceipt({ hash });
      setNeedsApproval(false);
      setError('');
    } catch (err) {
      console.error('Approval error:', err);
      setError('Failed to approve token');
    } finally {
      setIsLoading(false);
    }
  };

  // Get price estimate
  useEffect(() => {
    const estimateSwap = async () => {
      if (!amount || parseFloat(amount) <= 0) {
        setEstimatedOutput('0');
        return;
      }

      try {
        setIsLoading(true);
        const path = getTokenPath(fromToken, toToken);
        
        const amounts = await publicClient.readContract({
          address: getAddress(DEX_CONFIG.ROUTER_ADDRESS),
          abi: swapContractABI,
          functionName: 'getAmountsOut',
          args: [parseEther(amount), path]
        });
        
        setEstimatedOutput(formatEther(amounts[1])); // amounts[1] is the output amount
        setError('');
      } catch (err) {
        console.error('Estimation error:', err);
        setError('Failed to estimate swap. The pool might not exist or have enough liquidity.');
        setEstimatedOutput('0');
      } finally {
        setIsLoading(false);
      }
    };

    estimateSwap();
  }, [fromToken, toToken, amount]);

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const activeAddress = isDemoMode ? demoWallet?.address : user?.futurePassAddress;
    if (!activeAddress) {
      setError('No wallet connected');
      return;
    }

    // Check balance
    const balance = balances[fromToken];
    if (!balance || parseFloat(balance) < parseFloat(amount)) {
      setError(`Insufficient ${fromToken} balance`);
      return;
    }

    try {
      setIsLoading(true);
      const path = getTokenPath(fromToken, toToken);
      const amountIn = parseEther(amount);
      const slippage = 0.005; // 0.5% slippage
      
      // Get current output amount for slippage calculation
      const amounts = await publicClient.readContract({
        address: getAddress(DEX_CONFIG.ROUTER_ADDRESS),
        abi: swapContractABI,
        functionName: 'getAmountsOut',
        args: [amountIn, path]
      });
      
      const minOutput = amounts[1] * BigInt(Math.floor((1 - slippage) * 1000)) / BigInt(1000);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 minutes

      let hash;
      const formattedAddress = getAddress(activeAddress);

      if (fromToken === 'ROOT') {
        // Swapping ROOT (native token) for another token
        hash = await walletClient.writeContract({
          address: getAddress(DEX_CONFIG.ROUTER_ADDRESS),
          abi: swapContractABI,
          functionName: 'swapExactETHForTokens',
          args: [minOutput, path, formattedAddress, deadline],
          account: formattedAddress,
          value: amountIn
        });
      } else if (toToken === 'ROOT') {
        // Swapping token for ROOT (native token)
        hash = await walletClient.writeContract({
          address: getAddress(DEX_CONFIG.ROUTER_ADDRESS),
          abi: swapContractABI,
          functionName: 'swapExactTokensForETH',
          args: [amountIn, minOutput, path, formattedAddress, deadline],
          account: formattedAddress
        });
      } else {
        // Token to token swap
        hash = await walletClient.writeContract({
          address: getAddress(DEX_CONFIG.ROUTER_ADDRESS),
          abi: swapContractABI,
          functionName: 'swapExactTokensForTokens',
          args: [amountIn, minOutput, path, formattedAddress, deadline],
          account: formattedAddress
        });
      }

      await publicClient.waitForTransactionReceipt({ hash });
      setError('');
      alert(`Swap successful! Transaction hash: ${hash}`);
      
      // Reset form
      setAmount('');
      setEstimatedOutput('0');
    } catch (err) {
      console.error('Swap error:', err);
      setError('Failed to execute swap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Swap Tokens</h2>
        
        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Connected Wallet</div>
                <div className="text-sm font-mono">
                  {isDemoMode 
                    ? demoWallet?.address 
                    : user?.futurePassAddress?.slice(0, 6) + '...' + user?.futurePassAddress?.slice(-4)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                {isDemoMode ? 'Demo Mode' : 'FuturePass'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <div className="flex justify-between items-center mb-1">
              <span>Balance: {balances[fromToken] || '0.00'} {fromToken}</span>
              <button 
                onClick={() => setAmount(balances[fromToken] || '0')}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Max
              </button>
            </div>
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="w-full bg-gray-700 rounded p-2 flex items-center"
            >
              {Object.entries(TOKEN_ICONS).map(([symbol, Icon]) => (
                <option key={symbol} value={symbol} className="flex items-center gap-2">
                  <Icon className="w-5 h-5 mr-2" /> {symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-gray-700 rounded p-2 mt-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <div className="flex justify-between items-center mb-1">
              <span>Balance: {balances[toToken] || '0.00'} {toToken}</span>
            </div>
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="w-full bg-gray-700 rounded p-2 flex items-center"
            >
              {Object.entries(TOKEN_ICONS).map(([symbol, Icon]) => (
                symbol !== fromToken && (
                  <option key={symbol} value={symbol} className="flex items-center gap-2">
                    <Icon className="w-5 h-5 mr-2" /> {symbol}
                  </option>
                )
              ))}
            </select>
            <input
              type="text"
              value={estimatedOutput}
              readOnly
              className="w-full bg-gray-700 rounded p-2 mt-2"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {needsApproval ? (
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded p-3 font-semibold transition-colors"
            >
              {isLoading ? 'Approving...' : 'Approve Token'}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded p-3 font-semibold transition-colors"
            >
              {isLoading ? 'Processing...' : 'Swap'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Swap; 