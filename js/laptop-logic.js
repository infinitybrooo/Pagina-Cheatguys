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
        bubble.textContent = text;
        row.appendChild(bubble);

        return row;
    }

    function appendMessage(history, text, type) {
        if (!history || !currentCharacter) return;
        history.appendChild(createMessageBubble(text, type, currentCharacter));
        scrollHistory(history);
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
        setMode("chat", els);
        appendMessage(els.history, character.greeting, "bot");
        window.setTimeout(() => els.input.focus(), 80);
    }

    function closeChat(els) {
        currentCharacter = null;
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

        return errorText || "La laptop hizo corto circuito. Intenta otra vez.";
    }

    async function sendMessage(els) {
        if (!currentCharacter || isSending) return;

        const message = els.input.value.trim();
        if (!message) return;

        els.input.value = "";
        appendMessage(els.history, message, "user");
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
                    personaje: Object.keys(characters).find((key) => characters[key] === currentCharacter) || "akane"
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
