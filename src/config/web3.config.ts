import { createConfig } from '@wagmi/core'
import { http } from 'viem'
import { mainnet } from '@wagmi/core/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// Root Network Configuration
export const rootNetwork = {
  id: 7672,
  name: 'Root Network Porcini Testnet',
  network: 'root-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'XRP',
    symbol: 'XRP',
  },
  rpcUrls: {
    default: {
      http: ['https://porcini.rootnet.app/archive'],
      webSocket: ['wss://porcini.rootnet.app/archive']
    },
    public: {
      http: ['https://porcini.rootnet.app/archive'],
      webSocket: ['wss://porcini.rootnet.app/archive']
    },
  },
  blockExplorers: {
    default: {
      name: 'Root Network Explorer',
      url: 'https://explorer.rootnet.live',
    },
  },
  testnet: true,
  type: 'evm'
} as const;

// Export networks array
export const networks = [rootNetwork] as [typeof rootNetwork, ...typeof rootNetwork[]];

// Create Wagmi Config
export const config = createConfig({
  chains: [rootNetwork],
  transports: {
    [rootNetwork.id]: http()
  }
})

// Create and export WagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [rootNetwork],
  projectId: 'a580039f30651b97740e81c625fc4e22'
}) 