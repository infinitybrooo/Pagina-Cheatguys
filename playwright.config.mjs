import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    timeout: 45000,
    expect: {
        timeout: 8000
    },
    use: {
        baseURL: "http://127.0.0.1:4173",
        trace: "on-first-retry"
    },
    webServer: {
        command: "npx http-server . -p 4173 -c-1",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: true,
        timeout: 120000
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] }
        }
    ]
});
