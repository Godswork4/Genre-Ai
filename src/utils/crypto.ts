import { cryptoWaitReady } from '@polkadot/util-crypto';
import { web3Enable } from '@polkadot/extension-dapp';

export const initializeCrypto = async () => {
  try {
    // Initialize Polkadot crypto
    await cryptoWaitReady();
    
    // Initialize web3 extensions
    await web3Enable('Genre AI DeFi Assistant');

    console.log('Crypto initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize crypto:', error);
    return false;
  }
}; 