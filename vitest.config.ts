import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@bagodi/design-system/css": path.resolve(__dirname, "packages/design-system/src/index.css"),
      "@bagodi/design-system": path.resolve(__dirname, "packages/design-system/src"),
      "@bagodi/shared-types": path.resolve(__dirname, "packages/shared-types/src"),
      "@bagodi/api-client": path.resolve(__dirname, "packages/api-client/src"),
      "@bagodi/validation": path.resolve(__dirname, "packages/validation/src"),
      "@bagodi/authentication": path.resolve(__dirname, "packages/authentication/src"),
      "@bagodi/utilities": path.resolve(__dirname, "packages/utilities/src"),
      "@bagodi/shared-components": path.resolve(__dirname, "packages/shared-components/src"),
      "react-hook-form": path.resolve(__dirname, "packages/form-hooks/index.ts"),
      "@hookform/resolvers/zod": path.resolve(__dirname, "packages/form-hooks/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
    include: [
      "packages/*/src/**/__tests__/**/*.test.{ts,tsx}",
      "apps/*/src/**/__tests__/**/*.test.{ts,tsx}",
    ],
  },
});

