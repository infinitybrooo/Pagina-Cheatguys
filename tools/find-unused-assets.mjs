import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const assetRoot = join(root, "assets");
const sourceExtensions = new Set([".html", ".css", ".js", ".mjs", ".json"]);
const assetExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".mp3", ".wav", ".mp4", ".pdf", ".txt"]);
const ignoredDirs = new Set(["node_modules", ".git", "trash", "test-results", "playwright-report"]);
const sourceText = [];
const assets = [];
const dynamicAssetReferences = [];

function walk(dir, visitor) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue;
        const absolute = join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(absolute, visitor);
        } else {
            visitor(absolute);
        }
    }
}

walk(root, (absolute) => {
    const extension = extname(absolute).toLowerCase();
    const relativePath = relative(root, absolute).replace(/\\/g, "/");
    if (sourceExtensions.has(extension)) {
        sourceText.push(readFileSync(absolute, "utf8"));
    }
    if (absolute.startsWith(assetRoot) && assetExtensions.has(extension)) {
        assets.push(relativePath);
    }
});

for (const character of ["akane", "rika", "momo", "jun"]) {
    for (const [category, prefix, numbers] of [
        ["clothes", "Clothes", character === "akane" ? [1, 2, 3, 4, 5, 6] : character === "jun" ? [1, 2, 3, 4] : [1, 2, 3, 4, 5]],
        ["thurn", "Thurn", character === "momo" || character === "akane" ? [1, 2, 3, 4] : [1, 2, 3]],
        ["sketch", "Sketch", character === "akane" ? [1, 2, 3, 4, 5, 7] : [1, 2, 3, 4, 5]]
    ]) {
        void category;
        for (const number of numbers) {
            dynamicAssetReferences.push(`assets/images/gallery/${character}/${prefix}-${character}-${number}.webp`);
            dynamicAssetReferences.push(`assets/images/gallery/${character}/thumbs/${prefix}-${character}-${number}.webp`);
        }
    }
}

const haystack = [...sourceText, ...dynamicAssetReferences].join("\n");
const candidates = assets.filter((asset) => {
    const basename = asset.split("/").pop();
    return !haystack.includes(asset) && !haystack.includes(basename);
});

if (!existsSync(assetRoot)) {
    console.error("No existe assets/.");
    process.exit(1);
}

console.log("CG unused asset candidates: revisar antes de mover");
console.log(candidates.length ? candidates.map((asset) => `- ${asset}`).join("\n") : "- ninguno");
