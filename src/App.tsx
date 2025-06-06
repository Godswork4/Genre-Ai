import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { wagmiAdapter, networks } from './config/web3.config';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import Swap from './pages/Swap';
import Portfolio from './pages/Portfolio';
import Staking from './pages/Staking';
import Trading from './pages/Trade';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import { useAuth } from './store/authStore';
import { useDemoStore } from './store/demoStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConfigProvider } from './providers/ConfigProvider';
import { initializeConfig } from './config/initConfig';
import { initializeCrypto } from './utils/crypto';
import './App.css';

// Initialize configuration
const { isValid, errors } = initializeConfig();
if (!isValid) {
  console.error('Configuration validation failed:', errors);
}

// Create QueryClient
const queryClient = new QueryClient();

// Set up metadata
const metadata = {
  name: 'Genre AI DeFi',
  description: 'Genre AI DeFi Copilot',
  url: window.location.origin,
  icons: ['https://genre.ai/logo.png']
};

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata,
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  features: {
    analytics: true
  }
});

// Protected route component that redirects to home if not authenticated
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  const { isDemoMode } = useDemoStore();

  if (!isAuthenticated && !isDemoMode) {
    return <Navigate to="/" replace />;
  }

  return element;
};

// Landing route component that redirects to app if authenticated
const LandingRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  const { isDemoMode } = useDemoStore();

  if (isAuthenticated || isDemoMode) {
    return <Navigate to="/app" replace />;
  }

  return element;
};

const App: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    const init = async () => {
      try {
        await initializeCrypto();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    init();
  }, []);

  return (
    <ErrorBoundary>
      <ConfigProvider>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingRoute element={<Home />} />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
                
                {/* Protected app routes */}
                <Route path="/app" element={user ? <ProtectedRoute element={<MainLayout />} /> : <Navigate to="/login" />}>
                  <Route index element={<Portfolio />} />
                <Route path="swap" element={<Swap />} />
                  <Route path="staking" element={<Staking />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="trading" element={<Trading />} />
                  <Route path="profile" element={<Profile />} />
              </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </QueryClientProvider>
      </WagmiProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
