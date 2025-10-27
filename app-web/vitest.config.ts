import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	esbuild: {
		jsxInject: `import React from 'react'`,
	},
	test: {
		name: "app-web",
		globals: true,
		environment: "jsdom",
		setupFiles: ["./tests/helpers/setup.tsx"],
		include: [
			"tests/unit/**/*.test.{ts,tsx}",
			"tests/integration/**/*.test.{ts,tsx}",
		],
		exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**", "**/.next/**"],
		// Run API tests sequentially to avoid DB race conditions
		fileParallelism: false,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"src/**/*.d.ts",
				"src/**/*.test.{ts,tsx}",
				"src/**/*.spec.{ts,tsx}",
				"src/app/**", // Exclude Next.js app router files
				"src/env.js",
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
		},
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./src"),
		},
	},
});
