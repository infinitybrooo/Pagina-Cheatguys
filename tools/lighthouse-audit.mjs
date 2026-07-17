import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, ".codex-analysis", "lighthouse");
const outputPath = join(outputDir, "index.report.html");
const url = "http://127.0.0.1:4173/index.html";

mkdirSync(outputDir, { recursive: true });

function run(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: root,
            shell: true,
            stdio: "inherit",
            ...options
        });

        child.on("exit", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${command} ${args.join(" ")} salio con codigo ${code}`));
        });
    });
}

const server = spawn("npx", ["http-server", ".", "-p", "4173", "-c-1"], {
    cwd: root,
    shell: true,
    stdio: "ignore"
});

try {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    await run("npx", [
        "lighthouse",
        url,
        "--only-categories=performance,accessibility,best-practices",
        "--chrome-flags=\"--headless --no-sandbox\"",
        "--output=html",
        `--output-path="${outputPath}"`,
        "--quiet"
    ]);
    console.log(`CG lighthouse audit OK: ${outputPath}`);
} finally {
    server.kill();
}
