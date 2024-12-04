import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  extensionApi: 'chrome',
  manifest: {
    name: 'Promptly',
    permissions: ['storage', 'tabs', 'scripting', 'debugger'],
    host_permissions: ["*://*/*"],
  }
});
