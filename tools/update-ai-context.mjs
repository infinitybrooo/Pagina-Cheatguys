import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const contextDir = join(root, "ai-context");
const generatedAt = new Date().toISOString();

const htmlFiles = [
    "index.html",
    "que-es-cheatguys.html",
    "quienes-somos.html",
    "galeria.html",
    "biblia-produccion.html",
    "minijuego.html"
];

const jsFiles = [
    "js/cg-config.js",
    "js/cg-diagnostics.js",
    "js/audio-global.js",
    "js/ui-global.js",
    "js/i18n.js",
    "js/start-intro-novel.js",
    "js/lobby-start.js",
    "js/lobby-data.js",
    "js/lobby-logic.js",
    "js/mitsuki-secret.js",
    "js/galeria-logic.js",
    "js/que-es-cheatguys.js",
    "js/laptop-logic.js",
    "js/biblia-produccion.js",
    "js/arcade-records.js",
    "js/script.js",
    "js/arcade-pacman.js",
    "js/arcade-controller.js"
];

const cssFiles = [
    "css/fonts.css",
    "css/variables.css",
    "css/style.css",
    "css/layout.css",
    "css/components.css",
    "css/animations.css",
    "css/start-intro-novel.css",
    "css/que-es-cheatguys.css",
    "css/quienes-somos.css",
    "css/galeria.css",
    "css/biblia-produccion.css",
    "css/minijuego.css"
];

function read(relativePath) {
    const fullPath = join(root, relativePath);
    return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

function jsonBlock(value) {
    return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function codeBlock(language, value) {
    return `\`\`\`${language}\n${value.trim()}\n\`\`\``;
}

function extractScripts(html) {
    return [...html.matchAll(/<script\s+src=["']([^"']+)["'][^>]*><\/script>/gi)].map((match) => match[1].split("?")[0]);
}

function extractStylesheets(html) {
    return [...html.matchAll(/<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1].split("?")[0]);
}

function extractTitle(html) {
    return html.match(/<title>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim() || "Sin titulo";
}

function extractSnippet(relativePath, startPattern, endPattern) {
    const source = read(relativePath);
    const startIndex = source.search(startPattern);
    if (startIndex === -1) return "";
    const rest = source.slice(startIndex);
    const endMatch = rest.match(endPattern);
    if (!endMatch || typeof endMatch.index !== "number") return rest.slice(0, 1600);
    return rest.slice(0, endMatch.index + endMatch[0].length);
}

function fileSize(relativePath) {
    const content = read(relativePath);
    return content ? `${content.length.toLocaleString("en-US")} chars` : "missing";
}

function buildCodeContext() {
    const packageJson = JSON.parse(read("package.json"));
    const activePages = htmlFiles.map((file) => {
        const html = read(file);
        return {
            file,
            title: extractTitle(html),
            stylesheets: extractStylesheets(html),
            scripts: extractScripts(html)
        };
    });

    const configSnippet = extractSnippet("js/cg-config.js", /const config = \{/, /\n\s*\};/);
    const lobbyDataSnippet = extractSnippet("js/lobby-data.js", /const characters = \{/, /\n\s*const secrets = \[/);
    const i18nSnippet = extractSnippet("js/i18n.js", /const STORAGE_KEY =/, /\n\s*const COMMON_ES = \{/);
    const gallerySnippet = extractSnippet("js/galeria-logic.js", /const GALLERY_BASE_PATH =/, /\n\s*const characterMeta = \{/);
    const bibleSnippet = extractSnippet("js/biblia-produccion.js", /const CONFIG =/, /\n\s*const elements = \{/);
    const arcadeSnippet = extractSnippet("js/arcade-controller.js", /const games =/, /\n\s*function renderLives/);
    const mitsukiSnippet = extractSnippet("js/mitsuki-secret.js", /const MITSUKI_SHARE_URL =/, /\n\s*function getResponsiveMitsukiAsset/);

    return `# CheatGuys! - Contexto IA Parte 1: Codigo real

Generado automaticamente: ${generatedAt}

Uso: este archivo resume el codigo activo real del sitio para darle contexto a otra IA sin copiar \`node_modules\`, assets binarios, backups ni reportes. La raiz del proyecto es \`D:\\Pagina Cheatguys\`.

## Stack y comandos reales

${jsonBlock({
    name: packageJson.name,
    version: packageJson.version,
    private: packageJson.private,
    type: packageJson.type,
    scripts: packageJson.scripts,
    devDependencies: packageJson.devDependencies
})}

## Entradas HTML activas

${activePages.map((page) => `- \`${page.file}\`: ${page.title}`).join("\n")}

## CSS activo por pagina

${activePages.map((page) => `- \`${page.file}\`: ${page.stylesheets.map((item) => `\`${item}\``).join(", ") || "sin CSS detectado"}`).join("\n")}

## JS activo por pagina

${activePages.map((page) => `- \`${page.file}\`: ${page.scripts.map((item) => `\`${item}\``).join(", ") || "sin JS detectado"}`).join("\n")}

## Modulos JS activos

${jsFiles.map((file) => `- \`${file}\`: ${fileSize(file)}`).join("\n")}

## Estilos activos

${cssFiles.map((file) => `- \`${file}\`: ${fileSize(file)}`).join("\n")}

## Configuracion compartida real

${codeBlock("js", configSnippet)}

## Datos de personajes

\`js/lobby-data.js\` define \`window.CG.lobbyData\` y \`window.CGLobbyData\`. Snippet real:

${codeBlock("js", lobbyDataSnippet)}

## Internacionalizacion

\`js/i18n.js\` maneja un selector persistente con modos \`mixed\`, \`es\` y \`en\`. Regla importante: cuando un modal, overlay, toast o contenido se inserta despues de cargar la pagina, se debe llamar \`window.CGLanguage.refresh(root)\` o traducir texto con \`window.CGLanguage.translate(text)\`.

${codeBlock("js", i18nSnippet)}

## Galeria

\`js/galeria-logic.js\` crea una galeria por personaje con categorias \`clothes\`, \`thurn\` y \`sketch\`, carousels, modal y selector.

${codeBlock("js", gallerySnippet)}

## Biblia de produccion

\`js/biblia-produccion.js\` carga PDF.js desde CDN y renderiza \`assets/pdf/pitch-bible.pdf\` en canvas con zoom, paginacion y pantalla completa.

${codeBlock("js", bibleSnippet)}

## Arcade

\`minijuego.html\` carga records, Space Invaders/Galaga custom, Akane Maze y el controlador de seleccion. Snippet real de \`js/arcade-controller.js\`:

${codeBlock("js", arcadeSnippet)}

## Mitsuki

\`js/mitsuki-secret.js\` maneja el boton prohibido del lobby, una mini novela visual de dos pestañas y enlaces para compartir.

${codeBlock("js", mitsukiSnippet)}

## Verificacion recomendada

\`\`\`powershell
npm run check
npm test
\`\`\`

Para regenerar este contexto:

\`\`\`powershell
npm run context:update
\`\`\`
`;
}

function buildAreasContext() {
    return `# CheatGuys! - Contexto IA Parte 2: Descripcion de areas

Generado automaticamente: ${generatedAt}

Uso: este archivo describe todas las areas principales de la pagina para orientar cambios de contenido, UI, rendimiento, accesibilidad o traduccion.

## Identidad general

CheatGuys! es un sitio web estatico de Infinity Brothers Studios con estetica de sistema operativo retro, arcade, anime 2000s, HUDs, ventanas, glitches, musica y narrativa interactiva. El sitio combina presentacion de serie animada, galeria de arte, minijuegos, biblia de produccion y easter eggs.

## Navegacion global

Todas o casi todas las paginas usan una barra lateral con Inicio, ¿Quienes somos?, ¿Que es CheatGuys!?, Minijuegos, Galeria, Biblia de Produccion, control de musica/volumen y selector de idioma. La navegacion y audio global dependen de \`js/audio-global.js\`, \`js/ui-global.js\` y \`js/i18n.js\`.

## Inicio / lobby

Archivo: \`index.html\`

- Intro inicial estilo novela visual/error del sistema, controlada por \`js/start-intro-novel.js\`.
- Ventana de arranque/lobby con estetica Infinity OS, audio de lobby y estado de carga.
- Hero/lobby con logo, texto de alerta y selector de personajes.
- Selector de personajes: Akane, Rika, Momo y Jun. Abre un modal con ficha, rol, descripcion, imagen y color de personaje.
- Quick scroll nav: accesos a \`SYSTEM_FILES\`, \`INVENTORY\`, \`SHOP\` y \`SOUND\`.
- \`SYSTEM_FILES\`: links a biblia oficial, X y TikTok.
- \`INVENTORY\`: stickers de WhatsApp y emotes de Discord en estado coming soon.
- \`MERCHANT_SHOP\`: Patreon coming soon, Buy Me a Coffee y PayPal.
- \`SOUND_TEST_MENU\`: playlists de Akane, Rika, Momo y Jun con links a YouTube/Spotify y boton \`[ PREVIEW ]\`.
- Mixer flotante: ventana \`INFINITY OS // GARAGE_MIXER\` con preview musical, arte, visualizador y link externo.
- X Feed: ventana flotante con publicaciones manuales cargadas desde \`assets/data/x-feed.json\`.
- Boton Mitsuki: easter egg \`NO PRESIONAR\` con mini novela visual y botones de compartir.
- Footer: branding de Infinity Brothers y boton secreto para reiniciar la intro.
- Modales ocultos: ficha de personaje, archivos secretos y overlay de Mitsuki.

## Archivos secretos

Ubicacion: modal \`secretModal\` en \`index.html\`; datos en \`js/lobby-data.js\`; logica en \`js/lobby-logic.js\`.

- Lista archivos secretos numerados.
- Muestra imagen grande y lore del archivo seleccionado.
- Usa assets de \`assets/secrets/\` y algunos de \`assets/arcade/\`.
- Debe traducirse con \`window.CGLanguage.refresh(root)\` porque el contenido se inyecta dinamicamente.

## Mitsuki

Ubicacion: \`index.html\` y \`js/mitsuki-secret.js\`.

- Easter egg de dos pasos al presionar \`NO PRESIONAR\`.
- Cambia ilustraciones entre \`assets/mitsuki/pestana-1-mitsuki.webp\` y \`assets/mitsuki/pestana-2-mitsuki.webp\`.
- En el ultimo paso muestra botones de compartir para WhatsApp, Facebook, X y Discord.
- Discord copia texto al portapapeles y abre Discord.
- Tiene variantes responsivas en \`assets/mitsuki/mobile/\`.

## ¿Que es CheatGuys!?

Archivo: \`que-es-cheatguys.html\`; estilos en \`css/que-es-cheatguys.css\`; logica adicional en \`js/que-es-cheatguys.js\` y \`js/laptop-logic.js\`.

- Hero/presentacion de la premisa: comedia animada sobre Akane formando una banda para intentar hacer amigos.
- Seccion de premisa: ansiedad social, ultimo año de secundaria, videojuegos, guitarra y banda.
- Formula CheatGuys!: comedia absurda, banda escolar, estetica anime/J-rock/chiptune, caos mexicano.
- Neo Teno: ciudad alternativa con mezcla Mexico/Japon, templos, tamales, trenes bala, mercados, LEDs y arcades.
- Laptop de Akane: app interactiva para conversar con personajes desde el garaje, usando \`/.netlify/functions/chat\`.

## ¿Quienes somos?

Archivo: \`quienes-somos.html\`; estilos en \`css/quienes-somos.css\`.

- Presentacion de Infinity Brothers Studios como laboratorio creativo.
- Mascotas/avatares del estudio: Sally, Orian e Infinity, cada una con rol creativo.
- Personas reales detras del estudio: dos hermanos de Jalisco, Mexico.
- Roles de produccion: arte/diseño visual, escritura/showrunner, worldbuilding, continuidad y biblias de produccion.
- Cierre institucional: historias infinitas, mundos infinitos.

## Galeria

Archivo: \`galeria.html\`; logica en \`js/galeria-logic.js\`; estilos en \`css/galeria.css\`.

- Archivo visual interactivo \`VISUAL_ARCHIVE\`.
- Selector de personaje: Akane, Rika, Momo, Jun.
- Consola de personaje con nombre, color, estado y dialogos.
- Categorias: \`VESTIMENTAS\`, \`TURNAROUNDS\`/hojas de giro y \`BOCETOS\`.
- Carousels con autoplay, controles, swipe y modal de imagen.
- Rutas de imagen: \`assets/images/gallery/{personaje}/\` y thumbnails en \`thumbs/\`.

## Biblia de produccion

Archivo: \`biblia-produccion.html\`; logica en \`js/biblia-produccion.js\`; estilos en \`css/biblia-produccion.css\`.

- Ventana tipo file manager \`INFINITY OS // FILE MANAGER\`.
- Metadatos del archivo PDF: autor, version, estado confidencial.
- Boton \`[ ABRIR ARCHIVO ]\`.
- Secuencia de carga con mensajes.
- Visor PDF en canvas para \`assets/pdf/pitch-bible.pdf\`.
- Controles: pagina anterior/siguiente, contador de pagina, zoom, pantalla completa y descarga.
- Usa PDF.js desde CDN definido en \`js/cg-config.js\`.

## Minijuegos / Arcade

Archivo: \`minijuego.html\`; estilos en \`css/minijuego.css\`.

- Overlay arcade completo con selector de juego.
- Juego 1: Space Invaders/Purple Run, implementado principalmente en \`js/script.js\`.
- Juego 2: Akane Maze, implementado en \`js/arcade-pacman.js\`.
- \`js/arcade-controller.js\` alterna entre juegos, canvas y controles moviles.
- \`js/arcade-records.js\` guarda records locales y define la puntuacion de Akane.
- Pantallas: start/select game, game screen, pause menu, game over y win screen.
- Audio especifico: lobby arcade, Pacman, sudden death, game over, victoria y disparo.

## Assets principales

- Branding: \`assets/branding/\`
- Fondos: \`assets/backgrounds/\`
- Personajes: \`assets/characters/\`
- Galeria: \`assets/images/gallery/\`
- Studio info: \`assets/images/studio-info/\`
- CheatGuys info: \`assets/images/cheatguys-info/\`
- Arcade: \`assets/arcade/\`
- Secretos: \`assets/secrets/\`
- Mitsuki: \`assets/mitsuki/\`
- Audio: \`assets/audio/\`
- Fuentes locales: \`assets/fonts/\`
- PDF: \`assets/pdf/pitch-bible.pdf\`

## Areas sensibles para cambios

- Traduccion: revisar contenido dinamico, no solo texto estatico. Modales, toasts, Mitsuki, Secret Archives, galeria y arcade insertan o cambian texto despues de cargar.
- Rendimiento movil: inicio/lobby, overlays fijos, filtros, animaciones, canvas y efectos visuales son las zonas de mayor riesgo.
- Arcade: mantener separadas las rutas de Space Invaders (\`script.js\`) y Akane Maze (\`arcade-pacman.js\`).
- Cache busting: los HTML usan parametros \`?v=...\`; despues de cambios reales conviene usar \`npm run cache:bust\` o validar con \`npm run cache:check\`.
- Accesibilidad: overlays deben manejar foco, Escape, \`aria-hidden\`, \`aria-modal\` y scroll del body.

## Reglas para otra IA

- No editar assets binarios salvo que se pida explicitamente.
- No tocar backups \`*.backup*\` ni \`*.fallback*\` como fuente activa.
- No modificar \`node_modules\`, \`.netlify\`, \`test-results\` ni reportes.
- Preferir patrones existentes: IIFE en JS, globals bajo \`window.CG\`, \`window.CG_CONFIG\`, \`window.CGLanguage\`, \`window.AudioManager\`.
- Si se crea contenido dinamico, aplicar idioma activo al nodo insertado.
- Si se cambia CSS visual, probar desktop y mobile.
- Si se cambia JS compartido, correr \`npm run check\` y, si afecta flujos visibles, \`npm test\`.

## Rutina semanal

Este archivo y \`01-codigo-real.md\` se regeneran con:

\`\`\`powershell
npm run context:update
\`\`\`

La carpeta \`ai-context/\` debe permanecer en \`.gitignore\`.
`;
}

function ensureGitignoreEntry() {
    const gitignorePath = join(root, ".gitignore");
    const current = read(".gitignore");
    if (/(^|\r?\n)ai-context\/(\r?\n|$)/.test(current)) return;
    const next = `${current.replace(/\s*$/, "")}\nai-context/\n`;
    writeFileSync(gitignorePath, next, "utf8");
}

mkdirSync(contextDir, { recursive: true });
ensureGitignoreEntry();
writeFileSync(join(contextDir, "01-codigo-real.md"), buildCodeContext(), "utf8");
writeFileSync(join(contextDir, "02-descripcion-areas.md"), buildAreasContext(), "utf8");

console.log(`Contexto IA actualizado en ${contextDir}`);
