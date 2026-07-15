// =====================================================
// LAPTOP DE AKANE - Chat interactivo con CheatGuys!
// =====================================================

(function () {
    const CONFIG = window.CG_CONFIG || {};
    const CHAT_CONFIG = CONFIG.chat || {};
    const CHAT_ROUTE = CONFIG.routes?.chatFunction || "/.netlify/functions/chat";
    const ALLOWED_CHARACTERS = new Set(CHAT_CONFIG.allowedCharacters || ["akane", "rika", "momo", "jun"]);
    const MAX_MESSAGE_LENGTH = CHAT_CONFIG.maxMessageLength || 500;
    const MAX_HISTORY_ITEMS = CHAT_CONFIG.maxHistoryItems || 8;
    const REQUEST_TIMEOUT_MS = CHAT_CONFIG.requestTimeoutMs || 12000;
    const LAPTOP_SFX = CONFIG.sfx?.laptop || "assets/audio/later/laptop_akane.mp3";
    const CG_LOG = window.CG_LOG || null;

    const characters = {
        akane: {
            name: "Akane",
            fullName: "Akane Hoshizora",
            icon: "assets/icons/icon-akane.webp",
            loaderClass: "ld-akane",
            greeting: "H-Hola... seleccionaste mi app. Eso cuenta como interacción social, ¿verdad?"
        },
        rika: {
            name: "Rika",
            fullName: "Rika Tanaka",
            icon: "assets/icons/icon-rika.webp",
            loaderClass: "ld-rika",
            greeting: "¡QUÉ ONDA! Habla rápido antes de que esta laptop se rinda."
        },
        momo: {
            name: "Momo",
            fullName: "Momo Fujiwara",
            icon: "assets/icons/icon-momo.webp",
            loaderClass: "ld-momo",
            greeting: "Holi holi. Sina también está leyendo, pero no juzga."
        },
        jun: {
            name: "Jun",
            fullName: "Junpei Sakamoto",
            icon: "assets/icons/icon-jun.webp",
            loaderClass: "ld-jun",
            greeting: "hey... soy Jun. escribe algo si quieres. si no, también es válido."
        }
    };

    let currentCharacter = null;
    let chatHistory = [];
    let isSending = false;

    function getElements() {
        return {
            garage: document.getElementById("laptop-garage"),
            desktop: document.getElementById("laptopDesktop"),
            chatRoom: document.getElementById("laptopChatRoom"),
            screen: document.querySelector("#laptop-garage .laptop-screen"),
            mobileWindowClose: document.getElementById("laptopMobileWindowClose"),
            characterButtons: document.querySelectorAll("[data-laptop-character]"),
            closeButton: document.getElementById("laptopCloseChat"),
            chatAvatar: document.getElementById("chatCharacterAvatar"),
            chatName: document.getElementById("chatCharacterName"),
            chatStatus: document.getElementById("chatCharacterStatus"),
            history: document.getElementById("chat-history"),
            form: document.getElementById("laptopChatForm"),
            input: document.getElementById("chat-input"),
            sendButton: document.getElementById("chatSendButton")
        };
    }

    function scrollHistory(history) {
        if (!history) return;
        history.scrollTop = history.scrollHeight;
    }

    function createMessageBubble(text, type, character) {
        const row = document.createElement("div");
        row.className = `chat-message-row ${type}`;

        if (type === "bot") {
            const avatar = document.createElement("img");
            avatar.className = "chat-message-avatar";
            avatar.src = character.icon;
            avatar.alt = character.name;
            avatar.loading = "lazy";
            avatar.decoding = "async";
            row.appendChild(avatar);
        }

        const bubble = document.createElement("div");
        bubble.className = "chat-bubble";
        bubble.textContent = String(text || "");
        bubble.title = String(text || "");
        row.appendChild(bubble);

        return row;
    }

    function appendMessage(history, text, type) {
        if (!history || !currentCharacter) return;
        history.appendChild(createMessageBubble(text, type, currentCharacter));
        scrollHistory(history);
    }

    function rememberMessage(role, text) {
        chatHistory.push({ role, text: String(text || "").slice(0, MAX_MESSAGE_LENGTH) });

        if (chatHistory.length > MAX_HISTORY_ITEMS) {
            chatHistory = chatHistory.slice(-MAX_HISTORY_ITEMS);
        }
    }

    function createTypingIndicator(character) {
        const row = document.createElement("div");
        row.className = "chat-message-row bot laptop-typing-row";
        row.dataset.typing = "true";

        const avatar = document.createElement("img");
        avatar.className = "chat-message-avatar";
        avatar.src = character.icon;
        avatar.alt = character.name;
        avatar.loading = "lazy";
        avatar.decoding = "async";

        const bubble = document.createElement("div");
        bubble.className = "chat-bubble laptop-typing-bubble";

        const loader = document.createElement("span");
        loader.className = "loading-icons-wrapper laptop-loading-icons";
        loader.setAttribute("aria-hidden", "true");

        ["ld-akane", "ld-rika", "ld-momo", "ld-jun"].forEach((loaderClass) => {
            const dot = document.createElement("span");
            dot.className = `load-dot ${loaderClass}`;
            loader.appendChild(dot);
        });

        const text = document.createElement("span");
        text.className = "laptop-typing-text";
        text.textContent = `${character.name} esta escribiendo...`;

        bubble.appendChild(loader);
        bubble.appendChild(text);
        row.appendChild(avatar);
        row.appendChild(bubble);

        return row;
    }

    function setMode(mode, els) {
        const isChat = mode === "chat";
        els.desktop.hidden = isChat;
        els.chatRoom.hidden = !isChat;
        els.garage.dataset.mode = mode;
    }

    function openChat(characterId, els) {
        if (!ALLOWED_CHARACTERS.has(characterId)) {
            if (CG_LOG) CG_LOG.error("LAPTOP", "CG-LAPTOP-001", "Personaje no permitido.", { characterId });
            return;
        }

        const character = characters[characterId] || characters.akane;
        window.AudioManager?.unlockSfx?.();
        window.AudioManager?.playSfx?.(LAPTOP_SFX, { volume: 0.9 });
        currentCharacter = character;

        els.chatAvatar.src = character.icon;
        els.chatAvatar.alt = character.fullName;
        els.chatName.textContent = character.fullName;
        els.chatStatus.textContent = "ONLINE // CHAT-ROOM";
        els.history.innerHTML = "";
        chatHistory = [];
        setMode("chat", els);
        appendMessage(els.history, character.greeting, "bot");
        rememberMessage("model", character.greeting);
        window.setTimeout(() => els.input.focus(), 80);
    }

    function closeChat(els) {
        currentCharacter = null;
        chatHistory = [];
        isSending = false;
        els.input.value = "";
        els.history.innerHTML = "";
        els.sendButton.disabled = false;
        els.input.disabled = false;
        setMode("desktop", els);
    }

    function setSendingState(els, state) {
        isSending = state;
        els.sendButton.disabled = state;
        els.input.disabled = state;
    }

    function updateLaptopMobileScale(els) {
        if (!els.garage) return;

        if (!window.matchMedia("(max-width: 620px)").matches) {
            els.garage.style.removeProperty("--laptop-mobile-scale");
            els.garage.style.removeProperty("--laptop-mobile-height");
            return;
        }

        const scale = Math.min(1, Math.max(0.1, (window.innerWidth - 20) / 720));
        els.garage.style.setProperty("--laptop-mobile-scale", scale.toFixed(4));
        els.garage.style.setProperty("--laptop-mobile-height", `${Math.ceil((598 * scale) + 18)}px`);
    }

    function openMobileProgramWindow(els) {
        if (!els.garage) return;
        window.AudioManager?.unlockSfx?.();
        window.AudioManager?.playSfx?.(LAPTOP_SFX, { volume: 0.8 });
        els.garage.classList.add("is-mobile-program-open");
        document.body.classList.add("laptop-program-lock");
        if (els.screen) els.screen.scrollTop = 0;
        if (els.desktop) els.desktop.scrollTop = 0;
        if (els.chatRoom) els.chatRoom.scrollTop = 0;
    }

    function closeMobileProgramWindow(els) {
        if (!els.garage) return;
        els.garage.classList.remove("is-mobile-program-open");
        document.body.classList.remove("laptop-program-lock");
    }

    function getFriendlyErrorMessage(errorText) {
        return "La senal con Neo Teno se saturo. Dale otro intento en unos segundos.";
    }

    function getCurrentCharacterId() {
        return Object.keys(characters).find((key) => characters[key] === currentCharacter) || "akane";
    }

    function createTimeoutSignal() {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        return { controller, timeoutId };
    }

    async function sendMessage(els) {
        if (!currentCharacter || isSending) return;

        const message = els.input.value.trim();
        if (!message) return;
        if (message.length > MAX_MESSAGE_LENGTH) {
            appendMessage(els.history, `Mensaje demasiado largo. Maximo ${MAX_MESSAGE_LENGTH} caracteres.`, "bot");
            return;
        }

        els.input.value = "";
        appendMessage(els.history, message, "user");
        rememberMessage("user", message);
        setSendingState(els, true);

        const typing = createTypingIndicator(currentCharacter);
        els.history.appendChild(typing);
        scrollHistory(els.history);

        const { controller, timeoutId } = createTimeoutSignal();

        try {
            const minimumTypingTime = new Promise((resolve) => window.setTimeout(resolve, 700));
            const response = await fetch(CHAT_ROUTE, {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mensaje: message,
                    personaje: getCurrentCharacterId(),
                    historial: chatHistory.slice(-MAX_HISTORY_ITEMS)
                })
            });

            const data = await response.json().catch(() => ({}));
            await minimumTypingTime;

            typing.remove();

            if (!response.ok) {
                if (CG_LOG) CG_LOG.error("LAPTOP", data.code || "CG-LAPTOP-002", "Fallo la respuesta del chat.", {
                    status: response.status,
                    code: data.code
                });
                appendMessage(els.history, getFriendlyErrorMessage(data.error), "bot");
                return;
            }

            appendMessage(els.history, data.respuesta || "...", "bot");
            rememberMessage("model", data.respuesta || "...");
        } catch (error) {
            typing.remove();
            if (CG_LOG) CG_LOG.error("LAPTOP", "CG-LAPTOP-003", "No se pudo conectar con el chat.", error);
            appendMessage(els.history, getFriendlyErrorMessage(), "bot");
        } finally {
            window.clearTimeout(timeoutId);
            setSendingState(els, false);
            els.input.focus();
        }
    }

    function setupLaptop() {
        const els = getElements();
        if (!els.garage || !els.desktop || !els.chatRoom || !els.form) return;
        els.garage.dataset.ready = "true";

        updateLaptopMobileScale(els);
        if (els.input) {
            els.input.maxLength = MAX_MESSAGE_LENGTH;
        }

        els.garage.addEventListener("click", (event) => {
            const characterButton = event.target.closest?.("[data-laptop-character]");
            if (!characterButton || !els.garage.contains(characterButton)) return;
            event.preventDefault();
            event.stopPropagation();
            openChat(characterButton.dataset.laptopCharacter, els);
        });

        els.closeButton.addEventListener("click", () => closeChat(els));

        if (els.screen) {
            els.screen.addEventListener("click", (event) => {
                if (els.garage.classList.contains("is-mobile-program-open")) return;
                if (!window.matchMedia("(max-width: 620px)").matches) return;
                if (event.target.closest?.("button, a, input, textarea, select, [role='button']")) return;

                event.preventDefault();
                event.stopPropagation();
                openMobileProgramWindow(els);
            }, true);
        }

        if (els.mobileWindowClose) {
            els.mobileWindowClose.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                closeMobileProgramWindow(els);
            });
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMobileProgramWindow(els);
            }
        });

        window.addEventListener("resize", () => {
            updateLaptopMobileScale(els);
        });

        els.form.addEventListener("submit", (event) => {
            event.preventDefault();
            sendMessage(els);
        });

        setMode("desktop", els);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupLaptop);
    } else {
        setupLaptop();
    }
})();
