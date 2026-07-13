import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const requiredFiles = [
    "index.html",
    "galeria.html",
    "minijuego.html",
    "que-es-cheatguys.html",
    "quienes-somos.html",
    "biblia-produccion.html",
    "js/cg-config.js",
    "js/cg-diagnostics.js",
    "js/ui-global.js",
    "js/audio-global.js",
    "js/lobby-logic.js",
    "js/galeria-logic.js",
    "js/laptop-logic.js",
    "js/biblia-produccion.js",
    "netlify/functions/chat.js",
    "assets/pdf/pitch-bible.pdf"
];

const htmlFiles = requiredFiles.filter((file) => file.endsWith(".html"));
const jsFiles = [
    "js/cg-config.js",
    "js/cg-diagnostics.js",
    "js/ui-global.js",
    "js/audio-global.js",
    "js/lobby-logic.js",
    "js/galeria-logic.js",
    "js/mitsuki-secret.js",
    "js/laptop-logic.js",
    "js/biblia-produccion.js",
    "js/script.js",
    "netlify/functions/chat.js"
];

const errors = [];

function fail(message) {
    errors.push(message);
}

function exists(relativePath) {
    return existsSync(join(root, relativePath));
}

function stripQuery(value) {
    return value.split("#")[0].split("?")[0];
}

function isLocalReference(value) {
    return value
        && !value.startsWith("#")
        && !value.startsWith("mailto:")
        && !value.startsWith("tel:")
        && !value.startsWith("javascript:")
        && !/^[a-z]+:\/\//i.test(value)
        && !value.startsWith("data:");
}

function checkRequiredFiles() {
    requiredFiles.forEach((file) => {
        if (!exists(file)) fail(`Falta archivo requerido: ${file}`);
    });
}

function checkJavaScriptSyntax() {
    jsFiles.forEach((file) => {
        if (!exists(file)) return;
        const result = spawnSync(process.execPath, ["--check", join(root, file)], {
            encoding: "utf8"
        });
        if (result.status !== 0) {
            fail(`Error de sintaxis en ${file}:\n${result.stderr || result.stdout}`);
        }
    });
}

function checkHtmlReferences() {
    const attrPattern = /\b(?:src|href)=["']([^"']+)["']/gi;

    htmlFiles.forEach((file) => {
        const html = readFileSync(join(root, file), "utf8");
        let match;

        if (!/<html[\s>]/i.test(html) || !/<\/html>/i.test(html)) fail(`${file}: estructura HTML incompleta.`);
        if (!/<meta\s+name=["']viewport["']/i.test(html)) fail(`${file}: falta meta viewport.`);

        while ((match = attrPattern.exec(html))) {
            const rawRef = match[1];
            if (!isLocalReference(rawRef)) continue;

            const cleanRef = stripQuery(rawRef);
            if (!cleanRef || cleanRef === ".") continue;

            const target = normalize(join(dirname(join(root, file)), cleanRef));
            if (!target.startsWith(root) || !existsSync(target)) {
                fail(`${file}: referencia faltante ${rawRef}`);
            }
        }
    });
}

function checkStorageKeys() {
    const config = readFileSync(join(root, "js/cg-config.js"), "utf8");
    ["cheatguys.startIntroSeen.v1", "cgMasterVolume", "cgMusicEnabled"].forEach((key) => {
        if (!config.includes(key)) fail(`Config compartida no contiene storage key: ${key}`);
    });
}

checkRequiredFiles();
checkJavaScriptSyntax();
checkHtmlReferences();
checkStorageKeys();

if (errors.length) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
}

console.log("CG check OK: sintaxis, rutas locales y archivos principales verificados.");
