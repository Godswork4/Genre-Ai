import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { useDemoStore } from '../store/demoStore';
import { FuturePassService } from '../services/futurePassService';
import LandingNavbar from '../components/Landing/LandingNavbar';
import {
  ArrowPathIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ArrowTopRightOnSquareIcon,
  BeakerIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  CheckIcon,
  LightBulbIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

// Define motion components with proper types
interface MotionDivProps extends MotionProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  key?: string | number;
}

const MotionDiv = motion.div as React.FC<MotionDivProps>;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDemoMode, setDemoMode } = useDemoStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const handleFuturePassLogin = async () => {
    try {
      setIsLoading(true);
      await FuturePassService.login();
      // The page will redirect to the auth callback URL
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  const handleDemoClick = () => {
    setDemoMode(true);
    navigate('/app/swap');
  };

  const openFaucet = () => {
    window.open('https://faucet.rootnet.live', '_blank');
  };

  const mainFeatures = [
    {
      title: "AI-Powered Trading",
      description: "Our advanced AI analyzes market trends, predicts price movements, and suggests optimal trading strategies in real-time",
      icon: CpuChipIcon,
      highlights: [
        "Real-time market analysis",
        "Price prediction models",
        "Smart trading suggestions"
      ]
    },
    {
      title: "Secure DeFi Platform",
      description: "Built on Root Network with institutional-grade security and seamless cross-chain integration",
      icon: ShieldCheckIcon,
      highlights: [
        "Multi-layer security",
        "Cross-chain compatibility",
        "Audited smart contracts"
      ]
    },
    {
      title: "Liquidity Optimization",
      description: "Maximize your returns with AI-optimized liquidity pools and automated yield strategies",
      icon: CurrencyDollarIcon,
      highlights: [
        "Optimal routing",
        "Dynamic fee adjustment",
        "Yield optimization"
      ]
    }
  ];

  const features = [
    {
      title: "Smart Token Swaps",
      description: "Experience efficient trading with AI-powered price predictions and optimal routing",
      icon: ArrowPathIcon,
      demo: (
        <div className="relative h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4">
          <MotionDiv
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 flex items-center justify-center opacity-10"
          >
            <div className="w-64 h-64 border-4 border-blue-500 rounded-full" />
          </MotionDiv>
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400">Best Route</div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-medium">TRN → ROOT → USDT</span>
                </div>
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div className="bg-blue-500/20 rounded-lg p-3 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Savings</span>
                <span className="text-green-400">+2.5%</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AI Market Analysis",
      description: "Get real-time insights and predictions powered by advanced machine learning",
      icon: SparklesIcon,
      demo: (
        <div className="relative h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4 overflow-hidden">
          <MotionDiv
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl" />
          </MotionDiv>
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-400">Market Sentiment</span>
              <span className="text-green-400">Bullish</span>
            </div>
            <div className="h-24 flex items-end space-x-1">
              {[40, 65, 55, 70, 85, 75, 90].map((height, i) => (
                <MotionDiv
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                />
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Portfolio Analytics",
      description: "Track and optimize your DeFi portfolio with comprehensive analytics",
      icon: ChartBarIcon,
      demo: (
        <div className="h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-400">Portfolio Performance</span>
              <MotionDiv
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
                className="text-green-400 font-medium"
              >
                +15.8%
              </MotionDiv>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">TRN</span>
                <MotionDiv
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  className="h-2 bg-blue-500 rounded-full"
                />
                <span className="text-sm text-gray-400">60%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">ROOT</span>
                <MotionDiv
                  initial={{ width: 0 }}
                  animate={{ width: "40%" }}
                  className="h-2 bg-purple-500 rounded-full"
                />
                <span className="text-sm text-gray-400">40%</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const stats = [
    { label: "Total Value Locked", value: "$10.5M+" },
    { label: "Active Users", value: "5,000+" },
    { label: "Trades Executed", value: "100K+" },
    { label: "AI Accuracy", value: "95%" }
  ];

  return (
    <div className="min-h-screen bg-[#0f1011] text-white">
      <LandingNavbar />
      
      {/* Overview Section */}
      <section id="overview" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                The Future of DeFi is Intelligent
              </h1>
              <p className="text-xl md:text-2xl text-gray-300">
                Genre AI combines artificial intelligence with decentralized finance to deliver smarter trading, optimized yields, and enhanced market insights
              </p>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 space-y-6 max-w-md mx-auto"
            >
            <button
              onClick={handleFuturePassLogin}
                disabled={isLoading}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-lg transition-all hover:opacity-90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                {isLoading ? (
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <BoltIcon className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                )}
                {isLoading ? 'Connecting...' : 'Start Trading Now'}
            </button>
              
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center">
                  <span className="px-4 text-sm text-gray-500 bg-[#0f1011]">or</span>
                </div>
              </div>

            <button
              onClick={handleDemoClick}
                className="w-full px-8 py-4 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 rounded-lg font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center"
            >
                <BeakerIcon className="w-5 h-5 mr-2" />
              Try Demo Mode
            </button>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Experience Genre AI with our testnet demo
                </p>
                <button
                  onClick={openFaucet}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1"
                >
                  Get testnet tokens
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <MotionDiv
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </MotionDiv>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 bg-[#0f1011]">
        <div className="container mx-auto px-4">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover how our AI-powered platform revolutionizes DeFi trading and investment
            </p>
          </MotionDiv>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {mainFeatures.map((feature, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
              >
                <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-300">
                      <CheckIcon className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Trading Section */}
      <section id="trading" className="container mx-auto px-4 py-20 bg-gray-900/30">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Smart Trading</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience next-generation trading with AI-powered insights and optimal execution
          </p>
        </MotionDiv>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <LightBulbIcon className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">AI Market Analysis</h3>
            </div>
            <p className="text-gray-400 mb-6">Real-time market insights and predictions powered by advanced machine learning</p>
            <div className="h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4">
              {/* ... existing AI analysis demo content ... */}
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <ScaleIcon className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Smart Order Routing</h3>
            </div>
            <p className="text-gray-400 mb-6">Optimal trade execution with minimal slippage and maximum returns</p>
            <div className="h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4">
              {/* ... existing trading demo content ... */}
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Staking Section */}
      <section id="staking" className="container mx-auto px-4 py-20">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Yield Optimization</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Maximize your returns with AI-powered staking strategies and yield farming opportunities
          </p>
        </MotionDiv>

        <div className="grid md:grid-cols-3 gap-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
          >
            <h3 className="text-xl font-semibold mb-3">Liquid Staking</h3>
            <p className="text-gray-400 mb-4">Stake your assets while maintaining liquidity for trading opportunities</p>
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">APY</span>
                  <span className="text-green-400 font-medium">12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Staked</span>
                  <span className="text-blue-400 font-medium">$5.2M</span>
                </div>
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
          >
            <h3 className="text-xl font-semibold mb-3">Yield Farming</h3>
            <p className="text-gray-400 mb-4">Automated yield farming strategies optimized by AI</p>
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Best Pool APY</span>
                  <span className="text-green-400 font-medium">28.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Risk Level</span>
                  <span className="text-blue-400 font-medium">Medium</span>
                </div>
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
          >
            <h3 className="text-xl font-semibold mb-3">Rewards</h3>
            <p className="text-gray-400 mb-4">Earn additional rewards through platform incentives</p>
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Platform Rewards</span>
                  <span className="text-green-400 font-medium">+5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Loyalty Bonus</span>
                  <span className="text-blue-400 font-medium">+2%</span>
                </div>
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 md:p-12 text-center">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <UserGroupIcon className="w-12 h-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-gray-300 mb-8">
              Be part of the future of DeFi. Join thousands of traders using Genre AI to optimize their trading strategies.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => navigate('/app')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <RocketLaunchIcon className="w-5 h-5" />
                Launch App
              </button>
              <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                Learn More
              </button>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Genre AI. All rights reserved.
          </p>
      </div>
      </footer>
    </div>
  );
};

export default Home; 