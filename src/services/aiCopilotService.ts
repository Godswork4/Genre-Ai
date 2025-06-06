import { TRNService } from './trnService';
import { LiquidStakingService } from './liquidStakingService';
import { parseUnits, formatUnits } from 'ethers';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const ASM_BRAIN_API_URL = import.meta.env.VITE_ASM_BRAIN_API_URL;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface Pool {
  id: string;
  totalLiquidity: string;
  apy: number;
}

interface AIResponse {
  text: string;
  action?: {
    type: 'swap' | 'stake' | 'unstake' | 'provide_liquidity';
    params: Record<string, string>;
  };
  suggestions?: string[];
}

interface MarketContext {
  prices: Record<string, string>;
  volumes: Record<string, string>;
  liquidityPools: Pool[];
  stakingStats: {
    totalStaked: string;
    apy: number;
  };
}

interface UserContext {
  balances: Record<string, string>;
  stakingPosition?: {
    amount: string;
    rewards: string;
  };
  liquidityPositions: Array<{
    poolId: string;
    amount: string;
  }>;
}

export class AICopilotService {
  private static readonly COMMON_SUGGESTIONS = [
    "Help me swap tokens",
    "What are the current staking rates?",
    "Show my portfolio",
    "How to provide liquidity?",
    "Explain DeFi concepts"
  ];

  private static chatHistory: ChatMessage[] = [];

  private static async getSystemMessage(userAddress: string): Promise<string> {
    const [marketContext, userContext] = await Promise.all([
      this.getMarketContext(),
      this.getUserContext(userAddress)
    ]);

    return [
      'You are Genre AI, a DeFi assistant for the TRN blockchain.',
      '',
      'Current market data:',
      JSON.stringify(marketContext, null, 2),
      '',
      'User\'s portfolio:',
      JSON.stringify(userContext, null, 2),
      '',
      'Instructions:',
      '1. You can suggest actions like swapping tokens, providing liquidity, or staking.',
      '2. For staking queries, always mention the current APY and minimum staking amount.',
      '3. For swaps, ask for the amount and token pair if not provided.',
      '4. Format action suggestions in JSON within $$$ delimiters.',
      '5. Keep responses concise and focused on DeFi operations.',
      '6. Always provide next steps or suggestions.',
      '7. Remember previous context when responding.',
      '',
      'Example stake response:',
      '"The current staking APY is 15.2%. Would you like to stake your ROOT tokens? Please specify the amount you\'d like to stake.',
      '$$${"type": "stake", "params": {"amount": "PENDING_USER_INPUT"}}$$$"',
      '',
      'Example swap response:',
      '"I can help you swap tokens. Please specify:',
      '1. Amount to swap',
      '2. Token you want to receive',
      'Current rates: 1 ROOT = 2.5 TRN"'
    ].join('\n');
  }

  static async getMarketContext(): Promise<MarketContext> {
    try {
      const [prices, volumes] = await Promise.all([
        TRNService.getPrices(),
        TRNService.getVolumes()
      ]);

      const pools: Pool[] = await TRNService.getPools();
      const liquidityPools = pools.map((pool: Pool) => ({
        id: pool.id,
        totalLiquidity: pool.totalLiquidity,
        apy: pool.apy
      }));

      const stakingStats = await LiquidStakingService.getPoolStats();

      return {
        prices,
        volumes,
        liquidityPools,
        stakingStats: {
          totalStaked: stakingStats.totalStaked,
          apy: stakingStats.apy
        }
      };
    } catch (error) {
      console.error('Error getting market context:', error);
      throw error;
    }
  }

  static async getUserContext(userAddress: string): Promise<UserContext> {
    try {
      // Get token balances
      const balances = {
        ROOT: await TRNService.getTokenBalance(userAddress, 'root'),
        TRN: await TRNService.getTokenBalance(userAddress, 'trn'),
        USDT: await TRNService.getTokenBalance(userAddress, 'usdt')
      };

      // Get staking position
      const stakingPosition = await LiquidStakingService.getStakingPosition(userAddress);

      // Get liquidity positions
      const pools: Pool[] = await TRNService.getPools();
      const liquidityPositions = await Promise.all(
        pools.map(async (pool: Pool) => ({
          poolId: pool.id,
          amount: await TRNService.getLPTokenBalance(userAddress, pool.id)
        }))
      );

      return {
        balances,
        stakingPosition: stakingPosition.amount !== '0' ? {
          amount: stakingPosition.amount,
          rewards: stakingPosition.rewards
        } : undefined,
        liquidityPositions: liquidityPositions.filter((pos) => pos.amount !== '0')
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      throw error;
    }
  }

  static async getAIResponse(
    userMessage: string,
    userAddress: string
  ): Promise<AIResponse> {
    try {
      const systemMessage = await this.getSystemMessage(userAddress);

      // Add user message to chat history
      this.chatHistory.push({ role: 'user', content: userMessage });

      // Prepare messages for API call
      const messages: ChatMessage[] = [
        { role: 'system', content: systemMessage },
        ...this.chatHistory.slice(-10) // Keep last 10 messages for context
      ];

      // Call OpenAI API
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;
      
      // Add AI response to chat history
      this.chatHistory.push({ role: 'assistant', content: aiMessage });
      
      // Extract action from message if present
      let action = undefined;
      const actionMatch = aiMessage.match(/\$\$\$(.*?)\$\$\$/s);
      if (actionMatch) {
        try {
          action = JSON.parse(actionMatch[1]);
        } catch (e) {
          console.error('Failed to parse action JSON:', e);
        }
      }

      // Generate contextual suggestions
      const suggestions = this.generateSuggestions(userMessage, await this.getMarketContext());
      
      return {
        text: aiMessage.replace(/\$\$\$(.*?)\$\$\$/gs, '').trim(),
        action,
        suggestions
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  }

  private static generateSuggestions(
    userMessage: string,
    marketContext: MarketContext
  ): string[] {
    const suggestions: string[] = [...this.COMMON_SUGGESTIONS];
    
    // Add contextual suggestions based on market data
    if (marketContext.stakingStats.apy > 10) {
      suggestions.push(`Stake ROOT at ${marketContext.stakingStats.apy}% APY`);
    }

    const highVolumeTokens = Object.entries(marketContext.volumes)
      .filter(([_, volume]) => parseFloat(volume) > 100000)
      .map(([token]) => token);

    if (highVolumeTokens.length > 0) {
      suggestions.push(`Trade high-volume ${highVolumeTokens.join('/')} pair`);
    }

    // Add suggestions based on user's message context
    if (userMessage.toLowerCase().includes('stake')) {
      suggestions.push(
        'View staking rewards',
        'Calculate staking returns',
        'Unstake tokens'
      );
    } else if (userMessage.toLowerCase().includes('swap')) {
      suggestions.push(
        'Check token prices',
        'View trading pairs',
        'Calculate swap fees'
      );
    }

    // Return unique suggestions, limited to 5
    return Array.from(new Set(suggestions)).slice(0, 5);
  }

  static async executeAIAction(
    action: AIResponse['action'],
    userAddress: string
  ): Promise<string> {
    if (!action) return '';

    try {
      switch (action.type) {
        case 'swap':
          const estimatedOutput = await TRNService.estimateSwapOutput(
            action.params.fromToken,
            action.params.toToken,
            action.params.amount
          );
          
          // Calculate minimum received with 1% slippage
          const minReceived = (parseFloat(estimatedOutput) * 0.99).toString();
          
          return await TRNService.swap(
            userAddress,
            action.params.fromToken,
            action.params.toToken,
            action.params.amount,
            minReceived
          );

        case 'stake':
          return await LiquidStakingService.stake(
            userAddress,
            action.params.amount
          );

        case 'unstake':
          return await LiquidStakingService.unstake(
            userAddress,
            action.params.amount
          );

        case 'provide_liquidity':
          const [token0Amount, token1Amount] = action.params.amounts.split(',');
          const minLPTokens = parseUnits('0', 18).toString(); // Minimum LP tokens to accept
          
          return await TRNService.addLiquidity(
            userAddress,
            action.params.poolId,
            [token0Amount, token1Amount],
            minLPTokens
          );

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error('Error executing AI action:', error);
      throw error;
    }
  }

  static clearChatHistory(): void {
    this.chatHistory = [];
  }
} 