import { expect, test } from "@playwright/test";

const allowedConsolePatterns = [
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
    await expect(page.locator("[data-arcade-game]")).toHaveCount(2);
    await page.locator("button", { hasText: "[ INICIAR_JUEGO ]" }).first().click();
    await expect(page.locator("#arcadeGameScreen")).toHaveClass(/active/);
    await expect(page.locator("#spaceInvadersCanvas")).toBeVisible();

    expect(audit.consoleErrors).toEqual([]);
    expect(audit.failedResources).toEqual([]);
});

test("Akane Maze inicia y conserva el record en localStorage", async ({ page }) => {
    const audit = await preparePage(page);
    await page.goto("/minijuego.html?game=maze");

    const mazeOption = page.locator('[data-arcade-game="akane-maze"]');
    await expect(mazeOption).toHaveAttribute("aria-pressed", "true");
    await expect(mazeOption.locator(".arcade-game-icon img")).toHaveCount(3);
    await expect(page.locator("#akaneMazePreview")).toHaveCount(0);
    await page.locator("button", { hasText: "[ INICIAR_JUEGO ]" }).first().click();
    await expect(page.locator("#arcadeGameScreen")).toHaveClass(/active/);
    await expect(page.locator("#akaneMazeCanvas")).toBeVisible();
    await expect(page.locator("#spaceInvadersCanvas")).toBeHidden();
    await expect(page.locator("#arcadeStatusLine")).toContainText("LEVEL 01");
    await page.waitForTimeout(1400);

    const readMazeState = async () => page.evaluate(() => window.__akaneMazeDebugState());
    const directions = ["ArrowUp", "ArrowLeft", "ArrowRight", "ArrowDown"];
    let movement = null;
    for (const direction of directions) {
        const before = await readMazeState();
        await page.keyboard.down(direction);
        await page.waitForTimeout(650);
        const during = await readMazeState();
        await page.keyboard.up(direction);
        await page.waitForTimeout(650);
        const after = await readMazeState();
        const moved = Math.hypot(during.player.c - before.player.c, during.player.r - before.player.r);
        const driftAfterRelease = Math.hypot(after.player.c - during.player.c, after.player.r - during.player.r);
        if (moved > 0.12) {
            movement = { moved, driftAfterRelease };
            break;
        }
    }
    expect(movement?.moved).toBeGreaterThan(0.12);
    expect(movement.driftAfterRelease).toBeLessThan(0.08);

    await page.evaluate(() => {
        window.ArcadeRecords.record(window.ArcadeRecords.GAME_IDS.MAZE, 123456);
    });
    await page.reload();
    await expect(page.locator("[data-arcade-overall-record]").first()).toHaveText("123,456");
    await expect(page.locator("#arcadeRecordStatus")).toHaveText("TU RECORD SUPERA A AKANE");

    expect(audit.consoleErrors).toEqual([]);
    expect(audit.failedResources).toEqual([]);
});
