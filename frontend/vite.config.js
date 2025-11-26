import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 80,
    watch: {
      usePolling: true,
    },
  },
  define: {
    // クライアントサイドで環境変数を参照できるようにする
    'process.env': {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1'
    }
  }
});
