import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3FromAddress } from '@polkadot/extension-dapp';
import type { AccountInfo, AccountData } from '@polkadot/types/interfaces';
import { SyloService } from '../services/syloService';
import { rootNetwork } from '../config/web3.config';
import { useDemoStore } from '../store/demoStore';
import { useAuth } from '../store/authStore';
import { DemoWalletService } from './demoWalletService';

const WS_URL = rootNetwork.rpcUrls.default.webSocket[0];

interface PoolInfo {
  totalLiquidity: string;
  tokenAReserve: string;
  tokenBReserve: string;
  apy: number;
  unlockPeriod: number;
}

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

// Custom type definitions for TRN blockchain types
interface TRNAccountData {
  free: { toString(): string };
  reserved: { toString(): string };
}

interface TRNAccountInfo {
  data: TRNAccountData;
}

interface TRNPoolData {
  totalLiquidity: { toString(): string };
  tokenAReserve: { toString(): string };
  tokenBReserve: { toString(): string };
  apy: { toString(): string };
  unlockPeriod: { toString(): string };
}

interface TRNTokenMetadata {
  name: { toString(): string };
  symbol: { toString(): string };
  decimals: { toString(): string };
  totalSupply: { toString(): string };
}

interface AMMPoolConfig {
  initialA: string;
  futureA: string;
  initialATime: number;
  futureATime: number;
  swapFee: string;
  adminFee: string;
}

interface LiquidityPosition {
  poolId: string;
  lpTokens: string;
  rewards: string;
  lockedUntil: number;
}

interface DemoBalances {
  [key: string]: string;
  trn: string;
  root: string;
  usdt: string;
}

interface DemoPool {
  totalLiquidity: string;
  tokenAReserve: string;
  tokenBReserve: string;
  apy: number;
  unlockPeriod: number;
}

interface DemoPools {
  [key: string]: DemoPool;
}

interface ExchangeRate {
  rate: number;
  apy: number;
  unlockTime: number;
}

interface DemoExchangeRates {
  [key: string]: ExchangeRate;
}

interface Pool {
  id: string;
  totalLiquidity: string;
  apy: number;
}

interface Transaction {
  hash: string;
  type: 'swap' | 'stake' | 'unstake' | 'provide_liquidity' | 'remove_liquidity';
  timestamp: number;
  amount: string;
  token: string;
  status: 'success' | 'pending' | 'failed';
}

// Mock data for demo mode
const DEMO_DATA: {
  balances: DemoBalances;
  pools: DemoPools;
  exchangeRates: DemoExchangeRates;
} = {
  balances: {
    trn: '1000000000000000000000', // 1000 TRN
    root: '500000000000000000000', // 500 ROOT
    usdt: '10000000000' // 10000 USDT (6 decimals)
  },
  pools: {
    'trn-root': {
      totalLiquidity: '2000000000000000000000',
      tokenAReserve: '1000000000000000000000',
      tokenBReserve: '1000000000000000000000',
      apy: 15,
      unlockPeriod: 86400
    },
    'trn-usdt': {
      totalLiquidity: '1500000000000000000000',
      tokenAReserve: '1000000000000000000000',
      tokenBReserve: '500000000',
      apy: 12,
      unlockPeriod: 86400
    },
    'root-usdt': {
      totalLiquidity: '1800000000000000000000',
      tokenAReserve: '1000000000000000000000',
      tokenBReserve: '800000000',
      apy: 10,
      unlockPeriod: 86400
    }
  },
  exchangeRates: {
    'trn-usdt': { rate: 1.5, apy: 12, unlockTime: 0 },
    'root-usdt': { rate: 2.0, apy: 10, unlockTime: 0 },
    'trn-root': { rate: 0.75, apy: 15, unlockTime: 0 }
  }
};

export class TRNService {
  private static api: ApiPromise | null = null;
  private static provider: WsProvider | null = null;
  private static connectionAttempts = 0;
  private static maxAttempts = 3;
  private static reconnectTimeout = 5000; // 5 seconds
  private static isInitialized = false;

  static async connect(): Promise<ApiPromise> {
    if (!this.api) {
      const provider = new WsProvider(import.meta.env.VITE_TRN_RPC_URL);
      this.api = await ApiPromise.create({ provider });
    }
      return this.api;
  }

  private static async initializeAfterConnection(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      const isDemoMode = useDemoStore.getState().isDemoMode;
      if (!isDemoMode) {
        await SyloService.initialize();
      }
      
      this.connectionAttempts = 0;
      this.isInitialized = true;
      
      console.log('TRN service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }

  static async getBalance(address: string): Promise<{ free: string; reserved: string }> {
    const api = await this.connect();
    const { user } = useAuth.getState();
    
    try {
      if (user?.isDemo) {
        const balance = await DemoWalletService.getBalance();
        return {
          free: balance,
          reserved: '0'
        };
      }

      const accountInfo = await api.query.system.account(address) as unknown as AccountInfo;
      const { free, reserved } = accountInfo.data as AccountData;
      return {
        free: free.toString(),
        reserved: reserved.toString()
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      return { free: '0', reserved: '0' };
    }
  }

  static async getTokenBalance(address: string, tokenId: string): Promise<string> {
    const api = await this.connect();
    const { user } = useAuth.getState();
    
    try {
      if (user?.isDemo) {
        return await DemoWalletService.getTokenBalance(tokenId);
      }

      const balance = await api.query.tokens.accounts(address, tokenId);
      return balance.toString();
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0';
    }
  }

  static async getPoolInfo(poolId: string): Promise<PoolInfo> {
    const isDemoMode = useDemoStore.getState().isDemoMode;
    
    try {
      if (isDemoMode) {
        const pool = DEMO_DATA.pools[poolId.toLowerCase()];
        if (!pool) throw new Error(`Pool ${poolId} not found`);
        return pool;
      }

      const result = await SyloService.query<TRNPoolData>('pool.info', { poolId });
      return {
        totalLiquidity: result.totalLiquidity.toString(),
        tokenAReserve: result.tokenAReserve.toString(),
        tokenBReserve: result.tokenBReserve.toString(),
        apy: parseFloat(result.apy.toString()) / 100,
        unlockPeriod: parseInt(result.unlockPeriod.toString())
      };
    } catch (error) {
      console.error('Error fetching pool info:', error);
      return {
        totalLiquidity: '0',
        tokenAReserve: '0',
        tokenBReserve: '0',
        apy: 0,
        unlockPeriod: 0
      };
    }
  }

  static async getExchangeRate(fromToken: string, toToken: string): Promise<{
    rate: number;
    apy: number;
    unlockTime: number;
  }> {
    const isDemoMode = useDemoStore.getState().isDemoMode;
    
    try {
      if (isDemoMode) {
        const key = `${fromToken.toLowerCase()}-${toToken.toLowerCase()}`;
        const rate = DEMO_DATA.exchangeRates[key];
        if (!rate) throw new Error(`Exchange rate for ${key} not found`);
        return rate;
      }

      const result = await SyloService.query<{
        rate: string;
        apy: string;
        unlockTime: string;
      }>('exchange.rate', { fromToken, toToken });
      
      return {
        rate: parseFloat(result.rate),
        apy: parseFloat(result.apy),
        unlockTime: parseInt(result.unlockTime)
      };
    } catch (error) {
      console.error('Error calculating exchange rate:', error);
      return {
        rate: 0,
        apy: 0,
        unlockTime: 0
      };
    }
  }

  static async estimateSwapOutput(
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<string> {
    try {
      return await SyloService.query<string>('swap.estimate', {
        fromToken,
        toToken,
        amount
      });
    } catch (error) {
      console.error('Error estimating swap output:', error);
      throw error;
    }
  }

  static async swap(
    address: string,
    fromToken: string,
    toToken: string,
    amount: string,
    minReceived: string
  ): Promise<string> {
    const api = await this.connect();
    const { user } = useAuth.getState();

    try {
      const tx = api.tx.amm.swap(fromToken, toToken, amount, minReceived);

      if (user?.isDemo) {
        return await DemoWalletService.signTransaction(tx);
      }

      const injector = await web3FromAddress(address);
      const result = await tx.signAndSend(address, { signer: injector.signer });
      return result.toString();
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  }

  static async getTokenMetadata(tokenId: string): Promise<TokenMetadata> {
    const api = await this.connect();

    try {
      const metadata = await api.query.tokens.metadata(tokenId) as unknown as TRNTokenMetadata;
      return {
        name: metadata.name.toString(),
        symbol: metadata.symbol.toString(),
        decimals: parseInt(metadata.decimals.toString()),
        totalSupply: metadata.totalSupply.toString()
      };
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      throw error;
    }
  }

  static async disconnect() {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
    if (this.provider) {
      await this.provider.disconnect();
      this.provider = null;
    }
    this.connectionAttempts = 0;
  }

  static async addLiquidity(
    address: string,
    poolId: string,
    amounts: string[],
    minLPTokens: string
  ): Promise<string> {
    const api = await this.connect();
    const { user } = useAuth.getState();

    try {
      const tx = api.tx.amm.addLiquidity(poolId, amounts, minLPTokens);

      if (user?.isDemo) {
        return await DemoWalletService.signTransaction(tx);
      }

    const injector = await web3FromAddress(address);
      const result = await tx.signAndSend(address, { signer: injector.signer });
      return result.toString();
    } catch (error) {
      console.error('Error adding liquidity:', error);
      throw error;
    }
  }

  static async removeLiquidity(
    address: string,
    poolId: string,
    lpTokenAmount: string,
    minAmounts: string[]
  ): Promise<string> {
    const api = await this.connect();
    const { user } = useAuth.getState();

    try {
      const tx = api.tx.amm.removeLiquidity(poolId, lpTokenAmount, minAmounts);

      if (user?.isDemo) {
        return await DemoWalletService.signTransaction(tx);
      }

      const injector = await web3FromAddress(address);
      const result = await tx.signAndSend(address, { signer: injector.signer });
      return result.toString();
    } catch (error) {
      console.error('Error removing liquidity:', error);
      throw error;
    }
  }

  static async setGasToken(
    address: string,
    tokenId: string
  ): Promise<string> {
    const api = await this.connect();
    const injector = await web3FromAddress(address);

    try {
      const tx = api.tx.amm.setGasToken(tokenId);
      const result = await tx.signAndSend(address, { signer: injector.signer });
      return result.toString();
    } catch (error) {
      console.error('Error setting gas token:', error);
      throw error;
    }
  }

  static async bridgeToXRPL(
    address: string,
    tokenId: string,
    amount: string,
    xrplAddress: string
  ): Promise<string> {
    const api = await this.connect();
    const injector = await web3FromAddress(address);

    try {
      const tx = api.tx.bridge.initiateTransfer(
        tokenId,
        amount,
        'XRPL',
        new TextEncoder().encode(xrplAddress)
      );

      const result = await tx.signAndSend(address, { signer: injector.signer });
      return result.toString();
    } catch (error) {
      console.error('Error bridging to XRPL:', error);
      throw error;
    }
  }

  static async getPrices(): Promise<Record<string, string>> {
    const api = await this.connect();

    try {
      const [trnPrice, rootPrice, usdtPrice] = await Promise.all([
        api.query.oracle.price('TRN'),
        api.query.oracle.price('ROOT'),
        api.query.oracle.price('USDT')
      ]);

      return {
        TRN: trnPrice.toString(),
        ROOT: rootPrice.toString(),
        USDT: usdtPrice.toString()
      };
    } catch (error) {
      console.error('Error getting prices:', error);
      throw error;
    }
  }

  static async getVolumes(): Promise<Record<string, string>> {
    const api = await this.connect();

    try {
      const [trnVolume, rootVolume, usdtVolume] = await Promise.all([
        api.query.amm.volume24h('TRN'),
        api.query.amm.volume24h('ROOT'),
        api.query.amm.volume24h('USDT')
      ]);

      return {
        TRN: trnVolume.toString(),
        ROOT: rootVolume.toString(),
        USDT: usdtVolume.toString()
      };
    } catch (error) {
      console.error('Error getting volumes:', error);
      throw error;
    }
  }

  static async getPools(): Promise<Pool[]> {
    const api = await this.connect();

    try {
      const pools = await api.query.amm.pools.entries();
      return pools.map(([key, value]: any) => ({
        id: key.args[0].toString(),
        totalLiquidity: value.totalLiquidity.toString(),
        apy: parseFloat(value.apy.toString()) / 100
      }));
    } catch (error) {
      console.error('Error getting pools:', error);
      throw error;
    }
  }

  static async getLPTokenBalance(address: string, poolId: string): Promise<string> {
    const api = await this.connect();

    try {
      const balance = await api.query.tokens.accounts(address, poolId);
      return balance.toString();
    } catch (error) {
      console.error('Error getting LP token balance:', error);
      throw error;
    }
  }

  static async getTransactionHistory(address: string): Promise<Transaction[]> {
    const api = await this.connect();
    const isDemoMode = useDemoStore.getState().isDemoMode;

    try {
      if (isDemoMode) {
        return []; // Return empty array in demo mode
      }

      // Get all transactions for the address
      const rawEvents = await api.query.system.events();
      const eventsArray = [...(rawEvents as any)];
      const events = eventsArray.filter((event: any) => {
        const { section, method } = event.event;
        return (
          (section === 'amm' && ['Swap', 'LiquidityAdded', 'LiquidityRemoved'].includes(method)) ||
          (section === 'staking' && ['Bonded', 'Unbonded'].includes(method))
        );
      });

      // Map events to transactions
      const transactions: Transaction[] = events.map((event: any) => {
        const { section, method, data } = event.event;
        const timestamp = Math.floor(Date.now() / 1000); // Use current timestamp as fallback

        let type: Transaction['type'];
        let amount: string;
        let token: string;

        switch (method) {
          case 'Swap':
            type = 'swap';
            amount = data[2].toString();
            token = data[0].toString();
            break;
          case 'LiquidityAdded':
            type = 'provide_liquidity';
            amount = data[1].toString();
            token = 'LP';
            break;
          case 'LiquidityRemoved':
            type = 'remove_liquidity';
            amount = data[1].toString();
            token = 'LP';
            break;
          case 'Bonded':
            type = 'stake';
            amount = data[1].toString();
            token = 'ROOT';
            break;
          case 'Unbonded':
            type = 'unstake';
            amount = data[1].toString();
            token = 'ROOT';
            break;
          default:
            type = 'swap';
            amount = '0';
            token = '';
        }

        return {
          hash: event.hash.toHex(),
          type,
          timestamp,
          amount,
          token,
          status: 'success' as const
        };
      });

      return transactions;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }
} 