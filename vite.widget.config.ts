import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {},
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/widget-entry.tsx'),
      name: 'FarmVaidyaChatWidget',
      fileName: () => 'fv-chat-widget.js',
      formats: ['umd'],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        format: 'umd',
        name: 'FarmVaidyaChatWidget',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    target: 'esnext',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
});
