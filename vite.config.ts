
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
  },
  optimizeDeps: {
    include: ['@vladmandic/face-api'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI library chunk
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-select', '@radix-ui/react-tooltip', 'lucide-react'],
          // Data & state chunk
          'vendor-query': ['@tanstack/react-query', 'zustand'],
          // Charts chunk (heavy)
          'vendor-charts': ['recharts'],
          // Animation chunk
          'vendor-motion': ['framer-motion'],
          // Supabase chunk
          'vendor-supabase': ['@supabase/supabase-js'],
          // 3D/Heavy libs - separate to avoid blocking main bundle
          'vendor-3d': ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
    // Increase chunk size warning limit - admin has many large components
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for smaller output
    target: 'es2020',
  },
}));

