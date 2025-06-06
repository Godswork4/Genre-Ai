import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  server: {
    port: 3000,
    open: true,
    cors: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization'
    },
    proxy: {
      '/api': {
        target: process.env.VITE_ROOT_NETWORK_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@futureverse/auth': path.resolve(__dirname, 'node_modules/@futureverse/auth'),
      'bn.js': path.resolve(__dirname, 'node_modules/bn.js/lib/bn.js')
    },
    dedupe: ['@futureverse/auth', 'bn.js']
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
    include: [
      '@polkadot/api',
      '@polkadot/util-crypto',
      '@polkadot/keyring',
      '@polkadot/extension-dapp',
      '@futureverse/auth',
      'bn.js',
      '@polkadot/wasm-crypto',
      '@polkadot/wasm-bridge'
    ]
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'polkadot': [
            '@polkadot/api',
            '@polkadot/util-crypto',
            '@polkadot/keyring',
            '@polkadot/extension-dapp',
            '@polkadot/wasm-crypto',
            '@polkadot/wasm-bridge'
          ],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
});
