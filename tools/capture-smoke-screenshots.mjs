import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, ".codex-analysis", "screenshots");
const baseURL = "http://127.0.0.1:4173";
mkdirSync(outputDir, { recursive: true });

async function prepare(page) {
    await page.addInitScript(() => {
        window.localStorage.setItem("cheatguys.startIntroSeen.v2", String(Date.now()));
    });
}

async function enterLobby(page) {
    await page.locator("#pressStartBtn").click();
    await page.locator("body.page-loaded").waitFor({ state: "attached", timeout: 10000 });
    await page.locator("#startWindow").waitFor({ state: "detached", timeout: 10000 });
    await page.locator("#globalLoader").waitFor({ state: "hidden", timeout: 10000 });
    await page.locator(".profile-container").waitFor({ state: "visible" });
    await page.waitForTimeout(1600);
}

async function capture(page, name) {
    const path = join(outputDir, name);
    await page.screenshot({ path, fullPage: false });
    console.log(path);
}

const browser = await chromium.launch();

try {
    const desktop = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await prepare(desktop);
    await desktop.goto(`${baseURL}/index.html`);
    await desktop.locator("#pressStartBtn").waitFor({ state: "visible" });
    await capture(desktop, "start-desktop.png");
    await enterLobby(desktop);
    await capture(desktop, "lobby-desktop.png");
    await desktop.close();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await prepare(mobile);
    await mobile.goto(`${baseURL}/index.html`);
    await mobile.locator("#pressStartBtn").waitFor({ state: "visible" });
    await capture(mobile, "start-mobile.png");
    await enterLobby(mobile);
    await capture(mobile, "lobby-mobile.png");
    await mobile.close();

    const gallery = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await prepare(gallery);
    await gallery.goto(`${baseURL}/galeria.html`);
    await gallery.locator('[data-character="rika"]').click();
    await gallery.locator("#track-clothes .gallery-file-card.is-active").click();
    await gallery.locator("#galleryModal").waitFor({ state: "visible" });
    await gallery.locator("#galleryModalImg").evaluate((image) => {
        if (image.complete && image.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve, reject) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", reject, { once: true });
        });
    });
    await capture(gallery, "gallery-modal.png");
    await gallery.close();

    const arcade = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await prepare(arcade);
    await arcade.goto(`${baseURL}/minijuego.html?game=maze`);
    await arcade.locator("#arcadeSelectedGame").waitFor({ state: "visible" });
    await capture(arcade, "arcade-mobile.png");
    await arcade.close();
} finally {
    await browser.close();
}
