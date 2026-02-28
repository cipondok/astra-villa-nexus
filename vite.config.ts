
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      // Exclude files that don't need to be watched to prevent "too many open files" errors.
      ignored: ["**/node_modules/**", "**/dist/**", "**/supabase/migrations/**"],
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
  },
  build: {
    // Use esbuild for minification - much lower memory than terser
    minify: 'esbuild',
    // Limit parallel file ops to reduce peak memory usage
    rollupOptions: {
      maxParallelFileOps: 1,
      output: {
        // More granular chunks reduce peak memory during bundling
        manualChunks(id) {
          // Core React
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor-react';
          }
          // Supabase
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }
          // Charts
          if (id.includes('node_modules/recharts/')) {
            return 'vendor-charts';
          }
          // 3D - split into sub-chunks
          if (id.includes('node_modules/three/')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/@react-three/')) {
            return 'vendor-r3f';
          }
          // Animation
          if (id.includes('node_modules/framer-motion/')) {
            return 'vendor-motion';
          }
          // State & query
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-query';
          }
          if (id.includes('node_modules/zustand/')) {
            return 'vendor-zustand';
          }
          // Web3 / blockchain - split into smaller chunks
          if (id.includes('node_modules/wagmi/') || id.includes('node_modules/@wagmi/')) {
            return 'vendor-wagmi';
          }
          if (id.includes('node_modules/viem/')) {
            return 'vendor-viem';
          }
          if (id.includes('node_modules/@reown/')) {
            return 'vendor-web3modal';
          }
          if (id.includes('node_modules/@coinbase/') || id.includes('node_modules/porto/') || id.includes('node_modules/@walletconnect/')) {
            return 'vendor-web3-utils';
          }
          if (id.includes('node_modules/@base-org/') || id.includes('node_modules/ox/')) {
            return 'vendor-web3-base';
          }
          // Radix UI
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-ui';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          // AI / ML
          if (id.includes('node_modules/@huggingface/') || id.includes('node_modules/tesseract')) {
            return 'vendor-ai';
          }
          // Mapbox
          if (id.includes('node_modules/mapbox-gl/') || id.includes('node_modules/@mapbox/')) {
            return 'vendor-maps';
          }
          // Date utilities
          if (id.includes('node_modules/date-fns/')) {
            return 'vendor-dates';
          }
          // PDF / export utilities
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2pdf') || id.includes('node_modules/jspdf-autotable')) {
            return 'vendor-pdf';
          }
          // Form libraries
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform/') || id.includes('node_modules/zod/')) {
            return 'vendor-forms';
          }
          // Markdown
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark') || id.includes('node_modules/rehype') || id.includes('node_modules/unified') || id.includes('node_modules/mdast') || id.includes('node_modules/hast') || id.includes('node_modules/micromark')) {
            return 'vendor-markdown';
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1500,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for smaller output
    target: 'es2020',
    // Reduce sourcemap generation to save memory
    sourcemap: false,
  },
}));
