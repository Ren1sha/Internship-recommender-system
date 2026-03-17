import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        profile: resolve(__dirname, 'profile.html'),
        user: resolve(__dirname, 'user.html'),
        internshipDetail: resolve(__dirname, 'internship-detail.html')
      }
    }
  }
});
