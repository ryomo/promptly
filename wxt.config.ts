import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  extensionApi: 'chrome',
  modules: ['@wxt-dev/auto-icons'],
  manifest: {
    name: 'Promptly',
    permissions: ['storage', 'tabs', 'scripting'],
    host_permissions: ["*://*/*"],
  },
  vite: () => ({
    esbuild: {
      supported: {
        'top-level-await': true,
      },
    },
  }),
});
