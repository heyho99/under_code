import { defineConfig } from 'vite';

// あくまでもコンテナ内部の設定（dockerがポートフォワーディングの設定を持っている）
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 80,
    watch: {
      usePolling: true,
    },
    // frontendからfetch('/api/v1/auth/login')を叩くと、http://localhost:8081/api/v1/auth/login に飛ぶ
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  define: {
    // クライアントサイドで環境変数を参照できるようにする
    'process.env': {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1'
    }
  }
});
