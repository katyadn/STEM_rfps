// Налаштування тестів. Окремий файл, щоб не чіпати vite.config.js
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.js"],
      css: false,
      coverage: {
        provider: "v8",
        include: ["src/**/*.{js,jsx}"],
        exclude: ["src/**/*.test.*", "src/test/**", "src/main.jsx"],
      },
    },
  })
);
