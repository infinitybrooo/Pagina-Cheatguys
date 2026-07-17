import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const headers = readFileSync(join(root, "_headers"), "utf8");
const chatFunction = readFileSync(join(root, "netlify/functions/chat.js"), "utf8");
const requiredHeaders = [
    "Content-Security-Policy",
    "X-Content-Type-Options: nosniff",
    "Referrer-Policy:",
    "Permissions-Policy:",
    "X-Frame-Options: DENY"
];
const errors = [];

for (const header of requiredHeaders) {
    if (!headers.includes(header)) errors.push(`_headers falta ${header}`);
}

if (!/frame-ancestors\s+'none'/.test(headers)) {
    errors.push("_headers CSP debe bloquear embedding con frame-ancestors 'none'.");
}

if (!/object-src\s+'none'/.test(headers)) {
    errors.push("_headers CSP debe bloquear plugins con object-src 'none'.");
}

if (/Access-Control-Allow-Origin["']:\s*["']\*/.test(chatFunction)) {
    errors.push("netlify/functions/chat.js no debe dejar CORS abierto con '*'.");
}

if (!chatFunction.includes("CG_ALLOWED_ORIGIN")) {
    errors.push("netlify/functions/chat.js debe permitir configurar origen via CG_ALLOWED_ORIGIN.");
}

if (errors.length) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
}

console.log("CG security check OK: headers and chat CORS guardrails verified.");
