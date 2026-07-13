import { expect, test } from "@playwright/test";

const allowedConsolePatterns = [
    /Failed to load resource.*catbox/i,
    /favicon/i
];

async function preparePage(page, options = {}) {
    const consoleErrors = [];
    const failedResources = [];

    page.on("console", (message) => {
        if (message.type() !== "error") return;
        const text = message.text();
        if (!allowedConsolePatterns.some((pattern) => pattern.test(text))) {
            consoleErrors.push(text);
        }
    });

    page.on("response", (response) => {
        const url = response.url();
        if (!url.startsWith("http://127.0.0.1:4173")) return;
        if (response.status() === 404) failedResources.push(url);
    });

    if (options.skipIntro !== false) {
        await page.addInitScript(() => {
            window.sessionStorage.setItem("cheatguys.startIntroSeen.v1", "1");
        });
    }

    return { consoleErrors, failedResources };
}

test("index carga, PRESS START existe y el menu lateral funciona", async ({ page }) => {
    const audit = await preparePage(page, { skipIntro: false });
    await page.goto("/index.html");
    await expect(page.locator("#pressStartBtn")).toHaveText("PRESS START");
    await page.locator("#pressStartBtn").click();
    await expect(page.locator(".profile-container")).toBeVisible();

    await page.locator("#sidebarToggle").click();
    await expect(page.locator("#sidebarNav")).toHaveClass(/is-open/);
    await page.locator("#sidebarToggle").click();
    await expect(page.locator("#sidebarNav")).not.toHaveClass(/is-open/);

    expect(audit.consoleErrors).toEqual([]);
    expect(audit.failedResources).toEqual([]);
});

test("enlaces internos principales responden sin interceptar controles especiales", async ({ page }) => {
    await preparePage(page);
    await page.goto("/index.html");

    const internalLinks = [
        "quienes-somos.html",
        "que-es-cheatguys.html",
        "minijuego.html",
        "galeria.html",
        "biblia-produccion.html"
    ];

    for (const href of internalLinks) {
        await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }

    await page.locator('a[href="#system-files"]').click();
    await expect(page.locator("#system-files")).toBeInViewport();

    await page.locator(".btn-patreon").click();
    await expect(page.locator("#systemToast")).toHaveClass(/show/);
});

test("fichas de personajes y archivos secretos abren y cierran con Escape", async ({ page }) => {
    const audit = await preparePage(page);
    await page.goto("/index.html");

    await page.locator(".char-btn.akane").click();
    await expect(page.locator("#charModal")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#modalTitle")).toContainText("AKANE HOSHIZORA");
    await page.keyboard.press("Escape");
    await expect(page.locator("#charModal")).toHaveAttribute("aria-hidden", "true");

    const secretTrigger = page.locator(".bottom-art-container");
    for (let index = 0; index < 4; index += 1) {
        await secretTrigger.click();
    }
    await expect(page.locator("#secretModal")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#secretFileList .file-item").first()).toBeVisible();
    await page.locator("#secretFileList .file-item").first().click();
    await expect(page.locator("#secretViewer")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#secretModal")).toHaveAttribute("aria-hidden", "true");

    expect(audit.consoleErrors).toEqual([]);
    expect(audit.failedResources).toEqual([]);
});

test("galeria, carruseles y modal de imagen funcionan", async ({ page }) => {
    const audit = await preparePage(page);
    await page.goto("/galeria.html");

    await expect(page.locator(".gallery-main")).toBeVisible();
    await page.locator('[data-character="rika"]').click();
    await expect(page.locator("#archiveCharacterName")).toHaveText("RIKA_TANAKA");

    await page.locator('.carousel-arrow-right[data-category="clothes"]').click();
    await expect(page.locator("#position-clothes")).toContainText("/");

    await page.locator("#track-clothes .gallery-file-card.is-active").click();
    await expect(page.locator("#galleryModal")).toHaveClass(/is-open/);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#galleryModalCounter")).toContainText("/");
    await page.keyboard.press("Escape");
    await expect(page.locator("#galleryModal")).not.toHaveClass(/is-open/);

    expect(audit.consoleErrors).toEqual([]);
    expect(audit.failedResources).toEqual([]);
});

test("visor PDF abre y conserva descarga disponible", async ({ page }) => {
    const audit = await preparePage(page);
    await page.goto("/biblia-produccion.html");

    await expect(page.locator('a[download="BIBLIA_DE_PRODUCCION.pdf"]')).toHaveAttribute("href", "assets/pdf/pitch-bible.pdf");
    await page.locator("#openBibleButton").click();
    await expect(page.locator("#pdfViewerWindow")).toBeVisible({ timeout: 20000 });
    await expect(page.locator("#pdfCanvas")).toBeVisible();
    await page.locator("#nextPageButton").click();
    await expect(page.locator("#currentPage")).not.toHaveText("1");

    expect(audit.consoleErrors).toEqual([]);
    expect(audit.failedResources).toEqual([]);
});

test("minijuego inicia sin 404 principales", async ({ page }) => {
    const audit = await preparePage(page);
    await page.goto("/minijuego.html");

    await expect(page.locator("#arcadeStartScreen")).toHaveClass(/active/);
    await page.locator("button", { hasText: "[ INICIAR_JUEGO ]" }).first().click();
    await expect(page.locator("#arcadeGameScreen")).toHaveClass(/active/);
    await expect(page.locator("#spaceInvadersCanvas")).toBeVisible();

    expect(audit.consoleErrors).toEqual([]);
    expect(audit.failedResources).toEqual([]);
});
