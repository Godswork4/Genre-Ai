import { ApiPromise } from '@polkadot/api';
import { TRNService } from './trnService';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { parseUnits, formatUnits } from 'ethers';

export interface StakingPosition {
  amount: string;
  unlockTime: number;
  rewards: string;
}

interface ValidatorInfo {
  address: string;
  commission: number;
  totalStake: string;
  apy: number;
}

export class LiquidStakingService {
  /**
   * Initialize staking pool for ROOT tokens
   */
  static async initializeStakingPool(
    adminAddress: string,
    initialExchangeRate: string,
    minStakeAmount: string
  ): Promise<string> {
    const api = await TRNService.connect();

    try {
      // Create staking pool using the native staking pallet
      const tx = api.tx.staking.createPool(
        initialExchangeRate,
        minStakeAmount,
        {
          rewardRate: '1000', // 10% annual reward rate
          lockPeriod: 7 * 24 * 60 * 60, // 7 days in seconds
          cooldownPeriod: 24 * 60 * 60, // 1 day in seconds
        }
      );

      const result = await tx.signAndSend(adminAddress);
      return result.toString();
    } catch (error) {
      console.error('Error initializing staking pool:', error);
      throw error;
    }
  }

  /**
   * Stake ROOT tokens and receive liquid staking tokens
   */
  static async stake(address: string, amount: string): Promise<string> {
    const api = await TRNService.connect();
    const injector = await web3FromAddress(address);

    try {
      // Create staking transaction
      const tx = api.tx.staking.bond(
        amount,
        'Staked' // Reward destination - compound rewards
      );

      // Sign and send the transaction
      const result = await tx.signAndSend(address, { signer: injector.signer });
      return result.toString();
    } catch (error) {
      console.error('Error staking tokens:', error);
      throw error;
    }
  }

  /**
   * Unstake liquid staking tokens and receive ROOT tokens
   */
  static async unstake(address: string, amount: string): Promise<string> {
    const api = await TRNService.connect();
    const injector = await web3FromAddress(address);

    try {
      // Create unbonding transaction
      const tx = api.tx.staking.unbond(amount);

      // Sign and send the transaction
      const result = await tx.signAndSend(address, { signer: injector.signer });
      return result.toString();
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      throw error;
    }
  }

  /**
   * Claim staking rewards
   */
  static async claimRewards(address: string): Promise<string> {
    const api = await TRNService.connect();
    const injector = await web3FromAddress(address);

    try {
      // Create reward withdrawal transaction
      const tx = api.tx.staking.payoutStakers(address);

      // Sign and send the transaction
      const result = await tx.signAndSend(address, { signer: injector.signer });
      return result.toString();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }

  /**
   * Get user's staking position
   */
  static async getStakingPosition(address: string): Promise<StakingPosition> {
    const api = await TRNService.connect();

    try {
      // Get staking ledger
      const ledger = await api.query.staking.ledger(address);
      const rewards = await api.query.staking.payee(address);

      if (!ledger.isSome) {
        return {
          amount: '0',
          unlockTime: 0,
          rewards: '0'
        };
      }

      const { active, unlocking } = ledger.unwrap();
      const now = Math.floor(Date.now() / 1000);
      const unlockTime = unlocking.length > 0 
        ? parseInt(unlocking[0].era.toString()) * 6 * 60 * 60 // 6 hours per era
        : now;

      return {
        amount: active.toString(),
        unlockTime,
        rewards: rewards.toString()
      };
    } catch (error) {
      console.error('Error getting staking position:', error);
      throw error;
    }
  }

  /**
   * Get pool statistics
   */
  static async getPoolStats(): Promise<{
    totalStaked: string;
    exchangeRate: string;
    apy: number;
  }> {
    const api = await TRNService.connect();

    try {
      const [totalStake, erasStakers] = await Promise.all([
        api.query.staking.totalStake(),
        api.query.staking.erasStakers.entries()
      ]);

      // Calculate APY based on staking rewards
      const totalRewards = erasStakers.reduce((acc, [_, stake]) => {
        return acc + parseFloat(stake.toString());
      }, 0);

      const apy = (totalRewards / parseFloat(totalStake.toString())) * 365 * 100;

      return {
        totalStaked: totalStake.toString(),
        exchangeRate: '1000000000000000000', // 1:1 for liquid staking tokens
        apy
      };
    } catch (error) {
      console.error('Error getting pool stats:', error);
      throw error;
    }
  }

  /**
   * Get list of active validators
   */
  static async getValidators(): Promise<ValidatorInfo[]> {
    const api = await TRNService.connect();

    try {
      const validators = await api.query.staking.validators.entries();
      return validators.map(([key, value]: any) => ({
        address: key.args[0].toString(),
        commission: parseFloat(value.commission.toString()) / 100,
        totalStake: value.totalStake.toString(),
        apy: parseFloat(value.apy.toString()) / 100
      }));
    } catch (error) {
      console.error('Error getting validators:', error);
      throw error;
    }
  }
} 