import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * Configuração do Playwright para testes E2E
 *
 * @see https://playwright.dev/docs/test-configuration
 */

// URL base da aplicação para testes
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
	testDir: "./tests/e2e",

	// Timeout para cada teste
	timeout: 30 * 1000,

	// Expect timeout
	expect: {
		timeout: 5000,
	},

	// Testes em paralelo
	fullyParallel: true,

	// Falha no CI se deixar test.only
	forbidOnly: !!process.env.CI,

	// Retry nos testes que falharem (apenas no CI)
	retries: process.env.CI ? 2 : 0,

	// Workers em paralelo
	workers: process.env.CI ? 1 : undefined,

	// Reporter
	reporter: [
		["html", { outputFolder: "playwright-report" }],
		["list"],
		...(process.env.CI ? [["github" as const]] : []),
	],

	// Configurações compartilhadas
	use: {
		baseURL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},

	// Configurar projetos para diferentes browsers
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
		// Mobile viewports
		{
			name: "Mobile Chrome",
			use: { ...devices["Pixel 5"] },
		},
		{
			name: "Mobile Safari",
			use: { ...devices["iPhone 12"] },
		},
	],

	// Web server local para testes
	webServer: {
		command: "npm run dev",
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		stdout: "ignore",
		stderr: "pipe",
	},
});
