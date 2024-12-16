import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  base: "/MeiConstructor/",
  plugins: [vue()],
  resolve: {
    alias: [
      
    ]
  },
})
