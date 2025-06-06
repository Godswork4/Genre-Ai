import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { FuturePassService } from '../services/futurePassService';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        
        if (error) {
          throw new Error(errorDescription || error);
      }

        if (!code) {
          throw new Error('No authorization code found');
        }

        const authResponse = await FuturePassService.handleCallback(code, state);
        
        // Store the auth token
        localStorage.setItem('auth_token', authResponse.token);
        
        // Update auth store with proper type handling
        setUser({
          email: authResponse.user.email ?? '',
          futurePassAddress: authResponse.user.address
        });

        // Redirect to app
        navigate('/app');
      } catch (error) {
        console.error('Auth callback failed:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        // Don't redirect immediately on error to show the error message
      }
    };

    handleCallback();
  }, [location, setUser, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1011] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl text-white font-semibold mb-2">Authentication Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-white"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1011] flex items-center justify-center">
      <div className="text-center">
        <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
        <h2 className="text-xl text-white font-semibold">Connecting to FuturePass...</h2>
        <p className="text-gray-400 mt-2">Please wait while we complete your authentication</p>
      </div>
    </div>
  );
};

export default AuthCallback; 