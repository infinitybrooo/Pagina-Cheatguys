import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const allowedConsolePatterns = [
    /favicon/i,
    /Failed to load resource: net::ERR_FAILED/i
];

const answerPaths = {
    akane: [1, 2, 3, 0, 1, 3, 2],
    rika: [2, 1, 0, 3, 3, 1, 0],
    momo: [0, 3, 2, 1, 2, 0, 1],
    jun: [3, 0, 1, 2, 0, 2, 3]
};

const resultNames = {
    akane: "AKANE HOSHIZORA",
    rika: "RIKA TANAKA",
    momo: "MOMO FUJIWARA",
    jun: "JUNPEI SAKAMOTO"
};

async function preparePage(page, language = "mixed") {
    const consoleErrors = [];
    const failedResources = [];

    page.on("console", (message) => {
        if (message.type() !== "error") return;
        const text = message.text();
        if (!allowedConsolePatterns.some((pattern) => pattern.test(text))) consoleErrors.push(text);
    });
    page.on("response", (response) => {
        if (response.url().startsWith("http://127.0.0.1:4173") && response.status() === 404) {
            failedResources.push(response.url());
        }
    });
    await page.addInitScript((mode) => {
        window.localStorage.setItem("cgLanguageMode", mode);
    }, language);
    await page.goto("/que-es-cheatguys.html");
    return { consoleErrors, failedResources };
}

async function openTest(page) {
    await page.locator("#personalityMatchStart").click();
    await expect(page.locator("#personalityMatchModal")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#personalityMatchDialog")).toBeFocused();
}

async function answerPath(page, path) {
    for (let questionIndex = 0; questionIndex < path.length; questionIndex += 1) {
        await expect(page.locator(".personality-match-answer")).toHaveCount(4);
        await page.locator(`[data-personality-answer="${path[questionIndex]}"]`).click();
        if (questionIndex < path.length - 1) {
            await expect(page.locator("#personalityMatchProgress")).toContainText(`${questionIndex + 2} / 7`);
        }
    }
    await expect(page.locator("#personalityMatchResult")).toBeVisible();
}

async function answerFor(page, character) {
    await answerPath(page, answerPaths[character]);
}

function expectHealthy(audit) {
    expect(audit.consoleErrors).toEqual([]);
    expect(audit.failedResources).toEqual([]);
}

async function expectPngSize(download, width, height) {
    const filePath = await download.path();
    const bytes = await readFile(filePath);
    expect(bytes.toString("ascii", 1, 4)).toBe("PNG");
    expect(bytes.readUInt32BE(16)).toBe(width);
    expect(bytes.readUInt32BE(20)).toBe(height);
}

test("PERSONALITY_MATCH abre, recorre siete preguntas, muestra Akane y reinicia", async ({ page }) => {
    const audit = await preparePage(page);
    await expect(page.locator("#personality-match")).toBeVisible();
    await openTest(page);
    await expect(page.locator("#personalityMatchProgress")).toContainText("1 / 7");
    await answerFor(page, "akane");

    await expect(page.locator("#personalityMatchQuiz")).toBeHidden();
    await expect(page.locator("#personalityMatchResultTitle")).toHaveText(resultNames.akane);
    await expect(page.locator("#personalityMatchPercent")).toHaveText("100% MATCH");
    await expect(page.locator(".personality-match-bar-row")).toHaveCount(4);
    await expect(page.locator("#personalityMatchPortrait")).toHaveAttribute("src", "assets/characters/cards/ficha-akane.webp");
    await expect(page.locator("#personalityMatchIcon")).toHaveAttribute("src", "assets/icons/icon-akane.webp");
    await expect(page.locator(".personality-match-compatibility h4")).toHaveText("DIAGNÓSTICO DE RASGOS");
    await expect(page.locator("#personalityMatchDownload")).toBeVisible();
    await expect(page.locator("#personalityMatchDownload")).toBeEnabled();
    await expect(page.locator("#personalityMatchShareTitle")).toHaveText("COMPARTIR RESULTADO");
    await expect(page.locator("#personalityMatchNativeShare")).toBeVisible();
    await expect(page.locator(".personality-match-social-btn")).toHaveCount(4);
    await expect(page.locator("#personalityMatchShareWA")).toHaveAttribute("href", /api\.whatsapp\.com\/send\?text=/);
    await expect(page.locator("#personalityMatchShareFB")).toHaveAttribute("href", /facebook\.com\/sharer/);
    await expect(page.locator("#personalityMatchShareX")).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
    await expect(page.locator("#personalityMatchShareDC")).toHaveAttribute("href", "https://discord.com/channels/@me");

    await page.locator("#personalityMatchRestart").click();
    await expect(page.locator("#personalityMatchQuiz")).toBeVisible();
    await expect(page.locator("#personalityMatchProgress")).toContainText("1 / 7");
    await expect(page.locator("#personalityMatchResult")).toBeHidden();
    expectHealthy(audit);
});

for (const character of ["rika", "momo", "jun"]) {
    test(`PERSONALITY_MATCH puede producir resultado ${character}`, async ({ page }) => {
        const audit = await preparePage(page);
        await openTest(page);
        await answerFor(page, character);
        await expect(page.locator("#personalityMatchResultTitle")).toHaveText(resultNames[character]);
        await expect(page.locator("#personalityMatchPercent")).toHaveText("100% MATCH");
        await expect(page.locator("#personalityMatchPortrait")).toHaveAttribute(
            "src",
            `assets/characters/cards/ficha-${character}.webp`
        );
        expectHealthy(audit);
    });
}

test("PERSONALITY_MATCH resuelve un empate con la respuesta de la pregunta siete", async ({ page }) => {
    const audit = await preparePage(page);
    await openTest(page);
    await answerPath(page, [1, 1, 2, 2, 1, 1, 1]);
    await expect(page.locator("#personalityMatchResultTitle")).toHaveText(resultNames.momo);
    await expect(page.locator("#personalityMatchPercent")).toHaveText("68% MATCH");
    await expect(page.locator('.personality-match-bar-row[aria-label^="EMPATÍA:"]')).toHaveAttribute(
        "aria-label",
        "EMPATÍA: 43% compatibilidad"
    );
    expectHealthy(audit);
});

test("PERSONALITY_MATCH cierra con Escape y devuelve el foco", async ({ page }) => {
    const audit = await preparePage(page);
    await openTest(page);
    await page.keyboard.press("Escape");
    await expect(page.locator("#personalityMatchModal")).toBeHidden();
    await expect(page.locator("#personalityMatchModal")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#personalityMatchStart")).toBeFocused();
    await expect(page.locator("body")).not.toHaveClass(/personality-match-open/);
    expectHealthy(audit);
});

test("PERSONALITY_MATCH funciona en viewport movil sin overflow horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const audit = await preparePage(page);
    await openTest(page);
    await expect(page.locator(".personality-match-window")).toBeVisible();
    await expect(page.locator(".personality-match-answer")).toHaveCount(4);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await answerFor(page, "jun");
    await expect(page.locator("#personalityMatchDownload")).toBeVisible();
    await expect(page.locator("#personalityMatchDownload")).toBeEnabled();
    expectHealthy(audit);
});

test("PERSONALITY_MATCH traduce el contenido dinamico del modal", async ({ page }) => {
    const audit = await preparePage(page, "en");
    await expect(page.locator("#personalityMatchStart")).toHaveText("[ START DIAGNOSTIC ]");
    await openTest(page);
    await expect(page.locator("#personalityMatchProgress")).toHaveText("QUESTION 1 / 7");
    await expect(page.locator("#personalityMatchQuestion")).toHaveText(
        "You are in a group project and nobody knows where to start. What do you do?"
    );
    await expect(page.locator(".personality-match-answer").first()).toContainText("I ask what everyone wants to do");

    await page.evaluate(() => window.CGLanguage.set("es"));
    await expect(page.locator("#personalityMatchProgress")).toHaveText("PREGUNTA 1 / 7");
    await expect(page.locator("#personalityMatchQuestion")).toContainText("Estás en un proyecto grupal");
    await answerFor(page, "rika");
    await expect(page.locator("#personalityMatchShareTitle")).toHaveText("COMPARTIR RESULTADO");
    expectHealthy(audit);
});

test("PERSONALITY_MATCH traduce los controles de compartir resultado", async ({ page }) => {
    const audit = await preparePage(page, "en");
    await openTest(page);
    await answerFor(page, "rika");
    await expect(page.locator("#personalityMatchShareTitle")).toHaveText("SHARE RESULT");
    await expect(page.locator("#personalityMatchNativeShare")).toHaveText("[ SHARE CARD ]");
    await expect(page.locator("#personalityMatchShareWA img")).toHaveAttribute("alt", "Share result on WhatsApp");
    expectHealthy(audit);
});

test("PERSONALITY_MATCH descarga la tarjeta PNG con el nombre correcto", async ({ page }) => {
    const audit = await preparePage(page);
    await openTest(page);
    await answerFor(page, "momo");
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#personalityMatchDownload").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("cheatguys-personality-momo.png");
    await expectPngSize(download, 1080, 1350);
    await expect(page.locator("#personalityMatchToast")).toBeHidden();
    await expect(page.locator("#personalityMatchModal")).toBeVisible();
    expectHealthy(audit);
});
