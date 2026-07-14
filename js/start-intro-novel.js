// =====================================================
// CHEATGUYS! - Mini novela visual de presentacion
// Las composiciones de las viñetas 1-7 usan el placeholder reemplazable.
// =====================================================
(function () {
    "use strict";

    const CONFIG = window.CG_CONFIG?.startIntro || {};
    const STORAGE_KEY = CONFIG.storageKey || "cheatguys.startIntroSeen.v2";
    const SEEN_DURATION_MS = CONFIG.seenDurationMs || 48 * 60 * 60 * 1000;
    const TRANSITION_MS = CONFIG.sceneTransitionMs || 280;
    const BSOD_DURATION_MS = CONFIG.bsodDurationMs || 1500;
    const BLACK_FADE_MS = CONFIG.blackFadeMs || 320;
    const PLACEHOLDER = "assets/start-window/novel/placeholder.webp";

    if (CONFIG.enabled === false) {
        window.CG = window.CG || {};
        window.CG.startIntro = Object.freeze({
            start: () => false,
            skip: () => {},
            shouldShow: () => false,
            resetSeen: () => {},
            triggerResetCrash: () => false,
            restartExperience: () => {},
            storageKey: STORAGE_KEY,
            seenDurationMs: SEEN_DURATION_MS
        });
        window.CGStartIntro = window.CG.startIntro;
        return;
    }

    const PORTRAITS = Object.freeze({
        akane: "assets/icons/icon-akane.webp",
        rika: "assets/icons/icon-rika.webp",
        momo: "assets/icons/icon-momo.webp",
        jun: "assets/icons/icon-jun.webp"
    });

    // Fuente de verdad editable de la secuencia. Para reemplazar arte, cambia background/sprites[].src.
    const SCENES = Object.freeze([
        {
            id: "panic-leader",
            title: "El Pánico de la Líder",
            characters: ["akane"],
            speaker: "AKANE",
            portrait: PORTRAITS.akane,
            dialogue: "¡C-Cierra la ventana! ¡Espera! ¡No veas nada todavía! A-A la página le faltan retoques en el código y mi barra de estamina social está en cero...",
            background: PLACEHOLDER,
            sprites: [{ src: PLACEHOLDER, alt: "Composición provisional de Akane", position: "50% 50%", size: "min(78%, 620px)", entrance: "pop" }],
            effects: []
        },
        {
            id: "punk-kick",
            title: "La Patada Punk",
            characters: ["rika", "akane"],
            speaker: "RIKA",
            portrait: PORTRAITS.rika,
            dialogue: "¡Ignoren a la chica morada ansiosa! ¡Bienvenidos al centro de operaciones de CheatGuys! Aquí van a encontrar el lore real, los diseños y toda la música que nos costó sudor y sangre!",
            background: PLACEHOLDER,
            sprites: [{ src: PLACEHOLDER, alt: "Composición provisional de Rika y Akane", position: "58% 50%", size: "min(82%, 650px)", entrance: "kick" }],
            effects: []
        },
        {
            id: "sabotage-attempt",
            title: "El Intento de Boicot",
            characters: ["akane", "rika"],
            speaker: "AKANE",
            portrait: PORTRAITS.akane,
            dialogue: "¡N-No es seguro! Rika, la base de datos está atada con alambres... Por favor, regresen… en… en unas tres semanas...",
            background: PLACEHOLDER,
            sprites: [{ src: PLACEHOLDER, alt: "Composición provisional de Akane y Rika", position: "42% 52%", size: "min(76%, 600px)", entrance: "slide-left" }],
            effects: []
        },
        {
            id: "pastel-invasion",
            title: "Invasión Pastel",
            characters: ["momo", "akane"],
            speaker: "MOMO",
            portrait: PORTRAITS.momo,
            dialogue: "¡Siii! Y no olviden que pueden revisar nuestra galería de arte interactiva, chismosear los secretos de la banda y platicar con nosotras en tiempo real desde la laptop de Akane. ¡Sean amables con ella! ✨💖",
            background: PLACEHOLDER,
            sprites: [{ src: PLACEHOLDER, alt: "Composición provisional de Momo y Akane", position: "50% 48%", size: "min(84%, 670px)", entrance: "float" }],
            effects: ["pastel-sparkles"]
        },
        {
            id: "reality-check",
            title: "El Toque de Realidad",
            characters: ["jun"],
            speaker: "JUN",
            portrait: PORTRAITS.jun,
            // REVISAR GUION: la frase fuente termina en "somos pobres" y no tiene cierre.
            dialogue: "Ya que están aquí... abajo están los links para tirar el paro. Pueden compartir el garaje con sus amigos, viciarse un rato en el minijuego de arcade o, si les sobra algo de platita, somos pobres",
            editorNote: "TEXTO_INCOMPLETO_EN_GUION: confirmar cierre de la viñeta 5.",
            background: PLACEHOLDER,
            sprites: [{ src: PLACEHOLDER, alt: "Composición provisional de Jun", position: "52% 50%", size: "min(77%, 610px)", entrance: "slide-right" }],
            effects: []
        },
        {
            id: "ultimatum",
            title: "El Ultimátum",
            characters: ["rika", "momo", "jun"],
            speaker: "RIKA / MOMO / JUN",
            portrait: PORTRAITS.rika,
            dialogue: "¡Así que exploren todo lo que quieran, exploren lo que no deben y ayúdennos a hacer ruido en Neo Teno! 🎸🔥",
            background: PLACEHOLDER,
            sprites: [{ src: PLACEHOLDER, alt: "Composición provisional de Rika, Momo y Jun", position: "50% 50%", size: "min(86%, 690px)", entrance: "group" }],
            effects: ["concert-flash"]
        },
        {
            id: "mental-collapse",
            title: "El Colapso Mental",
            characters: ["akane"],
            speaker: "AKANE",
            portrait: PORTRAITS.akane,
            // REVISAR GUION: la comilla del diálogo no está cerrada en el archivo fuente.
            dialogue: "¡AAAAH! ¡DEMASIADA INTERACCIÓN SOCIAL NO PROGRAMADAAAA! EROOOOOORRR-1!",
            editorNote: "PUNTUACION_INCOMPLETA_EN_GUION: confirmar cierre de la viñeta 7.",
            background: PLACEHOLDER,
            sprites: [{ src: PLACEHOLDER, alt: "Composición provisional del colapso de Akane", position: "50% 50%", size: "min(94%, 740px)", entrance: "overload" }],
            effects: ["red-static", "glitch", "pixel-disintegrate", "anxious-overload"],
            transitionDuration: 1150
        },
        {
            id: "fatal-error",
            type: "bsod",
            title: "Pantalla de Error y Reinicio",
            characters: [],
            speaker: "INFINITY OS",
            dialogue: "FATAL_ERROR: ANXIOUS_OVERLOAD_999% ***",
            background: "infinity-os-bsod",
            sprites: [],
            effects: ["bsod", "black-fade"],
            autoDuration: BSOD_DURATION_MS,
            bsod: {
                headline: "FATAL_ERROR: ANXIOUS_OVERLOAD_999% ***",
                paragraphs: [
                    "Un error fatal ha ocurrido en la interfaz del grupo. El proceso Akane.exe dejó de responder debido a una interacción social no programada en el entorno web.",
                    "Si esta es la primera vez que ve esta pantalla de error, es probable que a Jun se le haya zafado una baqueta, Rika haya roto otra cuerda de la guitarra, o Momo se haya distraído viendo algo color pastel."
                ],
                bullets: [
                    "Presione cualquier botón de los controles para estabilizar el HUD de Akane.",
                    "Por favor, espere a que el amplificador del garaje deje de hacer interferencia.",
                    "Iniciando protocolo de emergencia: Ir por un café al Bloom & Brew."
                ],
                restart: "Reiniciando el entorno gráfico de Neo Teno...",
                code: "Código de error: 0xCHEATGUYS_ARCADE_CRASH"
            }
        }
    ]);

    let active = false;
    let locked = false;
    let sceneIndex = 0;
    let callbacks = {};
    let elements = null;
    let completionBehavior = "remember";
    const timers = new Set();

    function safeReadTimestamp() {
        try {
            const value = window.localStorage.getItem(STORAGE_KEY);
            const timestamp = Number(value);
            return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
        } catch (_) {
            return null;
        }
    }

    function shouldShow() {
        const timestamp = safeReadTimestamp();
        if (!timestamp) return true;
        const elapsed = Date.now() - timestamp;
        return elapsed < 0 || elapsed >= SEEN_DURATION_MS;
    }

    function rememberSeen() {
        try {
            window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
        } catch (_) {
            // El flujo continua aunque localStorage este bloqueado o lleno.
        }
    }

    function resetSeen() {
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (_) {
            // El reinicio visual no depende de que localStorage este disponible.
        }
    }

    function cacheElements() {
        const ids = [
            "startIntroOverlay", "startIntroScreen", "startIntroCounter", "startIntroSkipBtn",
            "startIntroScene", "startIntroVisual", "startIntroSprites", "startIntroEffects",
            "startIntroDialogueBox", "startIntroPortrait", "startIntroSpeaker", "startIntroText",
            "startIntroContinueBtn", "startIntroBsod"
        ];
        const found = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
        if (ids.some((id) => !found[id])) return null;
        return found;
    }

    function schedule(callback, delay) {
        const timer = window.setTimeout(() => {
            timers.delete(timer);
            callback();
        }, delay);
        timers.add(timer);
        return timer;
    }

    function clearTimers() {
        timers.forEach((timer) => window.clearTimeout(timer));
        timers.clear();
    }

    function playConfiguredSfx(name, volume) {
        const url = CONFIG.sfx?.[name];
        if (url && window.AudioManager?.playSfx) {
            window.AudioManager.playSfx(url, { volume });
        }
    }

    function renderSprites(scene) {
        elements.startIntroSprites.replaceChildren();
        scene.sprites.forEach((sprite, index) => {
            const image = document.createElement("img");
            image.className = `start-intro-sprite is-${sprite.entrance || "pop"}`;
            image.src = sprite.src;
            image.alt = sprite.alt || "";
            image.decoding = "async";
            image.style.setProperty("--intro-sprite-position", sprite.position || "50% 50%");
            image.style.setProperty("--intro-sprite-size", sprite.size || "min(80%, 640px)");
            image.style.setProperty("--intro-sprite-layer", String(index + 1));
            image.addEventListener("error", () => image.remove(), { once: true });
            elements.startIntroSprites.appendChild(image);
        });
    }

    function renderEffects(scene) {
        elements.startIntroEffects.className = "start-intro-effects";
        scene.effects.forEach((effect) => elements.startIntroEffects.classList.add(`has-${effect}`));
        elements.startIntroScreen.classList.toggle("has-scene-glitch", scene.effects.includes("glitch"));
        elements.startIntroSprites.classList.toggle("is-disintegrating", scene.effects.includes("pixel-disintegrate"));
    }

    function renderScene(scene) {
        elements.startIntroSkipBtn.hidden = false;
        elements.startIntroScene.hidden = false;
        elements.startIntroBsod.hidden = true;
        elements.startIntroScreen.classList.remove("is-bsod", "is-fading-black");
        elements.startIntroCounter.textContent = `TAB ${String(sceneIndex + 1).padStart(2, "0")}/08`;
        elements.startIntroSpeaker.textContent = scene.speaker;
        elements.startIntroText.textContent = scene.dialogue;
        elements.startIntroPortrait.src = scene.portrait;
        elements.startIntroPortrait.alt = `Retrato de ${scene.speaker}`;
        elements.startIntroDialogueBox.dataset.review = scene.editorNote || "";
        elements.startIntroVisual.style.backgroundImage = `linear-gradient(rgba(5, 0, 10, 0.42), rgba(5, 0, 10, 0.74)), url("${scene.background}")`;
        elements.startIntroVisual.dataset.characters = scene.characters.join(",");
        renderSprites(scene);
        renderEffects(scene);
        playConfiguredSfx(scene.effects.includes("glitch") ? "glitch" : "dialogue", 0.7);

        elements.startIntroScene.classList.remove("is-entering");
        void elements.startIntroScene.offsetWidth;
        elements.startIntroScene.classList.add("is-entering");
        schedule(() => {
            locked = false;
            elements.startIntroScene.classList.remove("is-entering");
        }, scene.transitionDuration || TRANSITION_MS);
    }

    function appendBsodText(container, tag, className, text) {
        const element = document.createElement(tag);
        element.className = className;
        element.textContent = text;
        container.appendChild(element);
    }

    function renderBsod(scene) {
        locked = true;
        elements.startIntroScreen.classList.remove("is-fading-black");
        elements.startIntroOverlay.classList.remove("is-blackout");
        elements.startIntroScene.hidden = true;
        elements.startIntroBsod.hidden = false;
        elements.startIntroScreen.classList.remove("has-scene-glitch");
        elements.startIntroScreen.classList.add("is-bsod");
        elements.startIntroCounter.textContent = "FATAL 08/08";
        if (!elements.startIntroSkipBtn.hidden) {
            elements.startIntroSkipBtn.focus({ preventScroll: true });
        } else {
            elements.startIntroScreen.focus({ preventScroll: true });
        }
        elements.startIntroBsod.replaceChildren();

        appendBsodText(elements.startIntroBsod, "div", "start-intro-bsod-brand", "INFINITY OS // CHEATGUYS! CRASH REPORT");
        appendBsodText(elements.startIntroBsod, "h2", "start-intro-bsod-title", scene.bsod.headline);
        scene.bsod.paragraphs.forEach((text) => appendBsodText(elements.startIntroBsod, "p", "start-intro-bsod-copy", text));

        const list = document.createElement("ul");
        list.className = "start-intro-bsod-list";
        scene.bsod.bullets.forEach((text) => appendBsodText(list, "li", "", text));
        elements.startIntroBsod.appendChild(list);
        appendBsodText(elements.startIntroBsod, "p", "start-intro-bsod-restart", scene.bsod.restart);
        appendBsodText(elements.startIntroBsod, "p", "start-intro-bsod-code", scene.bsod.code);
        playConfiguredSfx("error", 0.9);

        schedule(() => {
            if (!active) return;
            elements.startIntroScreen.classList.add("is-fading-black");
            elements.startIntroOverlay.classList.add("is-blackout");
            schedule(() => finish("complete"), BLACK_FADE_MS);
        }, scene.autoDuration || BSOD_DURATION_MS);
    }

    function advance() {
        if (!active || locked) return;
        try {
            locked = true;
            sceneIndex += 1;
            const scene = SCENES[sceneIndex];
            if (!scene) {
                finish("complete");
                return;
            }
            if (scene.type === "bsod") {
                renderBsod(scene);
                return;
            }
            renderScene(scene);
        } catch (error) {
            fail(error);
        }
    }

    function onKeydown(event) {
        if (!active || event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
        if (event.target === elements.startIntroSkipBtn) return;
        event.preventDefault();
        advance();
    }

    function onDialogueKeydown(event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        advance();
    }

    function bindEvents() {
        elements.startIntroContinueBtn.addEventListener("click", advance);
        elements.startIntroDialogueBox.addEventListener("click", advance);
        elements.startIntroDialogueBox.addEventListener("keydown", onDialogueKeydown);
        elements.startIntroSkipBtn.addEventListener("click", skip);
        document.addEventListener("keydown", onKeydown);
    }

    function unbindEvents() {
        elements.startIntroContinueBtn.removeEventListener("click", advance);
        elements.startIntroDialogueBox.removeEventListener("click", advance);
        elements.startIntroDialogueBox.removeEventListener("keydown", onDialogueKeydown);
        elements.startIntroSkipBtn.removeEventListener("click", skip);
        document.removeEventListener("keydown", onKeydown);
    }

    function closeOverlay() {
        if (window.CGOverlay) {
            window.CGOverlay.close("startIntroOverlay", { restoreFocus: false });
        } else {
            elements.startIntroOverlay.style.display = "none";
            elements.startIntroOverlay.setAttribute("aria-hidden", "true");
        }
    }

    function finish(reason) {
        if (!active) return;
        active = false;
        locked = true;
        clearTimers();
        unbindEvents();
        window.AudioManager?.stopSfx?.();
        if (completionBehavior === "reset" && reason === "complete") {
            resetSeen();
        } else if (completionBehavior === "remember" && (reason === "complete" || reason === "skip")) {
            rememberSeen();
        }
        closeOverlay();
        const callback = reason === "skip" ? callbacks.onSkip : reason === "error" ? callbacks.onError : callbacks.onComplete;
        callbacks = {};
        if (typeof callback === "function") callback();
    }

    function skip() {
        finish("skip");
    }

    function fail(error) {
        if (window.CG_LOG) window.CG_LOG.error("START_INTRO", "CG-INTRO-002", "La novela activo el fallback.", error);
        finish("error");
    }

    function openIntroOverlay(focusElement, onEscape, closeOthers = false) {
        if (window.CGOverlay) {
            return window.CGOverlay.open("startIntroOverlay", {
                mode: "display",
                display: "flex",
                focusElement,
                closeOthers,
                restoreFocus: false,
                onEscape
            });
        }

        elements.startIntroOverlay.style.display = "flex";
        elements.startIntroOverlay.setAttribute("aria-hidden", "false");
        focusElement.focus({ preventScroll: true });
        return true;
    }

    function start(options = {}) {
        if (active) return true;
        try {
            elements = cacheElements();
            if (!elements) return false;
            callbacks = options;
            completionBehavior = "remember";
            active = true;
            locked = true;
            sceneIndex = 0;
            elements.startIntroOverlay.classList.remove("is-blackout");
            bindEvents();
            renderScene(SCENES[sceneIndex]);

            const opened = openIntroOverlay(elements.startIntroContinueBtn, skip, false);
            if (!opened) throw new Error("No se pudo abrir el overlay de introduccion.");
            return true;
        } catch (error) {
            if (active && elements) {
                fail(error);
                return true;
            }
            return false;
        }
    }

    function triggerResetCrash(options = {}) {
        if (active) return false;
        try {
            elements = cacheElements();
            if (!elements) return false;
            callbacks = options;
            completionBehavior = "reset";
            active = true;
            locked = true;
            sceneIndex = SCENES.length - 1;
            elements.startIntroSkipBtn.hidden = true;
            elements.startIntroOverlay.classList.remove("is-blackout");
            renderBsod(SCENES[sceneIndex]);

            const opened = openIntroOverlay(elements.startIntroScreen, () => {}, true);
            if (!opened) throw new Error("No se pudo abrir el BSOD de recuperacion.");
            return true;
        } catch (error) {
            if (active && elements) {
                fail(error);
                return true;
            }
            return false;
        }
    }

    function restartExperience() {
        const button = document.getElementById("footerIntroResetBtn");
        if (button) button.disabled = true;

        const reloadAfterLoader = () => {
            resetSeen();
            window.CGLobbyStart?.resetStartWindowSession?.();
            const reload = () => window.location.reload();
            if (window.CGLobbyStart?.showLoadingScreen) {
                window.CGLobbyStart.showLoadingScreen(reload);
            } else {
                reload();
            }
        };

        const started = triggerResetCrash({
            onComplete: reloadAfterLoader,
            onError: reloadAfterLoader
        });
        if (!started) reloadAfterLoader();
    }

    const footerResetButton = document.getElementById("footerIntroResetBtn");
    if (footerResetButton) footerResetButton.addEventListener("click", restartExperience, { once: true });

    window.CG = window.CG || {};
    window.CG.startIntroScenes = SCENES;
    window.CG.startIntro = Object.freeze({
        start,
        skip,
        shouldShow,
        resetSeen,
        triggerResetCrash,
        restartExperience,
        storageKey: STORAGE_KEY,
        seenDurationMs: SEEN_DURATION_MS
    });
    window.CGStartIntro = window.CG.startIntro;
})();
