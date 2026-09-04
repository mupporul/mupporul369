import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const basePath = env.VITE_BASE_PATH || "/mupporul369/";
  const devApiProxyTarget =
    env.VITE_DEV_API_PROXY_TARGET || "http://localhost:3001";

  return {
    plugins: [react()],
    base: basePath,
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: devApiProxyTarget,
          changeOrigin: true
        }
      }
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/setupTests.js"]
    }
  };
});