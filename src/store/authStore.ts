import create from 'zustand';
import { FuturePassService } from '../services/futurePassService';
import { DemoWalletService } from '../services/demoWalletService';

interface User {
  futurePassAddress?: string;
  demoWalletAddress?: string;
  isDemo: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  loginWithDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
      user: null,
      isLoading: false,
      error: null,

  login: async () => {
    set({ isLoading: true, error: null });
    try {
      await FuturePassService.login();
      const address = await FuturePassService.getWalletAddress();
      if (!address) {
        throw new Error('Failed to get wallet address');
      }
      set({ 
        user: { 
          futurePassAddress: address,
          isDemo: false
        },
        isLoading: false 
      });
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to login',
        isLoading: false 
      });
    }
  },

  loginWithDemo: async () => {
    set({ isLoading: true, error: null });
    try {
      await DemoWalletService.initialize();
      const wallet = await DemoWalletService.getWallet();
      
      // Request testnet tokens for the demo wallet
      await DemoWalletService.requestTestnetTokens();
      
      set({ 
        user: { 
          demoWalletAddress: wallet.address,
          isDemo: true
        },
        isLoading: false 
      });
    } catch (error) {
      console.error('Demo login error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create demo wallet',
        isLoading: false 
      });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuth.getState();
      if (user?.isDemo) {
        // No need to do anything special for demo logout
      } else {
        await FuturePassService.logout();
      }
      set({ user: null, isLoading: false });
    } catch (error) {
      console.error('Logout error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to logout',
        isLoading: false 
      });
    }
  }
})); 