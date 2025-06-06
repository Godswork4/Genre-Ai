import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authStore';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithDemo } = useAuth();

  const handleDemoClick = async () => {
    try {
      await loginWithDemo();
      navigate('/app');
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Genre AI DeFi Assistant
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Your intelligent companion for navigating the Root Network DeFi ecosystem.
            Swap tokens, manage liquidity, and explore opportunities with AI guidance.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              type="button"
            >
              Connect Wallet
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDemoClick}
              className="px-8 py-4 bg-transparent border-2 border-purple-500 rounded-lg font-semibold text-lg hover:bg-purple-500/20 transition-colors"
              type="button"
            >
              Try Demo
            </motion.button>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI-Powered Trading',
                description: 'Get intelligent insights and recommendations for your trading decisions'
              },
              {
                title: 'Portfolio Management',
                description: 'Track your assets and analyze your DeFi portfolio performance'
              },
              {
                title: 'Smart Suggestions',
                description: 'Receive personalized recommendations for yield opportunities'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.2 }}
                className="p-6 bg-gray-800 rounded-xl"
              >
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 