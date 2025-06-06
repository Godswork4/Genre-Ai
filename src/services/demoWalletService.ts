import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, randomAsU8a } from '@polkadot/util-crypto';
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountInfo } from '@polkadot/types/interfaces';

interface DemoWallet {
  address: string;
  privateKey: string;
}

export class DemoWalletService {
  private static wallet: DemoWallet | null = null;
  private static api: ApiPromise | null = null;
  private static keyring: Keyring | null = null;
  private static isInitializing = false;

  static async initialize(): Promise<void> {
    if (this.wallet || this.isInitializing) return;

    try {
      this.isInitializing = true;

      // Wait for crypto to be ready
      await cryptoWaitReady();
      
      // Create keyring instance
      this.keyring = new Keyring({ 
        type: 'sr25519',
        ss58Format: 42 // Root Network format
      });
      
      // Generate secure random seed
      const seed = randomAsU8a(32);
      
      // Generate new keypair for demo wallet
      const keypair = this.keyring.addFromSeed(
        seed,
        { name: 'demo' },
        'sr25519'
      );
      
      this.wallet = {
        address: keypair.address,
        privateKey: Buffer.from(seed).toString('hex')
      };

      // Initialize API connection
      const wsProvider = new WsProvider(import.meta.env.VITE_TRN_RPC_URL);
      this.api = await ApiPromise.create({ 
        provider: wsProvider,
        types: {
          // Add any custom types here if needed
        }
      });

      // Request initial tokens
      await this.requestTestnetTokens();

      console.log('Demo wallet initialized:', this.wallet.address);
    } catch (error) {
      console.error('Failed to initialize demo wallet:', error);
      this.disconnect();
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  static async getWallet(): Promise<DemoWallet> {
    if (!this.wallet) {
      await this.initialize();
    }
    return this.wallet!;
  }

  static async getBalance(): Promise<string> {
    if (!this.api || !this.wallet) {
      throw new Error('Demo wallet not initialized');
    }

    try {
      const accountInfo = await this.api.query.system.account(this.wallet.address) as unknown as AccountInfo;
      return accountInfo.data.free.toString();
    } catch (error) {
      console.error('Error getting demo wallet balance:', error);
      return '0';
    }
  }

  static async getTokenBalance(tokenId: string): Promise<string> {
    if (!this.api || !this.wallet) {
      throw new Error('Demo wallet not initialized');
    }

    try {
      const balance = await this.api.query.tokens.accounts(this.wallet.address, tokenId);
      return balance.toString();
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  static async signTransaction(tx: SubmittableExtrinsic<'promise'>): Promise<string> {
    if (!this.api || !this.wallet || !this.keyring) {
      throw new Error('Demo wallet not initialized');
    }

    try {
      const keypair = this.keyring.addFromSeed(
        Buffer.from(this.wallet.privateKey, 'hex'),
        { name: 'demo' },
        'sr25519'
      );
      const result = await tx.signAndSend(keypair);
      return result.toString();
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  static async requestTestnetTokens(): Promise<void> {
    if (!this.api || !this.wallet) {
      throw new Error('Demo wallet not initialized');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_ROOT_NETWORK_API_URL}/faucet/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: this.wallet.address,
          tokens: ['TRN', 'ROOT', 'USDT']
        })
      });

      if (!response.ok) {
        throw new Error('Failed to request testnet tokens');
      }

      // Wait for tokens to be received
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
      console.error('Error requesting testnet tokens:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
    this.wallet = null;
    this.keyring = null;
    this.isInitializing = false;
  }
} 