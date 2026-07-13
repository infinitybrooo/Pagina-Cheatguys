import { expect, test } from "@playwright/test";

const allowedConsolePatterns = [
    /Failed to load resource.*catbox/i,
    /itunes\.apple\.com.*blocked by CORS/i,
    /Failed to load resource: net::ERR_FAILED/i,
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
            window.localStorage.setItem("cheatguys.startIntroSeen.v2", String(Date.now()));
        });
    }

    return { consoleErrors, failedResources };
}

test("index carga, PRESS START existe y el menu lateral funciona", async ({ page }) => {
    const audit = await preparePage(page);
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

test("garage mixer muestra diez lineas EQ con el acento de cada personaje", async ({ page }) => {
    const audit = await preparePage(page);
    await page.goto("/index.html");
    await page.locator("#pressStartBtn").click();
    await expect(page.locator(".profile-container")).toBeVisible();

    await expect(page.locator("#mixerWindowTitle")).toHaveText("INFINITY OS // GARAGE_MIXER");
    await expect(page.locator("#mixerVisualizer .mixer-eq-line")).toHaveCount(10);

    const expectedAccents = {
        akane: "#8a2be2",
        rika: "#ff4500",
        momo: "#ff69b4",
        jun: "#00bfff"
    };

    for (const [character, accent] of Object.entries(expectedAccents)) {
        await page.locator(`[data-cg-mixer="${character}"]`).click();
        await expect(page.locator("#mixerWindow")).toBeVisible();
        await expect(page.locator("#mixerWindow")).toHaveAttribute("data-character", character);
        const renderedAccent = await page.locator("#mixerWindow").evaluate((element) =>
            getComputedStyle(element).getPropertyValue("--mixer-accent").trim()
        );
        expect(renderedAccent.toLowerCase()).toBe(accent);
        await page.locator("[data-cg-mixer-close]").click();
        await expect(page.locator("#mixerWindow")).toBeHidden();
    }

    expect(audit.consoleErrors).toEqual([]);
    expect(audit.failedResources).toEqual([]);
});

test("enlaces internos principales responden sin interceptar controles especiales", async ({ page }) => {
    await preparePage(page);
    await page.goto("/index.html");
    await page.locator("#pressStartBtn").click();
    await expect(page.locator(".profile-container")).toBeVisible();

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
    await page.locator("#pressStartBtn").click();
    await expect(page.locator(".profile-container")).toBeVisible();

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

test("primera visita completa novela, BSOD, loader y lobby sin saltos dobles", async ({ page }) => {
    const audit = await preparePage(page, { skipIntro: false });
    await page.goto("/index.html");
    await page.locator("#pressStartBtn").click();
    await expect(page.locator("#startIntroOverlay")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#startIntroCounter")).toHaveText("TAB 01/08");
    await page.waitForTimeout(320);

    await page.locator("#startIntroContinueBtn").evaluate((button) => {
        button.click();
        button.click();
    });
    await expect(page.locator("#startIntroCounter")).toHaveText("TAB 02/08");
    await page.waitForTimeout(320);

    for (let step = 3; step <= 7; step += 1) {
        await page.locator("#startIntroContinueBtn").click();
        await expect(page.locator("#startIntroCounter")).toHaveText(`TAB ${String(step).padStart(2, "0")}/08`);
        await page.waitForTimeout(step === 7 ? 1200 : 320);
    }

    await page.locator("#startIntroContinueBtn").click();
    await expect(page.locator("#startIntroScreen")).toHaveClass(/is-bsod/);
    await expect(page.locator("#startIntroBsod")).toContainText("0xCHEATGUYS_ARCADE_CRASH");
    await expect(page.locator("#startIntroOverlay")).toHaveAttribute("aria-hidden", "true", { timeout: 6000 });
    await expect(page.locator("body")).toHaveClass(/page-loaded/, { timeout: 6000 });
    await expect(page.locator(".profile-container")).toBeVisible({ timeout: 6000 });

    const storedTimestamp = await page.evaluate(() => Number(localStorage.getItem("cheatguys.startIntroSeen.v2")));
    expect(storedTimestamp).toBeGreaterThan(0);
    expect(audit.consoleErrors).toEqual([]);
    expect(audit.failedResources).toEqual([]);
});

test("omitir intro guarda timestamp y llega al lobby sin recargar", async ({ page }) => {
    await preparePage(page, { skipIntro: false });
    await page.goto("/index.html");
    const initialNavigationEntries = await page.evaluate(() => performance.getEntriesByType("navigation").length);
    await page.locator("#pressStartBtn").click();
    await page.locator("#startIntroSkipBtn").click();
    await expect(page.locator(".profile-container")).toBeVisible();
    await expect(page.locator("#startIntroOverlay")).toHaveAttribute("aria-hidden", "true");
    expect(await page.evaluate(() => performance.getEntriesByType("navigation").length)).toBe(initialNavigationEntries);
    expect(await page.evaluate(() => Number(localStorage.getItem("cheatguys.startIntroSeen.v2")))).toBeGreaterThan(0);
});

test("PRESS START aparece solo en la primera entrada de cada sesion", async ({ page }) => {
    await preparePage(page);
    await page.goto("/index.html");
    await expect(page.locator("#pressStartBtn")).toBeVisible();
    await page.locator("#pressStartBtn").click();
    await expect(page.locator("body")).toHaveClass(/page-loaded/);

    await page.reload();
    await expect(page.locator("#startWindow")).toHaveCount(0);
    await expect(page.locator("body")).toHaveClass(/page-loaded/);

    await page.evaluate(() => sessionStorage.removeItem("cheatguys.startWindowSeen.v1"));
    await page.reload();
    await expect(page.locator("#pressStartBtn")).toBeVisible();
});

test("timestamp reciente omite novela y timestamp vencido vuelve a mostrarla", async ({ page }) => {
    await preparePage(page);
    await page.goto("/index.html");
    await page.locator("#pressStartBtn").click();
    await expect(page.locator(".profile-container")).toBeVisible();
    await expect(page.locator("#startIntroOverlay")).toHaveAttribute("aria-hidden", "true");

    await page.addInitScript(() => {
        localStorage.setItem("cheatguys.startIntroSeen.v2", String(Date.now() - (49 * 60 * 60 * 1000)));
        sessionStorage.removeItem("cheatguys.startWindowSeen.v1");
    });
    await page.reload();
    await page.locator("#pressStartBtn").click();
    await expect(page.locator("#startIntroOverlay")).toHaveAttribute("aria-hidden", "false");
    await page.locator("#startIntroSkipBtn").click();
    await expect(page.locator(".profile-container")).toBeVisible();
});

test("localStorage bloqueado conserva el flujo y el fallback de omitir", async ({ page }) => {
    await page.addInitScript(() => {
        Storage.prototype.getItem = () => { throw new Error("Storage blocked for test"); };
        Storage.prototype.setItem = () => { throw new Error("Storage blocked for test"); };
    });
    await page.goto("/index.html");
    await page.locator("#pressStartBtn").click();
    await expect(page.locator("#startIntroOverlay")).toHaveAttribute("aria-hidden", "false");
    await page.locator("#startIntroSkipBtn").click();
    await expect(page.locator(".profile-container")).toBeVisible();
});

test("la intro responde a teclado y cabe en viewport movil", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await preparePage(page, { skipIntro: false });
    await page.goto("/index.html");
    await page.locator("#pressStartBtn").click();
    await expect(page.locator("#startIntroOverlay")).toHaveAttribute("aria-hidden", "false");
    await page.waitForTimeout(320);
    await page.keyboard.press("Space");
    await expect(page.locator("#startIntroCounter")).toHaveText("TAB 02/08");

    const layout = await page.evaluate(() => {
        const screen = document.getElementById("startIntroScreen").getBoundingClientRect();
        const skip = document.getElementById("startIntroSkipBtn").getBoundingClientRect();
        return {
            screenLeft: screen.left,
            screenRight: screen.right,
            skipLeft: skip.left,
            skipRight: skip.right,
            viewportWidth: document.documentElement.clientWidth,
            hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        };
    });
    expect(layout.screenLeft).toBeGreaterThanOrEqual(0);
    expect(layout.skipLeft).toBeGreaterThanOrEqual(0);
    expect(layout.screenRight).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.skipRight).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.hasHorizontalOverflow).toBe(false);

    await page.locator("#startIntroSkipBtn").click();
    await expect(page.locator("body")).toHaveClass(/page-loaded/);
});

test("boton secreto ejecuta BSOD, limpia contadores y reinicia el flujo", async ({ page }) => {
    await page.goto("/index.html");
    await page.evaluate(() => localStorage.setItem("cheatguys.startIntroSeen.v2", String(Date.now())));
    await page.reload();
    await page.locator("#pressStartBtn").click();
    await expect(page.locator("body")).toHaveClass(/page-loaded/);

    const reloaded = page.waitForEvent("framenavigated");
    await page.locator("#footerIntroResetBtn").click();
    await expect(page.locator("#startIntroScreen")).toHaveClass(/is-bsod/);
    await expect(page.locator("#startIntroBsod")).toContainText("0xCHEATGUYS_ARCADE_CRASH");
    await reloaded;

    await expect(page.locator("#pressStartBtn")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("cheatguys.startIntroSeen.v2"))).toBeNull();
    expect(await page.evaluate(() => sessionStorage.getItem("cheatguys.startWindowSeen.v1"))).toBeNull();
    await page.locator("#pressStartBtn").click();
    await expect(page.locator("#startIntroOverlay")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#startIntroCounter")).toHaveText("TAB 01/08");
    await page.locator("#startIntroSkipBtn").click();
});

test("boton secreto limpia el fundido residual despues de completar la novela", async ({ page }) => {
    await preparePage(page, { skipIntro: false });
    await page.goto("/index.html");
    await page.locator("#pressStartBtn").click();
    await page.waitForTimeout(320);

    for (let step = 2; step <= 7; step += 1) {
        await page.locator("#startIntroContinueBtn").click();
        await page.waitForTimeout(step === 7 ? 1200 : 320);
    }

    await page.locator("#startIntroContinueBtn").click();
    await expect(page.locator("#startIntroOverlay")).toHaveAttribute("aria-hidden", "true", { timeout: 6000 });
    await expect(page.locator("body")).toHaveClass(/page-loaded/, { timeout: 6000 });

    await page.locator("#footerIntroResetBtn").click();
    await expect(page.locator("#startIntroScreen")).toHaveClass(/is-bsod/);
    await expect(page.locator("#startIntroScreen")).not.toHaveClass(/is-fading-black/);
    await expect(page.locator("#startIntroOverlay")).not.toHaveClass(/is-blackout/);
    await page.waitForTimeout(350);
    await expect(page.locator(".start-intro-blackout")).toHaveCSS("opacity", "0");
    await expect(page.locator("#startIntroBsod")).toContainText("0xCHEATGUYS_ARCADE_CRASH");
});

test("la novela de Mitsuki sigue independiente despues del nuevo inicio", async ({ page }) => {
    await preparePage(page);
    await page.goto("/index.html");
    await page.locator("#pressStartBtn").click();
    await expect(page.locator(".profile-container")).toBeVisible();
    await page.locator(".mitsuki-trigger-container").press("Enter");
    await expect(page.locator("#mitsukiOverlay")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#mitsukiStepCounter")).toHaveText("TAB 01/02");
    await page.locator("#mitsukiContinueBtn").click();
    await expect(page.locator("#mitsukiStepCounter")).toHaveText("TAB 02/02");
    await page.locator("#mitsukiContinueBtn").click();
    await expect(page.locator("#mitsukiOverlay")).toHaveAttribute("aria-hidden", "true");
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
