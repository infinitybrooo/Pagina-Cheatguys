// =====================================================
// PERSONALITY_MATCH.EXE - Diagnostico local de build
// =====================================================
(function () {
    "use strict";

    const CHARACTER_ORDER = ["akane", "rika", "momo", "jun"];
    const LOGO_PATH = "assets/branding/mobile/logo-cheatguys.webp";
    const SHARE_CARD_WIDTH = 1080;
    const SHARE_CARD_HEIGHT = 1350;
    const SHARE_PAGE_URL = "https://cheatguys.com/que-es-cheatguys.html#personality-match";
    const UI_SFX = window.CG_CONFIG?.sfx?.uiButton || "assets/audio/later/botones.wav";
    const COMPLETE_SFX = window.CG_CONFIG?.sfx?.powerUp || "assets/audio/later/powerup_minijuego.wav";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const characters = {
        akane: {
            shortName: "AKANE",
            name: "AKANE HOSHIZORA",
            build: "HUD_SOCIAL_JRPG",
            trait: "OBSERVACIÓN",
            social: "HUD ACTIVO",
            bonus: "PRECISIÓN EMOCIONAL",
            debuff: "SOBREANÁLISIS 300%",
            description: "Analizas más de lo que dices, observas detalles que otros ignoran y haces cosas importantes aunque preferirías que nadie estuviera mirando.",
            cardText: "No quieres ser el centro de la historia, pero de alguna forma la historia termina organizándose alrededor de ti.",
            colorProperty: "--akane-color",
            fallbackColor: "#8a2be2",
            image: "assets/characters/cards/ficha-akane.webp",
            icon: "assets/icons/icon-akane.webp"
        },
        rika: {
            shortName: "RIKA",
            name: "RIKA TANAKA",
            build: "VOLUME_MAX",
            trait: "IMPULSO",
            social: "VOLUME MAX",
            bonus: "PRESENCIA ESCÉNICA",
            debuff: "CERO FILTRO",
            description: "Funcionas con emoción, impulso y volumen máximo. No siempre tienes un plan, pero tienes suficiente energía para fabricar uno mientras avanzas.",
            cardText: "Tu estrategia consiste en avanzar primero y preguntarle al universo qué ocurrió después. Sorprendentemente, funciona.",
            colorProperty: "--rika-color",
            fallbackColor: "#ff4500",
            image: "assets/characters/cards/ficha-rika.webp",
            icon: "assets/icons/icon-rika.webp"
        },
        momo: {
            shortName: "MOMO",
            name: "MOMO FUJIWARA",
            build: "SOFT_BASS_HEALER",
            trait: "EMPATÍA",
            social: "SOFT HEALER",
            bonus: "ARMONÍA DE GRUPO",
            debuff: "DISTRACCIÓN PASTEL",
            description: "Tu mayor fuerza es hacer que las personas se sientan acompañadas. Puede que tu mente viaje, pero tu corazón casi siempre sabe dónde quedarse.",
            cardText: "Conviertes grupos de personas extrañas en algo parecido a un hogar, aunque te distraigas durante el proceso.",
            colorProperty: "--momo-color",
            fallbackColor: "#ff69b4",
            image: "assets/characters/cards/ficha-momo.webp",
            icon: "assets/icons/icon-momo.webp"
        },
        jun: {
            shortName: "JUN",
            name: "JUNPEI SAKAMOTO",
            build: "LUCKY_SLEEP_MODE",
            trait: "CALMA",
            social: "POWER SAVING",
            bonus: "TALENTO INTUITIVO",
            debuff: "MOTIVACIÓN NO ENCONTRADA",
            description: "No desperdicias energía donde no hace falta. Observas, esperas y apareces justo cuando todos ya habían asumido que estabas dormido.",
            cardText: "Pareces estar usando el 1% de tu energía, pero ese 1% suele aparecer exactamente cuando hace falta.",
            colorProperty: "--jun-color",
            fallbackColor: "#00bfff",
            image: "assets/characters/cards/ficha-jun.webp",
            icon: "assets/icons/icon-jun.webp"
        }
    };

    const questions = [
        {
            prompt: "Estás en un proyecto grupal y nadie sabe por dónde empezar. ¿Qué haces?",
            order: ["momo", "akane", "rika", "jun"],
            answers: {
                akane: "Organizo mentalmente todo, espero unos segundos y propongo un plan cuando ya estoy bastante seguro.",
                rika: "Tomo el mando inmediatamente. Ya veremos cómo arreglamos los errores después.",
                momo: "Pregunto qué quiere hacer cada persona e intento que todos se sientan incluidos.",
                jun: "Observo quién parece más competente y ayudo solo donde realmente haga falta."
            }
        },
        {
            prompt: "Tu grupo debe presentarse frente a mucha gente. ¿Cómo reaccionas?",
            order: ["jun", "rika", "akane", "momo"],
            answers: {
                akane: "Practico muchísimo para reducir cualquier posibilidad de equivocarme.",
                rika: "Entro con toda la energía posible. Si algo sale mal, lo convierto en parte del espectáculo.",
                momo: "Me concentro en apoyar a los demás para que nadie se sienta solo.",
                jun: "Intento no pensarlo demasiado. Mientras conozca mi parte, todo debería salir bien."
            }
        },
        {
            prompt: "Algo importante sale completamente mal. ¿Cuál es tu primera reacción?",
            order: ["rika", "jun", "momo", "akane"],
            answers: {
                akane: "Repaso cada decisión intentando descubrir exactamente dónde comenzó el error.",
                rika: "Me enojo, digo lo que pienso y empiezo a buscar una solución de inmediato.",
                momo: "Reviso cómo se sienten los demás antes de preocuparme por el problema técnico.",
                jun: "Me quedo tranquilo. Casi siempre aparece una salida si nadie entra en pánico."
            }
        },
        {
            prompt: "Tienes una tarde completamente libre. ¿Qué plan te atrae más?",
            order: ["akane", "momo", "jun", "rika"],
            answers: {
                akane: "Quedarme en casa con videojuegos, música o alguna actividad que pueda hacer a mi ritmo.",
                rika: "Salir sin demasiada planificación y terminar en algún lugar interesante.",
                momo: "Hacer algo bonito, decorar, preparar comida o pasar tiempo con alguien querido.",
                jun: "Dormir, comer algo y decidir después si todavía quiero hacer planes."
            }
        },
        {
            prompt: "Un amigo está pasando por un momento difícil. ¿Cómo lo ayudas?",
            order: ["jun", "akane", "momo", "rika"],
            answers: {
                akane: "Escucho con atención y pienso mucho antes de decir algo para no empeorar la situación.",
                rika: "Le recuerdo con firmeza que no tiene que aguantarlo todo y me ofrezco a enfrentar el problema con él.",
                momo: "Me quedo cerca, le doy cariño y le hago saber que no tiene que explicar todo para recibir apoyo.",
                jun: "Le doy espacio, pero sigo pendiente y aparezco cuando realmente me necesita."
            }
        },
        {
            prompt: "¿Qué clase de habilidad te gustaría dominar?",
            order: ["momo", "rika", "jun", "akane"],
            answers: {
                akane: "Una habilidad precisa que mejore mientras más practico y estudio sus patrones.",
                rika: "Algo que me permita expresarme con fuerza y dejar una impresión inolvidable.",
                momo: "Algo creativo con lo que pueda hacer sentir bien a otras personas.",
                jun: "Algo que pueda aprender intuitivamente sin depender demasiado de reglas rígidas."
            }
        },
        {
            prompt: "¿Qué frase se parece más a tu forma de vivir?",
            order: ["rika", "momo", "akane", "jun"],
            answers: {
                akane: "No necesito llamar la atención para hacer algo importante.",
                rika: "Prefiero equivocarme haciendo algo que quedarme esperando.",
                momo: "Las cosas funcionan mejor cuando nadie se siente dejado atrás.",
                jun: "No todo necesita tanta energía para salir bien."
            }
        }
    ];

    const elements = {
        start: document.getElementById("personalityMatchStart"),
        modal: document.getElementById("personalityMatchModal"),
        dialog: document.getElementById("personalityMatchDialog"),
        close: document.getElementById("personalityMatchClose"),
        quiz: document.getElementById("personalityMatchQuiz"),
        progress: document.getElementById("personalityMatchProgress"),
        progressBar: document.getElementById("personalityMatchProgressBar"),
        question: document.getElementById("personalityMatchQuestion"),
        answers: document.getElementById("personalityMatchAnswers"),
        back: document.getElementById("personalityMatchBack"),
        result: document.getElementById("personalityMatchResult"),
        resultTitle: document.getElementById("personalityMatchResultTitle"),
        percent: document.getElementById("personalityMatchPercent"),
        build: document.getElementById("personalityMatchBuild"),
        description: document.getElementById("personalityMatchResultDescription"),
        trait: document.getElementById("personalityMatchTrait"),
        social: document.getElementById("personalityMatchSocial"),
        bonus: document.getElementById("personalityMatchBonus"),
        debuff: document.getElementById("personalityMatchDebuff"),
        cardText: document.getElementById("personalityMatchCardText"),
        portrait: document.getElementById("personalityMatchPortrait"),
        icon: document.getElementById("personalityMatchIcon"),
        iconLabel: document.getElementById("personalityMatchIconLabel"),
        portraitFallback: document.getElementById("personalityMatchPortraitFallback"),
        bars: document.getElementById("personalityMatchBars"),
        restart: document.getElementById("personalityMatchRestart"),
        download: document.getElementById("personalityMatchDownload"),
        nativeShare: document.getElementById("personalityMatchNativeShare"),
        shareWA: document.getElementById("personalityMatchShareWA"),
        shareFB: document.getElementById("personalityMatchShareFB"),
        shareX: document.getElementById("personalityMatchShareX"),
        shareDC: document.getElementById("personalityMatchShareDC"),
        toast: document.getElementById("personalityMatchToast")
    };

    if (!elements.start || !elements.modal || !elements.dialog) return;

    function getLanguageMode() {
        return window.CGLanguage?.get?.() || "mixed";
    }

    const state = {
        currentQuestion: 0,
        answers: Array(questions.length).fill(null),
        result: null,
        languageMode: getLanguageMode(),
        previousFocus: null,
        transitionTimer: 0,
        toastTimer: 0,
        backgroundState: new Map()
    };

    function translate(value) {
        return window.CGLanguage?.translate?.(value) || value;
    }

    function refresh(root) {
        window.CGLanguage?.refresh?.(root);
    }

    function playUiSound(volume = 0.46) {
        window.AudioManager?.unlockSfx?.();
        window.AudioManager?.playSfx?.(UI_SFX, { volume });
    }

    function playCompleteSound() {
        window.AudioManager?.playSfx?.(COMPLETE_SFX, { volume: 0.55 });
    }

    function getCharacterColor(character) {
        const meta = characters[character];
        return getComputedStyle(document.documentElement).getPropertyValue(meta.colorProperty).trim() || meta.fallbackColor;
    }

    function getRgbTriplet(color, fallback = "#8a2be2") {
        const source = String(color || fallback).trim();
        const hex = source.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (hex) return `${parseInt(hex[1], 16)}, ${parseInt(hex[2], 16)}, ${parseInt(hex[3], 16)}`;

        const shortHex = source.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
        if (shortHex) {
            return `${parseInt(shortHex[1] + shortHex[1], 16)}, ${parseInt(shortHex[2] + shortHex[2], 16)}, ${parseInt(shortHex[3] + shortHex[3], 16)}`;
        }

        const rgb = source.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (rgb) return `${rgb[1]}, ${rgb[2]}, ${rgb[3]}`;

        return getRgbTriplet(fallback, "#8a2be2");
    }

    function clearTransition() {
        if (!state.transitionTimer) return;
        window.clearTimeout(state.transitionTimer);
        state.transitionTimer = 0;
    }

    function hideToast() {
        if (state.toastTimer) window.clearTimeout(state.toastTimer);
        state.toastTimer = 0;
        elements.toast.hidden = true;
        elements.toast.textContent = "";
    }

    function showToast(message) {
        hideToast();
        elements.toast.textContent = translate(message);
        elements.toast.hidden = false;
        state.toastTimer = window.setTimeout(hideToast, 4200);
    }

    function setBackgroundBlocked(blocked) {
        const siblings = document.querySelectorAll("body > :not(#personalityMatchModal):not(script)");
        siblings.forEach((element) => {
            if (blocked) {
                state.backgroundState.set(element, {
                    inert: Boolean(element.inert),
                    hadAriaHidden: element.hasAttribute("aria-hidden"),
                    ariaHidden: element.getAttribute("aria-hidden")
                });
                element.inert = true;
                element.setAttribute("aria-hidden", "true");
                return;
            }

            const previous = state.backgroundState.get(element);
            if (!previous) return;
            element.inert = previous.inert;
            if (previous.hadAriaHidden) element.setAttribute("aria-hidden", previous.ariaHidden);
            else element.removeAttribute("aria-hidden");
        });
        if (!blocked) state.backgroundState.clear();
    }

    function resetState() {
        clearTransition();
        hideToast();
        state.currentQuestion = 0;
        state.answers.fill(null);
        state.result = null;
        elements.portrait.removeAttribute("src");
        elements.portrait.alt = "";
        elements.icon.removeAttribute("src");
        elements.icon.alt = "";
        elements.iconLabel.textContent = "";
        elements.portrait.hidden = false;
        elements.portraitFallback.classList.remove("is-visible");
        elements.dialog.style.removeProperty("--pm-accent");
        elements.result.style.removeProperty("--pm-accent");
        elements.result.hidden = true;
        elements.quiz.hidden = false;
        elements.download.disabled = false;
        elements.download.textContent = "[ DESCARGAR TARJETA ]";
        if (elements.nativeShare) {
            elements.nativeShare.disabled = false;
            elements.nativeShare.textContent = translate("[ COMPARTIR TARJETA ]");
        }
    }

    function renderQuestion(index, options = {}) {
        const question = questions[index];
        state.currentQuestion = index;
        elements.quiz.hidden = false;
        elements.result.hidden = true;
        elements.progress.textContent = `${translate("PREGUNTA")} ${index + 1} / ${questions.length}`;
        elements.progress.setAttribute("aria-label", `${translate("PREGUNTA")} ${index + 1} / ${questions.length}`);
        elements.progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;
        elements.question.textContent = question.prompt;
        elements.question.tabIndex = -1;
        refresh(elements.question);
        elements.answers.replaceChildren();

        question.order.forEach((character, answerIndex) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "personality-match-answer";
            button.dataset.personalityAnswer = String(answerIndex);
            button.textContent = question.answers[character];
            if (state.answers[index] === character) button.classList.add("is-selected");
            button.addEventListener("click", () => chooseAnswer(character));
            elements.answers.appendChild(button);
            refresh(button);
        });

        elements.back.hidden = index === 0;
        if (options.focusQuestion) elements.question.focus({ preventScroll: true });
    }

    function chooseAnswer(character) {
        if (state.transitionTimer) return;
        state.answers[state.currentQuestion] = character;
        playUiSound(0.4);
        elements.answers.querySelectorAll("button").forEach((button) => {
            button.disabled = true;
        });

        const advance = () => {
            state.transitionTimer = 0;
            if (state.currentQuestion < questions.length - 1) {
                renderQuestion(state.currentQuestion + 1, { focusQuestion: true });
            } else {
                calculateResult();
                renderResult({ playSound: true, focusResult: true });
            }
        };

        if (reducedMotion.matches) advance();
        else state.transitionTimer = window.setTimeout(advance, 150);
    }

    function calculateResult() {
        const scores = Object.fromEntries(CHARACTER_ORDER.map((character) => [character, 0]));
        state.answers.forEach((character) => {
            if (character in scores) scores[character] += 1;
        });

        const maxScore = Math.max(...Object.values(scores));
        const tied = CHARACTER_ORDER.filter((character) => scores[character] === maxScore);
        let winner = tied[0];

        if (tied.length > 1 && tied.includes(state.answers[6])) winner = state.answers[6];
        else if (tied.length > 1 && tied.includes(state.answers[0])) winner = state.answers[0];

        const secondary = Object.fromEntries(CHARACTER_ORDER.map((character) => [
            character,
            20 + Math.round((scores[character] / questions.length) * 80)
        ]));
        const winnerSecondary = secondary[winner];
        CHARACTER_ORDER.forEach((character) => {
            if (character !== winner && secondary[character] >= winnerSecondary) {
                secondary[character] = Math.max(20, winnerSecondary - 1);
            }
        });

        state.result = {
            winner,
            scores,
            secondary,
            matchPercent: 55 + Math.round((scores[winner] / questions.length) * 45)
        };
    }

    function setTranslatedText(element, value) {
        element.textContent = value;
        refresh(element);
    }

    function renderBars() {
        elements.bars.replaceChildren();
        CHARACTER_ORDER.forEach((character) => {
            const meta = characters[character];
            const percent = state.result.secondary[character];
            const row = document.createElement("div");
            row.className = "personality-match-bar-row";
            row.setAttribute("aria-label", `${translate(meta.trait)}: ${percent}% ${translate("compatibilidad")}`);

            const icon = document.createElement("img");
            icon.src = meta.icon;
            icon.alt = "";
            icon.loading = "lazy";
            icon.decoding = "async";
            icon.setAttribute("aria-hidden", "true");
            const label = document.createElement("span");
            label.className = "personality-match-bar-label";
            const name = document.createElement("strong");
            name.textContent = meta.trait;
            const mode = document.createElement("span");
            mode.textContent = meta.social;
            label.append(name, mode);
            refresh(label);
            const track = document.createElement("span");
            track.className = "personality-match-bar-track";
            track.setAttribute("aria-hidden", "true");
            const fill = document.createElement("span");
            fill.className = "personality-match-bar-fill";
            fill.style.setProperty("--pm-bar-width", `${percent}%`);
            fill.style.setProperty("--pm-bar-color", getCharacterColor(character));
            track.appendChild(fill);
            const value = document.createElement("span");
            value.textContent = `${percent}%`;
            row.append(icon, label, track, value);
            elements.bars.appendChild(row);
        });
    }

    function renderResult(options = {}) {
        if (!state.result) return;
        const meta = characters[state.result.winner];
        const color = getCharacterColor(state.result.winner);
        elements.quiz.hidden = true;
        elements.result.hidden = false;
        elements.dialog.style.setProperty("--pm-accent", color);
        elements.result.style.setProperty("--pm-accent", color);
        setTranslatedText(elements.resultTitle, meta.name);
        elements.resultTitle.tabIndex = -1;
        elements.percent.textContent = `${state.result.matchPercent}% MATCH`;
        elements.build.textContent = `BUILD // ${meta.build}`;
        setTranslatedText(elements.description, meta.description);
        setTranslatedText(elements.trait, meta.trait);
        setTranslatedText(elements.social, meta.social);
        setTranslatedText(elements.bonus, meta.bonus);
        setTranslatedText(elements.debuff, meta.debuff);
        setTranslatedText(elements.cardText, meta.cardText);
        elements.icon.src = meta.icon;
        elements.icon.alt = `${translate("Icono de resultado de")} ${meta.shortName}`;
        elements.iconLabel.textContent = `${translate("SEÑAL")} // ${translate(meta.trait)}`;
        elements.portrait.hidden = false;
        elements.portraitFallback.classList.remove("is-visible");
        elements.portrait.src = meta.image;
        elements.portrait.alt = `${translate("Ficha de resultado de")} ${meta.shortName}`;
        renderBars();
        prepareShareLinks();
        refresh(elements.result);
        if (options.playSound) playCompleteSound();
        if (options.focusResult) elements.resultTitle.focus({ preventScroll: true });
    }

    function openModal() {
        state.previousFocus = document.activeElement;
        resetState();
        elements.modal.hidden = false;
        elements.modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("personality-match-open");
        renderQuestion(0);
        elements.dialog.focus({ preventScroll: true });
        setBackgroundBlocked(true);
        playUiSound(0.5);
    }

    function closeModal() {
        if (elements.modal.hidden) return;
        clearTransition();
        hideToast();
        setBackgroundBlocked(false);
        elements.modal.setAttribute("aria-hidden", "true");
        elements.modal.hidden = true;
        document.body.classList.remove("personality-match-open");
        const focusTarget = state.previousFocus;
        resetState();
        if (focusTarget instanceof HTMLElement) focusTarget.focus({ preventScroll: true });
    }

    function goBack() {
        if (state.currentQuestion === 0 || state.transitionTimer) return;
        playUiSound(0.34);
        renderQuestion(state.currentQuestion - 1, { focusQuestion: true });
    }

    function restart() {
        resetState();
        renderQuestion(0, { focusQuestion: true });
        playUiSound(0.42);
    }

    function getFocusableElements() {
        return Array.from(elements.dialog.querySelectorAll(
            "button:not([disabled]):not([hidden]), a[href], [tabindex]:not([tabindex='-1'])"
        )).filter((element) => !element.hidden && element.getClientRects().length > 0);
    }

    function handleModalKeydown(event) {
        if (elements.modal.hidden) return;
        if (event.key === "Escape") {
            event.preventDefault();
            closeModal();
            return;
        }
        if (event.key !== "Tab") return;

        const focusable = getFocusableElements();
        if (!focusable.length) {
            event.preventDefault();
            elements.dialog.focus();
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function loadCanvasImage(url) {
        return new Promise((resolve) => {
            const image = new Image();
            const timeout = window.setTimeout(() => resolve(null), 6000);
            image.onload = () => {
                window.clearTimeout(timeout);
                resolve(image);
            };
            image.onerror = () => {
                window.clearTimeout(timeout);
                resolve(null);
            };
            image.src = url;
        });
    }

    function drawContainedImage(context, image, x, y, width, height) {
        const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        context.drawImage(image, x + ((width - drawWidth) / 2), y + height - drawHeight, drawWidth, drawHeight);
    }

    function drawCenteredImage(context, image, x, y, width, height) {
        const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        context.drawImage(image, x + ((width - drawWidth) / 2), y + ((height - drawHeight) / 2), drawWidth, drawHeight);
    }

    function drawImageFallback(context, x, y, width, height, color) {
        context.fillStyle = "#08030d";
        context.fillRect(x, y, width, height);
        context.strokeStyle = color;
        context.lineWidth = 12;
        context.strokeRect(x + 6, y + 6, width - 12, height - 12);
        context.fillStyle = color;
        context.beginPath();
        context.arc(x + (width / 2), y + (height * 0.34), width * 0.18, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.ellipse(x + (width / 2), y + (height * 0.77), width * 0.3, height * 0.25, 0, 0, Math.PI * 2);
        context.fill();
    }

    function wrapLines(context, text, maxWidth) {
        const words = String(text).split(/\s+/);
        const lines = [];
        let line = "";
        words.forEach((word) => {
            const next = line ? `${line} ${word}` : word;
            if (line && context.measureText(next).width > maxWidth) {
                lines.push(line);
                line = word;
            } else {
                line = next;
            }
        });
        if (line) lines.push(line);
        return lines;
    }

    function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines = 6) {
        const lines = wrapLines(context, text, maxWidth).slice(0, maxLines);
        lines.forEach((line, index) => context.fillText(line, x, y + (index * lineHeight)));
        return y + (lines.length * lineHeight);
    }

    function makeElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text) element.textContent = text;
        return element;
    }

    function getShareText() {
        if (!state.result) return SHARE_PAGE_URL;
        const meta = characters[state.result.winner];
        return [
            `${translate("Mi resultado en PERSONALITY_MATCH.EXE")}: ${meta.name}`,
            `${state.result.matchPercent}% ${translate("compatibilidad")}`,
            `BUILD // ${meta.build}`,
            translate("Haz tu prueba en CheatGuys!"),
            SHARE_PAGE_URL
        ].join(" // ");
    }

    function prepareShareLinks() {
        if (!state.result) return;
        const shareText = getShareText();
        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(SHARE_PAGE_URL);

        if (elements.shareWA) elements.shareWA.href = `https://api.whatsapp.com/send?text=${encodedText}`;
        if (elements.shareFB) {
            elements.shareFB.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        }
        if (elements.shareX) {
            elements.shareX.href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        }
        if (elements.shareDC) elements.shareDC.href = "https://discord.com/channels/@me";
    }

    async function copyShareText() {
        const shareText = getShareText();
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareText);
        } else {
            const textarea = document.createElement("textarea");
            textarea.value = shareText;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            textarea.remove();
        }
        showToast("[ RESULTADO COPIADO ]");
    }

    function createShareCardElement() {
        const result = state.result;
        const meta = characters[result.winner];
        const accent = getCharacterColor(result.winner);
        const card = makeElement("article", "personality-match-share-card");
        card.style.setProperty("--pm-accent", accent);
        card.style.setProperty("--pm-accent-rgb", getRgbTriplet(accent, meta.fallbackColor));
        card.setAttribute("aria-label", `${translate("Ficha de resultado de")} ${meta.shortName}`);

        const inner = makeElement("div", "personality-match-share-inner");
        const header = makeElement("header", "personality-match-share-header");
        const logo = makeElement("img", "personality-match-share-logo");
        logo.src = LOGO_PATH;
        logo.alt = "CheatGuys!";
        const system = makeElement("div", "personality-match-share-system");
        system.append(
            makeElement("strong", "", "PERSONALITY_MATCH.EXE"),
            makeElement("span", "", "INFINITY OS // DIAGNOSTIC PRINT")
        );
        const signal = makeElement("div", "personality-match-share-signal");
        const signalIcon = makeElement("img", "");
        signalIcon.src = meta.icon;
        signalIcon.alt = "";
        signal.append(signalIcon, makeElement("span", "", `ID_${meta.shortName}`));
        header.append(logo, system, signal);

        const hero = makeElement("section", "personality-match-share-hero");
        const portraitFrame = makeElement("div", "personality-match-share-portrait");
        const portrait = makeElement("img", "");
        portrait.src = meta.image;
        portrait.alt = `${translate("Ficha de resultado de")} ${meta.shortName}`;
        portraitFrame.appendChild(portrait);
        const copy = makeElement("div", "personality-match-share-copy");
        const traitChip = makeElement("div", "personality-match-share-trait");
        const traitIcon = makeElement("img", "");
        traitIcon.src = meta.icon;
        traitIcon.alt = "";
        traitChip.append(traitIcon, makeElement("strong", "", `${translate("SEÑAL")} // ${translate(meta.trait)}`));
        copy.append(
            makeElement("p", "personality-match-share-kicker", "MATCH FOUND"),
            makeElement("p", "personality-match-share-compatibility-label", "COMPATIBILIDAD"),
            makeElement("h2", "personality-match-share-name", meta.name),
            makeElement("p", "personality-match-share-percent", `${result.matchPercent}%`),
            makeElement("p", "personality-match-share-build", `BUILD // ${meta.build}`),
            traitChip,
            makeElement("p", "personality-match-share-description", translate(meta.description))
        );
        hero.append(portraitFrame, copy);

        const data = makeElement("section", "personality-match-share-data");
        [
            ["RASGO PRINCIPAL", meta.trait],
            ["MODO SOCIAL", meta.social],
            ["BONIFICACIÓN", meta.bonus],
            ["DEBUFF", meta.debuff]
        ].forEach(([label, value]) => {
            const item = makeElement("div", "");
            item.append(makeElement("span", "", translate(label)), makeElement("strong", "", translate(value)));
            data.appendChild(item);
        });

        const quote = makeElement("blockquote", "personality-match-share-quote", `// ${translate(meta.cardText)}`);
        const barsSection = makeElement("section", "");
        barsSection.appendChild(makeElement("h3", "personality-match-share-bars-title", translate("DIAGNÓSTICO DE RASGOS")));
        const bars = makeElement("div", "personality-match-share-bars");
        CHARACTER_ORDER.forEach((character) => {
            const barMeta = characters[character];
            const percent = result.secondary[character];
            const row = makeElement("div", "personality-match-share-bar");
            const barIcon = makeElement("img", "");
            barIcon.src = barMeta.icon;
            barIcon.alt = "";
            const label = makeElement("span", "");
            label.append(makeElement("strong", "", translate(barMeta.trait)), makeElement("em", "", translate(barMeta.social)));
            const track = makeElement("span", "personality-match-share-track");
            const fill = makeElement("span", "personality-match-share-fill");
            fill.style.setProperty("--pm-bar-width", `${percent}%`);
            fill.style.setProperty("--pm-bar-color", getCharacterColor(character));
            fill.style.setProperty("--pm-bar-rgb", getRgbTriplet(getCharacterColor(character), barMeta.fallbackColor));
            track.appendChild(fill);
            row.append(barIcon, label, track, makeElement("span", "", `${percent}%`));
            bars.appendChild(row);
        });
        barsSection.appendChild(bars);

        const footer = makeElement("footer", "personality-match-share-footer");
        footer.append(
            makeElement("strong", "", "cheatguys.com"),
            makeElement("span", "personality-match-share-footer-note", translate("Haz tu prueba en CheatGuys!"))
        );

        inner.append(header, hero, data, quote, barsSection, footer);
        card.appendChild(inner);
        return card;
    }

    async function waitForImages(root) {
        const images = Array.from(root.querySelectorAll("img"));
        await Promise.all(images.map((image) => {
            if (image.complete && image.naturalWidth > 0) return Promise.resolve();
            return new Promise((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = reject;
            });
        }));
    }

    async function buildDomShareCard() {
        if (document.fonts?.ready) await document.fonts.ready;
        if (typeof window.html2canvas !== "function") throw new Error("html2canvas unavailable");

        const stage = makeElement("div", "personality-match-share-stage");
        const card = createShareCardElement();
        stage.appendChild(card);
        document.body.appendChild(stage);

        try {
            await waitForImages(card);
            return window.html2canvas(card, {
                backgroundColor: null,
                height: SHARE_CARD_HEIGHT,
                logging: false,
                scale: 1,
                useCORS: false,
                width: SHARE_CARD_WIDTH,
                windowHeight: SHARE_CARD_HEIGHT,
                windowWidth: SHARE_CARD_WIDTH
            });
        } finally {
            stage.remove();
        }
    }

    async function buildCanvasShareCard() {
        if (document.fonts?.ready) {
            try {
                await document.fonts.ready;
            } catch (_error) {
                // Los fallbacks del canvas mantienen legible la tarjeta.
            }
        }

        const result = state.result;
        const meta = characters[result.winner];
        const accent = getCharacterColor(result.winner);
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1350;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas unavailable");

        const background = context.createLinearGradient(0, 0, 1080, 1350);
        background.addColorStop(0, "#07020d");
        background.addColorStop(0.52, "#17052b");
        background.addColorStop(1, "#030106");
        context.fillStyle = background;
        context.fillRect(0, 0, 1080, 1350);

        context.globalAlpha = 0.13;
        context.strokeStyle = accent;
        context.lineWidth = 2;
        for (let x = 0; x <= 1080; x += 54) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, 1350);
            context.stroke();
        }
        for (let y = 0; y <= 1350; y += 54) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(1080, y);
            context.stroke();
        }
        context.globalAlpha = 1;

        context.fillStyle = accent;
        context.fillRect(46, 42, 14, 1266);
        context.fillRect(1020, 42, 14, 1266);
        context.fillRect(72, 76, 46, 6);
        context.fillRect(72, 76, 6, 46);
        context.fillRect(962, 76, 46, 6);
        context.fillRect(1002, 76, 6, 46);
        context.fillRect(72, 1224, 46, 6);
        context.fillRect(72, 1184, 6, 46);
        context.fillRect(962, 1224, 46, 6);
        context.fillRect(1002, 1184, 6, 46);
        context.strokeStyle = "#ffffff";
        context.lineWidth = 6;
        context.strokeRect(32, 28, 1016, 1294);

        const logo = await loadCanvasImage(LOGO_PATH);
        if (logo) {
            drawCenteredImage(context, logo, 88, 70, 356, 78);
        } else {
            context.fillStyle = "#ffffff";
            context.font = "700 58px Bungee, Impact, sans-serif";
            context.fillText("CheatGuys!", 92, 112);
        }
        context.fillStyle = "#00ffff";
        context.font = "34px VT323, Consolas, monospace";
        context.fillText("INFINITY OS // PERSONALITY MATCH", 94, 178);

        const icon = await loadCanvasImage(meta.icon);
        context.fillStyle = "#0b0412";
        context.fillRect(610, 76, 118, 118);
        context.strokeStyle = accent;
        context.lineWidth = 6;
        context.strokeRect(610, 76, 118, 118);
        if (icon) drawCenteredImage(context, icon, 620, 86, 98, 98);
        else drawImageFallback(context, 620, 86, 98, 98, accent);
        context.fillStyle = accent;
        context.font = "30px VT323, Consolas, monospace";
        context.fillText(translate(meta.trait), 752, 122);
        context.fillStyle = "#ffffff";
        context.font = "24px VT323, Consolas, monospace";
        context.fillText(`${translate("SEÑAL")} // ${meta.shortName}`, 752, 156);

        context.fillStyle = accent;
        context.font = "700 144px Bungee, Impact, sans-serif";
        context.fillText(`${result.matchPercent}%`, 94, 342);
        context.fillStyle = "#ffffff";
        context.font = "700 54px Bungee, Impact, sans-serif";
        drawWrappedText(context, meta.name, 94, 408, 530, 62, 2);
        context.fillStyle = "#00ffff";
        context.font = "38px VT323, Consolas, monospace";
        context.fillText(`BUILD // ${meta.build}`, 94, 510);

        const image = await loadCanvasImage(meta.image);
        const imageX = 650;
        const imageY = 220;
        const imageWidth = 330;
        const imageHeight = 480;
        context.fillStyle = "rgba(0, 0, 0, 0.55)";
        context.fillRect(imageX, imageY, imageWidth, imageHeight);
        if (image) drawContainedImage(context, image, imageX, imageY, imageWidth, imageHeight);
        else drawImageFallback(context, imageX, imageY, imageWidth, imageHeight, accent);
        context.strokeStyle = accent;
        context.lineWidth = 8;
        context.strokeRect(imageX, imageY, imageWidth, imageHeight);

        context.fillStyle = "#ffffff";
        context.font = "700 33px Nunito, Arial, sans-serif";
        drawWrappedText(context, translate(meta.cardText), 94, 622, 510, 44, 6);

        context.fillStyle = "#00ffff";
        context.font = "30px VT323, Consolas, monospace";
        context.fillText(translate("DIAGNÓSTICO DE RASGOS"), 94, 794);

        CHARACTER_ORDER.forEach((character, index) => {
            const y = 844 + (index * 88);
            const percent = result.secondary[character];
            const trait = characters[character].trait;
            context.fillStyle = "#ffffff";
            context.font = "30px VT323, Consolas, monospace";
            context.fillText(translate(trait), 94, y + 28);
            context.fillStyle = "#130b1e";
            context.fillRect(322, y, 526, 36);
            context.fillStyle = getCharacterColor(character);
            context.fillRect(328, y + 6, 514 * (percent / 100), 24);
            context.fillStyle = "#ffffff";
            context.fillText(`${percent}%`, 874, y + 28);
        });

        context.fillStyle = accent;
        context.fillRect(94, 1200, 892, 4);
        context.fillStyle = "#ffffff";
        context.font = "700 32px Nunito, Arial, sans-serif";
        context.fillText("cheatguys.com", 94, 1260);
        context.fillStyle = "#d9d2e8";
        context.font = "28px VT323, Consolas, monospace";
        context.textAlign = "right";
        context.fillText(translate("Haz tu prueba en CheatGuys!"), 986, 1260);
        context.textAlign = "left";
        return canvas;
    }

    async function buildShareCard() {
        if (typeof window.html2canvas !== "function") return buildCanvasShareCard();
        return buildDomShareCard();
    }

    async function downloadCard() {
        if (!state.result || elements.download.disabled) return;
        hideToast();
        elements.download.disabled = true;
        elements.download.textContent = translate("[ GENERANDO TARJETA... ]");

        try {
            const canvas = await buildShareCard();
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
            if (!blob) throw new Error("PNG export failed");
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `cheatguys-personality-${state.result.winner}.png`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.requestAnimationFrame(() => URL.revokeObjectURL(url));
            playUiSound(0.5);
        } catch (error) {
            showToast("[ ERROR: NO SE PUDO GENERAR LA TARJETA ]");
            window.CG_LOG?.warn?.("PERSONALITY_MATCH export failed", error);
        } finally {
            elements.download.disabled = false;
            elements.download.textContent = translate("[ DESCARGAR TARJETA ]");
        }
    }

    async function shareNativeResult() {
        if (!state.result || !elements.nativeShare || elements.nativeShare.disabled) return;
        hideToast();
        elements.nativeShare.disabled = true;
        elements.nativeShare.textContent = translate("[ COMPARTIENDO... ]");

        try {
            const meta = characters[state.result.winner];
            const canvas = await buildShareCard();
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
            if (!blob) throw new Error("PNG share failed");
            const file = new File([blob], `cheatguys-personality-${state.result.winner}.png`, { type: "image/png" });
            const text = getShareText();
            const shareData = {
                files: [file],
                text,
                title: `PERSONALITY_MATCH.EXE // ${meta.shortName}`,
                url: SHARE_PAGE_URL
            };

            if (navigator.canShare?.({ files: [file] }) && navigator.share) {
                await navigator.share(shareData);
                playUiSound(0.5);
                return;
            }

            if (navigator.share) {
                await navigator.share({ text, title: shareData.title, url: SHARE_PAGE_URL });
                playUiSound(0.5);
                return;
            }

            await copyShareText();
        } catch (error) {
            if (error?.name !== "AbortError") {
                await copyShareText().catch(() => showToast("[ NO SE PUDO COMPARTIR ]"));
                window.CG_LOG?.warn?.("PERSONALITY_MATCH share failed", error);
            }
        } finally {
            elements.nativeShare.disabled = false;
            elements.nativeShare.textContent = translate("[ COMPARTIR TARJETA ]");
        }
    }

    function shareToDiscord(event) {
        if (!state.result) return;
        copyShareText().catch(() => showToast("[ NO SE PUDO COMPARTIR ]"));
        playUiSound(0.35);
        if (!event.currentTarget.href) event.preventDefault();
    }

    elements.start.addEventListener("click", openModal);
    elements.close.addEventListener("click", closeModal);
    elements.back.addEventListener("click", goBack);
    elements.restart.addEventListener("click", restart);
    elements.download.addEventListener("click", downloadCard);
    elements.nativeShare?.addEventListener("click", shareNativeResult);
    elements.shareDC?.addEventListener("click", shareToDiscord);
    elements.modal.addEventListener("pointerdown", (event) => {
        if (event.target === elements.modal) closeModal();
    });
    document.addEventListener("keydown", handleModalKeydown);
    elements.portrait.addEventListener("error", () => {
        elements.portrait.hidden = true;
        elements.portraitFallback.classList.add("is-visible");
    });
    window.addEventListener("cg:languagechange", (event) => {
        const nextMode = event.detail?.mode || getLanguageMode();
        if (nextMode === state.languageMode) return;
        state.languageMode = nextMode;
        if (elements.modal.hidden) return;
        if (state.result) renderResult();
        else renderQuestion(state.currentQuestion);
    });

    window.CG = window.CG || {};
    window.CG.personalityMatch = Object.freeze({
        open: openModal,
        close: closeModal
    });
})();
