import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function preparePage(page) {
    await page.addInitScript(() => {
        window.localStorage.setItem("cheatguys.startIntroSeen.v2", String(Date.now()));
    });
}

async function expectNoSeriousViolations(page, context) {
    const results = await new AxeBuilder({ page })
        .disableRules(["color-contrast"])
        .analyze();
    const serious = results.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact)
    );

    expect(serious, `${context}: ${serious.map((item) => item.id).join(", ")}`).toEqual([]);
}

test("home/lobby no tiene violaciones axe serias", async ({ page }) => {
    await preparePage(page);
    await page.goto("/index.html");
    await page.locator("#pressStartBtn").click();
    await expect(page.locator(".profile-container")).toBeVisible();
    await expectNoSeriousViolations(page, "index lobby");
});

test("galeria y modal no tienen violaciones axe serias", async ({ page }) => {
    await preparePage(page);
    await page.goto("/galeria.html");
    await expect(page.locator(".gallery-main")).toBeVisible();
    await page.locator('[data-character="rika"]').click();
    await page.locator("#track-clothes .gallery-file-card.is-active").click();
    await expect(page.locator("#galleryModal")).toHaveClass(/is-open/);
    await expectNoSeriousViolations(page, "galeria modal");
});

test("minijuego selector no tiene violaciones axe serias", async ({ page }) => {
    await preparePage(page);
    await page.goto("/minijuego.html");
    await expect(page.locator("#arcadeStartScreen")).toHaveClass(/active/);
    await expectNoSeriousViolations(page, "minijuego selector");
});

test("PERSONALITY_MATCH abierto no tiene violaciones axe serias", async ({ page }) => {
    await preparePage(page);
    await page.goto("/que-es-cheatguys.html");
    await page.locator("#personalityMatchStart").click();
    await expect(page.locator("#personalityMatchModal")).toHaveAttribute("aria-hidden", "false");
    await expectNoSeriousViolations(page, "personality match modal");
});
