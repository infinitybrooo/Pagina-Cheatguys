import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const checkOnly = process.argv.includes("--check");
const entryFiles = [
    "index.html",
    "galeria.html",
    "minijuego.html",
    "que-es-cheatguys.html",
    "quienes-somos.html",
    "biblia-produccion.html",
    "css/style.css"
];
const versionedExtensions = new Set([".css", ".js"]);
const updatedFiles = new Set();
const staleFiles = [];
const missingRefs = [];

function toPosix(path) {
    return path.replace(/\\/g, "/");
}

function splitReference(rawRef) {
    const hashIndex = rawRef.indexOf("#");
    const beforeHash = hashIndex >= 0 ? rawRef.slice(0, hashIndex) : rawRef;
    const hash = hashIndex >= 0 ? rawRef.slice(hashIndex) : "";
    const queryIndex = beforeHash.indexOf("?");
    const path = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
    const query = queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : "";
    return { path, query, hash };
}

function isVersionableReference(rawRef) {
    if (!rawRef || rawRef.startsWith("#")) return false;
    if (/^(?:[a-z]+:)?\/\//i.test(rawRef)) return false;
    if (/^(?:data|mailto|tel|javascript):/i.test(rawRef)) return false;
    const { path } = splitReference(rawRef);
    return versionedExtensions.has(extname(path).toLowerCase());
}

function hashFile(absolutePath) {
    return createHash("sha256").update(readFileSync(absolutePath)).digest("hex").slice(0, 12);
}

function resolveReference(ownerFile, rawRef) {
    const { path } = splitReference(rawRef);
    const absolutePath = normalize(join(dirname(join(root, ownerFile)), path));
    if (!absolutePath.startsWith(root) || !existsSync(absolutePath)) return null;
    return absolutePath;
}

function versionReference(ownerFile, rawRef) {
    if (!isVersionableReference(rawRef)) return rawRef;

    const target = resolveReference(ownerFile, rawRef);
    if (!target) {
        missingRefs.push(`${ownerFile}: ${rawRef}`);
        return rawRef;
    }

    const { path, query, hash } = splitReference(rawRef);
    const params = new URLSearchParams(query);
    params.set("v", hashFile(target));
    const queryString = params.toString();
    return `${path}${queryString ? `?${queryString}` : ""}${hash}`;
}

function updateHtmlReferences(ownerFile, source) {
    return source.replace(/\b(src|href)=["']([^"']+)["']/gi, (match, attr, rawRef) => {
        const nextRef = versionReference(ownerFile, rawRef);
        return nextRef === rawRef ? match : `${attr}="${nextRef}"`;
    });
}

function updateCssImports(ownerFile, source) {
    return source.replace(/@import\s+url\((["']?)([^"')]+)\1\)/gi, (match, quote, rawRef) => {
        const nextRef = versionReference(ownerFile, rawRef.trim());
        if (nextRef === rawRef.trim()) return match;
        const nextQuote = quote || "'";
        return `@import url(${nextQuote}${nextRef}${nextQuote})`;
    });
}

function updateFile(relativeFile) {
    const absoluteFile = join(root, relativeFile);
    const source = readFileSync(absoluteFile, "utf8");
    const next = relativeFile.endsWith(".css")
        ? updateCssImports(relativeFile, source)
        : updateHtmlReferences(relativeFile, source);

    if (next === source) return false;

    if (checkOnly) {
        staleFiles.push(relativeFile);
        return true;
    }

    writeFileSync(absoluteFile, next);
    updatedFiles.add(relativeFile);
    return true;
}

function runPass() {
    let changed = false;
    entryFiles.forEach((file) => {
        changed = updateFile(file) || changed;
    });
    return changed;
}

if (checkOnly) {
    runPass();
} else {
    const maxPasses = 6;
    let changed = false;
    for (let pass = 0; pass < maxPasses; pass += 1) {
        changed = runPass();
        if (!changed) break;
        if (pass === maxPasses - 1) {
            console.error("Cache bust: no se alcanzo un estado estable.");
            process.exit(1);
        }
    }
}

if (missingRefs.length) {
    console.error("Cache bust: referencias locales faltantes:\n" + missingRefs.map((ref) => `- ${ref}`).join("\n"));
    process.exit(1);
}

if (staleFiles.length) {
    console.error("Cache bust: versiones desactualizadas en:\n" + staleFiles.map((file) => `- ${file}`).join("\n"));
    console.error("Ejecuta: npm run cache:bust");
    process.exit(1);
}

if (updatedFiles.size) {
    console.log("Cache bust actualizado:\n" + Array.from(updatedFiles).map((file) => `- ${toPosix(relative(root, join(root, file)))}`).join("\n"));
} else {
    console.log("Cache bust OK: versiones al dia.");
}
