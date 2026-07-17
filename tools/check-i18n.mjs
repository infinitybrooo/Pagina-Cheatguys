import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const i18n = readFileSync(join(root, "js/i18n.js"), "utf8");
const dynamicFiles = [
    "js/lobby-logic.js",
    "js/mitsuki-secret.js",
    "js/start-intro-novel.js",
    "js/cookie-notice.js",
    "js/laptop-logic.js"
];
const requiredApi = [
    "window.CGLanguage",
    "translateRaw",
    "refresh(root = document.body)",
    "translateAttributes(element)"
];
const errors = [];

for (const api of requiredApi) {
    if (!i18n.includes(api)) errors.push(`js/i18n.js falta contrato esperado: ${api}`);
}

for (const file of dynamicFiles) {
    const source = readFileSync(join(root, file), "utf8");
    const hasDynamicHtml = /\.innerHTML\s*=|document\.createElement|insertAdjacentHTML/.test(source);
    const hasI18nTouchpoint = /CGLanguage|applyActiveLanguage|translate\(/.test(source);

    if (hasDynamicHtml && !hasI18nTouchpoint) {
        errors.push(`${file} inyecta DOM dinamico sin punto de traduccion visible.`);
    }
}

if (errors.length) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
}

console.log("CG i18n check OK: runtime translation contracts and dynamic touchpoints verified.");
