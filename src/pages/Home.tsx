import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon, ChartBarIcon, ShieldCheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'AI-Powered Analysis',
    description: 'Get intelligent insights and recommendations for your DeFi investments.',
    icon: SparklesIcon,
  },
  {
    name: 'Portfolio Tracking',
    description: 'Monitor your investments and performance in real-time.',
    icon: ChartBarIcon,
  },
  {
    name: 'Secure Trading',
    description: 'Execute trades across multiple DeFi protocols seamlessly.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Yield Optimization',
    description: 'Find and automate the best yield farming opportunities.',
    icon: CurrencyDollarIcon,
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              AI-Powered DeFi Copilot
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Your intelligent companion for navigating the DeFi ecosystem.
              Maximize returns with AI-driven insights and automated strategies.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/portfolio"
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg transition-colors duration-300"
              >
                Launch App
              </Link>
              <Link
                to="/about"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Learn More →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">
              Everything you need for DeFi success
            </h2>
            <p className="text-gray-400">
              Our AI-powered platform provides you with all the tools and insights you need.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-surface p-6 rounded-lg"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 