import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DemoStore {
  isDemoMode: boolean;
  demoWallet: {
    address: string;
    publicKey: string;
    type: 'testnet';
  } | null;
  setDemoMode: (isDemo: boolean) => void;
}

// Using a dedicated testnet wallet for demo purposes
const DEMO_TESTNET_WALLET = {
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Testnet wallet address
  publicKey: '0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48', // Testnet public key
  type: 'testnet' as const
};

export const useDemoStore = create<DemoStore>()(
  devtools(
    (set) => ({
  isDemoMode: false,
  demoWallet: null,
      setDemoMode: (isDemo) => set(
        { 
      isDemoMode: isDemo,
          demoWallet: isDemo ? DEMO_TESTNET_WALLET : null
        },
        false,
        'setDemoMode'
      )
    })
  )
); 