import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const htmlFiles = readdirSync(root).filter((file) => file.endsWith(".html"));
const errors = [];

for (const file of htmlFiles) {
    const source = readFileSync(join(root, file), "utf8");
    const anchorPattern = /<a\b[^>]*target=["']_blank["'][^>]*>/gi;
    let match;

    while ((match = anchorPattern.exec(source))) {
        const tag = match[0];
        const rel = /\brel=["']([^"']*)["']/i.exec(tag)?.[1] || "";
        const missing = ["noopener", "noreferrer"].filter((value) => !rel.split(/\s+/).includes(value));

        if (missing.length) {
            const line = source.slice(0, match.index).split(/\r?\n/).length;
            errors.push(`${file}:${line} target="_blank" missing rel="${missing.join(" ")}"`);
        }
    }
}

if (errors.length) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
}

console.log("CG external link check OK: target=_blank links use noopener noreferrer.");
