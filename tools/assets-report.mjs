import { readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const assetRoot = join(root, "assets");
const maxAssetBytes = 5 * 1024 * 1024;
const maxImageBytes = 2 * 1024 * 1024;
const maxAudioBytes = 4 * 1024 * 1024;
const maxVideoBytes = 4 * 1024 * 1024;
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const audioExtensions = new Set([".mp3", ".wav", ".ogg", ".m4a"]);
const videoExtensions = new Set([".mp4", ".webm"]);
const files = [];
const warnings = [];

function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const absolute = join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(absolute);
            continue;
        }

        const stats = statSync(absolute);
        files.push({ absolute, size: stats.size });
    }
}

function formatBytes(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

walk(assetRoot);

for (const file of files) {
    const extension = extname(file.absolute).toLowerCase();
    const relativePath = relative(root, file.absolute).replace(/\\/g, "/");
    const budget = imageExtensions.has(extension)
        ? maxImageBytes
        : audioExtensions.has(extension)
            ? maxAudioBytes
            : videoExtensions.has(extension)
                ? maxVideoBytes
                : maxAssetBytes;

    if (file.size > budget) {
        warnings.push(`${relativePath} pesa ${formatBytes(file.size)}; presupuesto ${formatBytes(budget)}.`);
    }
}

const largest = files
    .sort((a, b) => b.size - a.size)
    .slice(0, 15)
    .map((file) => `${relative(root, file.absolute).replace(/\\/g, "/")} ${formatBytes(file.size)}`);

const imageProbe = files.find((file) => imageExtensions.has(extname(file.absolute).toLowerCase()));
if (imageProbe) {
    await sharp(imageProbe.absolute).metadata();
}

console.log("CG asset report: archivos mas pesados");
console.log(largest.map((line) => `- ${line}`).join("\n"));

if (warnings.length) {
    console.warn("\nCG asset report: candidatos de optimizacion");
    console.warn(warnings.map((warning) => `- ${warning}`).join("\n"));
} else {
    console.log("\nCG asset report OK: no hay assets fuera de presupuesto.");
}
