// =====================================================
// LAPTOP DE AKANE - Chat interactivo con CheatGuys!
// =====================================================

(function () {
    const characters = {
        akane: {
            name: "Akane",
            fullName: "Akane Hoshizora",
            icon: "assets/icons/icon-akane.webp",
            loaderClass: "ld-akane",
            greeting: "H-Hola... seleccionaste mi app... creo que eso cuenta como iniciar dialogo."
        },
        rika: {
            name: "Rika",
            fullName: "Rika Tanaka",
            icon: "assets/icons/icon-rika.webp",
            loaderClass: "ld-rika",
            greeting: "QUE ONDA. Soy Rika. Habla rapido antes de que la laptop explote."
        },
        momo: {
            name: "Momo",
            fullName: "Momo Fujiwara",
            icon: "assets/icons/icon-momo.webp",
            loaderClass: "ld-momo",
            greeting: "Holi holi, soy Momo. Sina tambien esta leyendo contigo."
        },
        jun: {
            name: "Jun",
            fullName: "Junpei Sakamoto",
            icon: "assets/icons/icon-jun.webp",
            loaderClass: "ld-jun",
            greeting: "hey... soy jun. escribe algo si quieres, supongo."
        }
    };

    let currentCharacter = null;
    let chatHistory = [];
    let isSending = false;

    function getElements() {
        return {
            bunker: document.getElementById("laptop-bunker"),
            desktop: document.getElementById("laptopDesktop"),
            chatRoom: document.getElementById("laptopChatRoom"),
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
        chatHistory.push({ role, text });

        if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(-10);
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
        els.bunker.dataset.mode = mode;
    }

    function openChat(characterId, els) {
        const character = characters[characterId] || characters.akane;
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

    function getFriendlyErrorMessage(errorText) {
        if (/api key|gemini_api_key|gemini/i.test(errorText || "")) {
            return "La conexion con Neo Teno esta fallando por la llave de Gemini. Revisa la variable en Netlify.";
        }

        if (/quota|overloaded|503|429|unavailable|timeout|fetch/i.test(errorText || "")) {
            return "La senal con Neo Teno se saturo. Dale otro intento en unos segundos.";
        }

        return "La laptop hizo corto circuito. Intenta otra vez.";
    }

    async function sendMessage(els) {
        if (!currentCharacter || isSending) return;

        const message = els.input.value.trim();
        if (!message) return;

        els.input.value = "";
        appendMessage(els.history, message, "user");
        rememberMessage("user", message);
        setSendingState(els, true);

        const typing = createTypingIndicator(currentCharacter);
        els.history.appendChild(typing);
        scrollHistory(els.history);

        try {
            const minimumTypingTime = new Promise((resolve) => window.setTimeout(resolve, 700));
            const response = await fetch("/.netlify/functions/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mensaje: message,
                    personaje: Object.keys(characters).find((key) => characters[key] === currentCharacter) || "akane",
                    historial: chatHistory
                })
            });

            const data = await response.json().catch(() => ({}));
            await minimumTypingTime;

            typing.remove();

            if (!response.ok) {
                appendMessage(els.history, getFriendlyErrorMessage(data.error), "bot");
                return;
            }

            appendMessage(els.history, data.respuesta || "...", "bot");
            rememberMessage("model", data.respuesta || "...");
        } catch (error) {
            typing.remove();
            appendMessage(els.history, "No pude conectar con la terminal de Neo Teno. Revisa netlify dev.", "bot");
        } finally {
            setSendingState(els, false);
            els.input.focus();
        }
    }

    function setupLaptop() {
        const els = getElements();
        if (!els.bunker || !els.desktop || !els.chatRoom || !els.form) return;

        els.characterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                openChat(button.dataset.laptopCharacter, els);
            });
        });

        els.closeButton.addEventListener("click", () => closeChat(els));

        els.form.addEventListener("submit", (event) => {
            event.preventDefault();
            sendMessage(els);
        });

        setMode("desktop", els);
    }

    document.addEventListener("DOMContentLoaded", setupLaptop);
})();
