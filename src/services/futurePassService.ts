import { FutureverseAuthClient } from '@futureverse/auth';
import type { Environment } from '@futureverse/auth';
import { FUTUREPASS_CONFIG } from '../config/futurepass.config';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';

// Create auth client instance
const authClient = new FutureverseAuthClient({
  clientId: FUTUREPASS_CONFIG.CLIENT_ID,
  environment: 'development' as Environment,
  redirectUri: FUTUREPASS_CONFIG.REDIRECT_URLS[0],
  signInFlow: 'redirect',
  postLogoutRedirectUri: FUTUREPASS_CONFIG.POST_LOGOUT_URLS[0]
});

class FuturePassService {
  private static codeVerifier: string;
  private static nonce: string;

  static async login() {
    try {
      // Generate PKCE code verifier and challenge
      this.codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(this.codeVerifier);
      
      // Generate state for CSRF protection
      const state = this.generateState();
      
      // Generate nonce
      this.nonce = this.generateNonce();
      
      // Store state and code verifier for validation
      sessionStorage.setItem('auth_state', state);
      sessionStorage.setItem('code_verifier', this.codeVerifier);
      sessionStorage.setItem('nonce', this.nonce);
      
      // Sign in with email type
      await authClient.signInPass({
        type: 'email',
        state,
        authFlow: 'redirect',
        responseMode: 'query'
      });
    } catch (error) {
      console.error('FuturePass login error:', error);
      throw error;
    }
  }

  static async handleCallback(code: string, state: string) {
    try {
      // Validate state
      const storedState = sessionStorage.getItem('auth_state');
      const storedCodeVerifier = sessionStorage.getItem('code_verifier');
      const storedNonce = sessionStorage.getItem('nonce');
      
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      if (!storedCodeVerifier || !storedNonce) {
        throw new Error('Missing PKCE parameters');
      }

      // Verify and load user
      await authClient.verifyAndLoadUser();
      const user = await authClient.getUser();

      // Clear session storage
      sessionStorage.removeItem('auth_state');
      sessionStorage.removeItem('code_verifier');
      sessionStorage.removeItem('nonce');

      return user;
    } catch (error) {
      console.error('FuturePass callback error:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      await authClient.signOutPass({ 
        flow: 'redirect',
        disableConsent: true
      });
    } catch (error) {
      console.error('FuturePass logout error:', error);
      throw error;
    }
  }

  static async getWalletAddress(): Promise<string | null> {
    try {
      const session = authClient.userSession;
      if (!session) return null;
      return session.futurepass || null;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  }

  static async isConnected(): Promise<boolean> {
    try {
      const user = await authClient.getUser();
      return !!user;
    } catch {
      return false;
    }
  }

  private static generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private static handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 401) {
        return new Error('Authentication failed: Invalid or expired credentials');
      } else if (status === 404) {
        return new Error('FuturePass service endpoint not found');
      } else if (data?.message) {
        return new Error(`FuturePass error: ${data.message}`);
      }
    }
    return error instanceof Error ? error : new Error('An unknown error occurred');
  }
}

// Add environment variable types
interface ImportMetaEnv {
  readonly VITE_FUTUREPASS_API_URL?: string;
  readonly VITE_FUTURE_PASS_CLIENT_ID: string;
  readonly VITE_FUTUREPASS_ACCESS_TOKEN: string;
  readonly VITE_AUTH_CALLBACK_PATH?: string;
  readonly VITE_FUTUREPASS_REDIRECT_URI?: string;
  }

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export { FuturePassService }; 